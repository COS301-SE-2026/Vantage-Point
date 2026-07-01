from app.services.admin_service import admin_service
from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from typing import Any

router = APIRouter()

@router.get(
        "/admin/users",
        response_model=dict[str, str],
        summary="Get x amount of users from cognito",
        description="Send in x amount which pulls all users from cognito",
        tags=["admin"]
)
async def get_users(limit: int = 10):
    return await admin_service.get_users(limit)

@router.get(
        "/admin/user/{username}",
        response_model=dict[str, str],
        summary="Get a specific userr from cognito",
        description="Use username to get user from cognito",
        tags=["admin"]
)
async def get_user(username: str):
    return await admin_service.get_user(username)

@router.post(
        "/admin/add_user_to_group",
        response_model=Any,
        summary="Add a user to a group",
        description="Admin can add a user to a specified group",
        tags=["admin"]
)
async def add_user_to_group(username:str, group: str= "Users"):
    return await admin_service.add_user_to_group(username, group)

async def remove_user_from_group(username: str, group: str="Users"):
    return await admin_service.remove_user_from_group(username, group)

async def enable_user(username: str):
    return await admin_service.enable_user(username)

async def disbale_user(username: str):
    return await admin_service.disable_user(username)

@router.post(
        "/admin/set_password",
        response_model=Any,
        summary="Admin can set a users password",
        description="Admin can lookup a user in cognito and set their password",
        tags=["admin"]
)
async def set_password(username: str, password: str):
    return await admin_service.set_password(username, password)

@router.post(
        "/admin/sign_out",
        response_model=Any,
        summary="Admin can sign out a user",
        description="Admin can sign out a user globally making all his refresh tokens expired",
        tags=["admin"]
)
async def user_global_sign_out(username: str):
    return await admin_service.user_global_sign_out(username)

@router.post(
        "/admin/create_user",
        response_model=Any,
        summary="Admin can create a user",
        description="AAdmin can create a user and give him a temp password the user has to change later",
        tags=["admin"]
)
async def create_user(username: str, email: str, temp_pass: str="TempPass@123"):
    return await admin_service.create_user(username, email, temp_pass)

async def delete_user(username: str):
    return await admin_service.delete_user(username)

@router.post(
        "/admin/create_group",
        response_model=Any,
        summary="Admin can create a group",
        description="Admin can create a new group which can be used in rbac",
        tags=["admin"]
)
async def create_group(group_name: str, precedence: int, description: str):
    return await admin_service.create_group(group_name, precedence, description)

async def delete_group(group_name: str):
    return await admin_service.delete_group(group_name)

async def update_group_attr(group_name: str, precedence: int, description: str):
    return await admin_service.update_group_attr(group_name, precedence, description)