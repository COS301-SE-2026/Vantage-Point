# Auth is handled via AWS Cognito.
# See app/api/routes.py for /auth/register, /auth/login, /auth/confirm, /auth/logout.
# So almost all of this file is deprecated/deleted because we don't use it anymore,
# it is removed and not commented out due to sonarqube secuirty concerns

<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.auth.jwt import create_access_token, create_refresh_token, verify_refresh_token
from app.auth.passwords import hash_password, verify_password
from app.database.models import Users
from app.database.session import get_session
from app.Models.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
=======
from fastapi import APIRouter
>>>>>>> origin/dev

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
