"""Sign-up and sign-in.

Credentials are checked against the local bcrypt hash first, then Cognito, then the
dev-only `SEED_DEV_PASSWORD` fallback (see `app.services.identity`). Whichever store
answers, the caller receives the locally signed token pair that `/api/v1` routes accept.

The same handlers are also mounted under `/api/auth/*` from `app.api.routes` — that is
the prefix the web client already calls.
"""

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database.models import Users
from app.database.session import get_session
from app.schemas.auth_schemas import (
    AuthTokens,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
)
from app.schemas.generic_schemas import ErrorResponse
from app.schemas.profile_schemas import MessageResponse
from app.services import identity

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

REGISTER_RESPONSES: dict[int | str, dict[str, Any]] = {
    409: {"model": ErrorResponse, "description": "Email already registered"},
}
LOGIN_RESPONSES: dict[int | str, dict[str, Any]] = {
    401: {"model": ErrorResponse, "description": identity.INVALID_CREDENTIALS_DETAIL},
}


async def register_handler(
    body: RegisterRequest,
    session: AsyncSession,
) -> AuthTokens:
    return await identity.register_account(
        session,
        email=str(body.email),
        password=body.password,
        display_name=body.display_name,
        username=body.username,
    )


async def login_handler(body: LoginRequest, session: AsyncSession) -> AuthTokens:
    return await identity.authenticate(
        session,
        username=body.identifier(),
        password=body.password,
    )


async def refresh_handler(
    body: RefreshTokenRequest, session: AsyncSession
) -> AuthTokens:
    return await identity.refresh_tokens(session, body.refresh_token)


@router.post(
    "/register",
    summary="Register a new account",
    description=(
        "Creates the account, mirrors it into Cognito when AWS is configured, and "
        "returns a token pair so the client is signed in straight away."
    ),
    responses=REGISTER_RESPONSES,
)
async def register(
    body: RegisterRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AuthTokens:
    return await register_handler(body, session)


@router.post(
    "/login",
    summary="Log in",
    description="Exchanges an email and password for an access/refresh token pair.",
    responses=LOGIN_RESPONSES,
)
async def login(
    body: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AuthTokens:
    return await login_handler(body, session)


@router.post(
    "/refresh",
    summary="Refresh an expired access token",
    description="Exchanges a valid refresh token for a fresh access/refresh pair.",
    responses=LOGIN_RESPONSES,
)
async def refresh(
    body: RefreshTokenRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AuthTokens:
    return await refresh_handler(body, session)


@router.post(
    "/logout",
    summary="Log out",
    description=(
        "Acknowledges sign-out. Access tokens are stateless and short lived, so the "
        "client discards its pair; this exists so the app can confirm the sign-out."
    ),
    response_model=MessageResponse,
)
async def logout(
    current_user: Annotated[Users, Depends(get_current_user)],
) -> MessageResponse:
    return MessageResponse(message=f"Signed out {current_user.email}.")
