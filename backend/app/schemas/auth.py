from pydantic import BaseModel, EmailStr, Field
from typing import Callable
from fastapi import Depends, HTTPException, status
from app.auth.deps import get_current_user


class RegisterRequest(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


def require_group(allowed_group: str) -> Callable:
    """FastAPI dependency to enforce role/group-based access control."""

    async def dependency(current_user: dict = Depends(get_current_user)) -> dict:
        # Adjust 'cognito:groups' or 'groups' to match your JWT payload structure
        user_groups = current_user.get("cognito:groups", [])
        if allowed_group not in user_groups:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not belong to required group: '{allowed_group}'",
            )
        return current_user

    return dependency
