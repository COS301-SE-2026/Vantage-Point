#todo
#register, login, logout, confirm(email)

from app.services import auth_service
from app.Models.auth_model import User
from fastapi import APIRouter
from typing import Any

router = APIRouter()

@router.post(
    "/register",
    response_model=[str, Any],
    summary="Register a new user",
    description="Creates a new cognito user and sends a verification code using cognito",
    tags=["Auth"],
    responses={
        400: {"description": "Username already exists or invalid password"}
    },
)
async def register(user: User):
    return await auth_service.register_user(user)

@router.post(
        "/login",
        response_model=User,
        summary="Login a user",
        description="Login a cognito user",
        tags=["Auth"],
        responses={
            400 : {"description": "User does not exist"},
        },
)
async def login(username: str, password: str):
    return await auth_service.login_user(username, password)
    
async def confirm_user(username: str, code: str):
    return await auth_service.confirm_user(username, code)

async def logout(access_token: str):
    return await auth_service.logout_user(access_token)