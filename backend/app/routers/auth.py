from typing import Any

from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.api.auth import get_jwks, get_public_key
from app.schemas.auth_schemas import (
    AuthTokens,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
)
from app.schemas.generic_schemas import ErrorResponse
from app.services import identity

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


# Shared OpenAPI failure shapes. The `/api/auth/*` aliases in app/api/routes.py document
# themselves with these so both prefixes describe the same contract.
REGISTER_RESPONSES: dict[int | str, dict[str, Any]] = {
    409: {"model": ErrorResponse, "description": "That email is already registered"},
    422: {"model": ErrorResponse, "description": "Payload failed validation"},
}

LOGIN_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {"model": ErrorResponse, "description": identity.INVALID_CREDENTIALS_DETAIL},
}


# The handlers below hold the implementation shared by `/api/auth/*` and `/api/v1/auth/*`
# so the two prefixes can never drift apart. They deliberately stay free of routing
# decorators, so each router wraps them with its own path and documentation.
async def register_handler(body: RegisterRequest, session: AsyncSession) -> AuthTokens:
    if body.confirm_password is not None and body.confirm_password != body.password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Passwords do not match.",
        )

    return await identity.register_account(
        session,
        email=body.email,
        password=body.password,
        display_name=body.display_name,
        username=body.username,
    )


async def login_handler(body: LoginRequest, session: AsyncSession) -> AuthTokens:
    identifier = body.identifier()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide a username or an email address.",
        )

    return await identity.authenticate(
        session,
        username=identifier,
        password=body.password,
    )


async def refresh_handler(
    body: RefreshTokenRequest, session: AsyncSession
) -> AuthTokens:
    return await identity.refresh_tokens(session, body.refresh_token)


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
