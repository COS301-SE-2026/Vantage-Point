from app.services import auth_service
from fastapi import APIRouter
from typing import Any

router = APIRouter()


@router.post(
    "/register",
    response_model=dict[str, Any],
    summary="Register a new user",
    description="Creates a new cognito user and sends a verification code using cognito",
    tags=["Auth"],
    responses={400: {"description": "Username already exists or invalid password"}},
)
async def register(username: str, password: str, email: str):
    return await auth_service.register_user(username, password, email)


# returns tokens. Not a user
@router.post(
    "/login",
    response_model=Any,
    summary="Login a user",
    description="Login a cognito user",
    tags=["Auth"],
    responses={
        400: {"description": "User does not exist"},
    },
)
async def login(username: str, password: str):
    return await auth_service.login_user(username, password)


@router.post(
    "/confim-user",
    response_model=dict[str, str],
    summary="Confirm user account",
    description="Confirms a user in cognito pool. Verifies email bny taking in code",
    tags=["Auth"],
    responses={400: {"description": "Invalid code"}},
)
async def confirm_user(username: str, code: str):
    return await auth_service.confirm_user(username, code)


@router.post(
    "/logout",
    response_model=dict[str, str],
    summary="Logout a user",
    description="Logout a user globally",
    tags=["Auth"],
)
async def logout(access_token: str):
    return await auth_service.logout_user(access_token)
