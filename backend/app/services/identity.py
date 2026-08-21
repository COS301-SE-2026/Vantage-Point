"""Account creation and sign-in for the tokens the `/api/v1` routes actually accept.

Every `/api/v1/*` route resolves its caller through `app.auth.deps.get_current_user`,
which looks the subject of a locally-signed HS256 token up in the `Users` table. Cognito
hands out its own tokens signed by AWS, so a raw Cognito token is rejected by all of them.

This module is the bridge: whichever credential store verifies the password (local bcrypt
hash, Cognito, or the dev fallback), the caller ends up with a `Users` row and a locally
signed token pair that the rest of the API understands.
"""

import logging
import os
import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.auth.passwords import hash_password, verify_password
from app.config import get_settings
from app.database.models import Users
from app.schemas.auth_schemas import AuthTokens

logger = logging.getLogger("app.auth")
settings = get_settings()

# Deliberately identical for every failure mode so the response cannot be used to
# tell "no such user" apart from "wrong password".
INVALID_CREDENTIALS_DETAIL = "Invalid username or password"


def cognito_username(email: str, username: str | None = None) -> str:
    """A Cognito-safe username derived from the email local part.

    A pool with the email alias enabled rejects a sign-up whose username looks like an
    email address, so "ada.lovelace@example.com" is registered as "ada_lovelace". The
    alias still lets the account sign in with the full email afterwards.
    """
    if username and "@" not in username:
        return username
    local_part = email.split("@")[0]
    safe = "".join(char if char.isalnum() else "_" for char in local_part)
    return safe.strip("_")[:50] or "player"


def cognito_configured() -> bool:
    return bool(
        settings.cognito_client_id
        and settings.cognito_client_secret
        and settings.cognito_user_pool_id
    )


def issue_tokens(user: Users) -> AuthTokens:
    return AuthTokens(
        access_token=create_access_token(user.cognito_sub),
        refresh_token=create_refresh_token(user.cognito_sub),
        token_type="bearer",
    )


async def get_user_by_email(session: AsyncSession, email: str) -> Users | None:
    result = await session.execute(
        select(Users).where(col(Users.email) == email.strip().lower())
    )
    return result.scalar_one_or_none()


async def get_user_by_subject(session: AsyncSession, subject: str) -> Users | None:
    result = await session.execute(
        select(Users).where(col(Users.cognito_sub) == subject)
    )
    return result.scalar_one_or_none()


async def ensure_user(
    session: AsyncSession,
    *,
    email: str,
    display_name: str | None = None,
    external_sub: str | None = None,
    password: str | None = None,
) -> Users:
    """Fetch the `Users` row for an email, creating it if this is a first sign-in.

    The row is keyed by email rather than by the Cognito sub so that an account which
    already exists locally keeps working after a Cognito pool is rebuilt. The local
    primary key stays the token subject either way.
    """
    normalized = email.strip().lower()
    user = await get_user_by_email(session, normalized)

    if user is None:
        user = Users(
            cognito_sub=external_sub or f"local-{uuid.uuid4()}",
            email=normalized,
            display_name=(display_name or "").strip() or None,
        )

    if display_name and not user.display_name:
        user.display_name = display_name.strip()
    if password:
        user.password_hash = hash_password(password)

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def register_account(
    session: AsyncSession,
    *,
    email: str,
    password: str,
    display_name: str | None,
    username: str | None = None,
) -> AuthTokens:
    """Create the account locally, mirror it into Cognito when AWS is configured."""
    normalized = email.strip().lower()

    if await get_user_by_email(session, normalized) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        )

    external_sub: str | None = None
    if cognito_configured():
        external_sub = await _register_with_cognito(
            username=cognito_username(normalized, username),
            password=password,
            email=normalized,
        )

    user = await ensure_user(
        session,
        email=normalized,
        display_name=display_name,
        external_sub=external_sub,
        password=password,
    )
    return issue_tokens(user)


async def _register_with_cognito(
    *, username: str, password: str, email: str
) -> str | None:
    """Best-effort Cognito sign-up. Returns the Cognito sub when AWS hands one back.

    A Cognito outage or a missing AWS credential must not block registration: the local
    bcrypt hash is enough to sign in with, so failures here are logged and swallowed.
    """
    from app.services import auth_service

    try:
        response = await auth_service.register_user(username, password, email)
    except HTTPException as exc:
        if exc.status_code == 400 and "exist" in str(exc.detail).lower():
            return None
        logger.warning(
            "Cognito sign-up unavailable, continuing locally: %s", exc.detail
        )
        return None
    except Exception as exc:  # boto3 credential/network errors
        logger.warning("Cognito sign-up unavailable, continuing locally: %s", exc)
        return None

    sub = response.get("UserSub") if hasattr(response, "get") else None
    return str(sub) if sub else None


async def authenticate(
    session: AsyncSession,
    *,
    username: str,
    password: str,
) -> AuthTokens:
    """Verify credentials against the local hash, then Cognito, then the dev fallback."""
    normalized = username.strip().lower()
    user = await get_user_by_email(session, normalized)

    if user and user.password_hash and verify_password(password, user.password_hash):
        return issue_tokens(user)

    if cognito_configured():
        cognito_user = await _authenticate_with_cognito(
            session, username=username.strip(), password=password, email=normalized
        )
        if cognito_user:
            return issue_tokens(cognito_user)

    seed_password = os.getenv("SEED_DEV_PASSWORD", "")
    if seed_password and user and password == seed_password:
        return issue_tokens(user)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=INVALID_CREDENTIALS_DETAIL,
    )


async def _authenticate_with_cognito(
    session: AsyncSession,
    *,
    username: str,
    password: str,
    email: str,
) -> Users | None:
    from app.services import auth_service

    try:
        result = await auth_service.login_user(username, password)
    except HTTPException:
        return None
    except Exception as exc:  # boto3 credential/network errors
        logger.warning("Cognito login unavailable: %s", exc)
        return None

    if "error" in result:
        return None

    claims = await _cognito_id_token_claims(str(result.get("IdToken", "")))
    return await ensure_user(
        session,
        email=str(claims.get("email") or email),
        display_name=None,
        external_sub=str(claims.get("sub")) if claims.get("sub") else None,
    )


async def _cognito_id_token_claims(id_token: str) -> dict[str, object]:
    """Verify a Cognito ID token against the pool JWKS and return its claims."""
    if not id_token:
        return {}

    from jose import JWTError, jwt

    from app.api.auth import get_jwks, get_public_key

    try:
        jwks = await get_jwks()
        public_key = get_public_key(id_token, jwks)
        issuer = (
            f"https://cognito-idp.{settings.aws_region}.amazonaws.com/"
            f"{settings.cognito_user_pool_id}"
        )
        claims: dict[str, object] = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=settings.cognito_client_id,
            issuer=issuer,
        )
        return claims
    except (JWTError, HTTPException) as exc:
        logger.warning("Could not verify Cognito ID token: %s", exc)
        return {}
    except Exception as exc:  # network failure reaching the JWKS endpoint
        logger.warning("Could not reach Cognito JWKS: %s", exc)
        return {}


async def refresh_tokens(session: AsyncSession, refresh_token: str) -> AuthTokens:
    subject = verify_refresh_token(refresh_token)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = await get_user_by_subject(session, subject)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    return issue_tokens(user)
