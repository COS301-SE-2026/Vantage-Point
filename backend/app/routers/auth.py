from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import get_settings
from app.api.auth import get_jwks, get_public_key

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


# Auth is handled via AWS Cognito.
# These are some helper functions for token validation
# and error mitigation.
async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    issuer = (
        f"https://cognito-idp.{settings.aws_region}.amazonaws.com/"
        f"{settings.cognito_user_pool_id}"
    )

    try:
        jwks = await get_jwks()
        public_key = get_public_key(token, jwks)

        # Verify signature + issuer. Skip audience hard-check for access tokens.
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=issuer,
            options={"verify_aud": False},
        )

        token_use = payload.get("token_use")
        if token_use != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token_use",
                headers={"WWW-Authenticate": "Bearer"},
            )

        client_id = payload.get("client_id") or payload.get("aud")
        if client_id != settings.cognito_client_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token client mismatch",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return str(user_id)

    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
