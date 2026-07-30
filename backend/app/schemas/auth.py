from typing import Callable
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.auth.deps import get_current_user
from app.Models.profile_schemas import User


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


# 1. Define ConfirmRequest first
class ConfirmRequest(BaseModel):
    username: str
    confirmation_code: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# 2. Assign aliases AFTER the classes exist
UserRegister = RegisterRequest
UserLogin = LoginRequest
UserConfirm = ConfirmRequest


def require_group(allowed_group: str | int) -> Callable:
    """FastAPI dependency to enforce role/group-based access control."""
    target_group = str(allowed_group)

    def dependency(payload: dict = Depends(get_current_user)) -> User:
        user_groups = [str(g) for g in payload.get("cognito:groups", [])]

        if target_group not in user_groups:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not belong to required group: '{target_group}'",
            )

        return User(
            sub=str(payload.get("sub")),
            email=str(payload.get("email", "")),
        )

    return dependency
