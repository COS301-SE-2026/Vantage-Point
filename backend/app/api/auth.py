from jose import jwt, JWTError
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials #OAuth2PasswordBearer
from app.config import get_settings
from typing import Any, cast, Annotated
from app.Models.profile_schemas import User


settings = get_settings()
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
oauth2_scheme = HTTPBearer()

# Cache keys to avoid hitting AWS on every single request
#need to make it not sterile. Will do later.
jwks_cache: dict[str, Any] | None = None


async def get_jwks() -> dict[str, Any]:
    global jwks_cache

    if jwks_cache is not None:
        return jwks_cache

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

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Matching public key not found",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(credential: HTTPAuthorizationCredentials = Depends(oauth2_scheme)) -> User:
    global jwks_cache
    issuer = f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}"

    try:
        token = credential.credentials
        jwks = await get_jwks()
        public_key = get_public_key(token, jwks)

        # 2. Decode and verify the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.cognito_client_id,
            issuer=issuer,
        )

        #ensure we only get access tokens in and raise exception if we receive id token
        if (payload["token_use"] != "access"):
            raise HTTPException(
                status_code=401,
                detail="Wrong Token sent in header."
            )
        #add username as well in return over here
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Token missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )
        #need to chnage all annotated that used str. Either to Any or Create a model for it.
        return User(
            sub=payload["sub"],
            groups=payload.get("cognito:groups",[]),
            username=payload.get("username"),
            email=payload.get("email")
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

role_levels = {
    "User": 10,
    "Admin": 20
}
#idea behind this is to allow admin to use user also without specifying as it will make the endpoint roles a lot easier and less to manage
def get_user_highest_level(user: User):
    #get highest level user has. Admin then user
    return max(
        (role_levels.get(group, 0)
        for group in user.groups), default=0
    )

def require_group(required_value: int):
    def checker(user: Annotated[Any, Depends(get_current_user)]):
        user_level = get_user_highest_level(user)
        if (user_level >= required_value):
            return user
        else:
            raise HTTPException(
                status_code=403,
                detail=f"Invalid Permission {user.groups}"
            )
    return checker
