from typing import Any, Annotated, cast
from jose import jwt, JWTError
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import get_settings
from app.Models.profile_schemas import User

settings = get_settings()

# Use HTTPBearer over OAuth2PasswordBearer as it handles authorization headers cleanly
# in client applications communicating with AWS Cognito.
oauth2_scheme = HTTPBearer()

# Cache keys to avoid hitting AWS on every single request
jwks_cache: dict[str, Any] | None = None


async def fetch_jwks_from_aws() -> dict[str, Any]:
    """Force-fetches the latest JWKS from AWS Cognito."""
    global jwks_cache
    issuer = (
        f"https://cognito-idp.{settings.aws_region}.amazonaws.com/"
        f"{settings.cognito_user_pool_id}"
    )
    jwks_url = f"{issuer}/.well-known/jwks.json"

    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        response.raise_for_status()

    jwks: dict[str, Any] = response.json()
    jwks_cache = jwks
    return jwks


async def get_jwks(force_refresh: bool = False) -> dict[str, Any]:
    """Gets cached JWKS or pulls fresh keys if expired or missing."""
    global jwks_cache
    if jwks_cache is not None and not force_refresh:
        return jwks_cache
    return await fetch_jwks_from_aws()


def get_public_key(token: str, jwks: dict[str, Any]) -> dict[str, Any]:
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token header",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    token_kid = header.get("kid")
    if not token_kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing key ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    raw_keys = jwks.get("keys", [])
    if not isinstance(raw_keys, list):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWKS format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    keys = cast(list[dict[str, Any]], raw_keys)
    for key in keys:
        if key.get("kid") == token_kid:
            return key

    raise KeyError("Matching public key not found")


async def get_current_user(
    credential: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> User:
    global jwks_cache
    issuer = f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}"
    token = credential.credentials

    try:
        jwks = await get_jwks()
        try:
            public_key = get_public_key(token, jwks)
        except KeyError:
            # If the kid wasn't found, Cognito may have rotated keys.
            # Refresh the cache and try locating the key one more time.
            jwks = await get_jwks(force_refresh=True)
            public_key = get_public_key(token, jwks)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.cognito_client_id,
            issuer=issuer,
        )

        # Security check: Ensure we do not accept ID tokens where access tokens are expected
        if payload.get("token_use") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Wrong Token type sent in header.",
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Construct the User schema matching HEAD's requirements
        return User(
            sub=payload["sub"],
            groups=payload.get("cognito:groups", []),
            username=payload.get("username"),
            email=payload.get("email"),
        )

    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not fetch Cognito public keys",
        ) from exc


# --- Role-Based Access Control ---

role_levels = {"User": 10, "Admin": 20}


def get_user_highest_level(user: User) -> int:
    """Finds the highest permission scale numerical value for the user's groups."""
    return max((role_levels.get(group, 0) for group in user.groups), default=0)


def require_group(required_value: int):
    """Dependency factory checking if the validated user possesses sufficient privileges."""

    def checker(user: Annotated[User, Depends(get_current_user)]) -> User:
        user_level = get_user_highest_level(user)
        if user_level >= required_value:
            return user
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Invalid Permission. Required level {required_value}, user has {user_level}.",
            )

    return checker
