from app.services.admin_service import admin_service
from fastapi import Depends, APIRouter
from app.Models.auth_model import User
from app.api.auth import require_group
from typing import Annotated
from typing import Any
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.Models.admin_model import UserResponse

router = APIRouter()


@router.get(
    "/admin/users",
    response_model=list[UserResponse],
    summary="Get x amount of users from cognito",
    description="Send in x amount which pulls all users from cognito",
    tags=["admin"],
)
async def get_users(_: Annotated[User, Depends(require_group(20))], limit: int = 10):
    return await admin_service.get_users(limit)


@router.get(
    "/admin/users/{username}",
    response_model=UserResponse,
    summary="Get a specific userr from cognito",
    description="Use username to get user from cognito",
    tags=["admin"],
)
async def get_user(_: Annotated[User, Depends(require_group(20))], username: str):
    return await admin_service.get_user(username)


@router.post(
    "/admin/add_user_to_group",
    response_model=Any,
    summary="Add a user to a group",
    description="Admin can add a user to a specified group",
    tags=["admin"],
)
async def add_user_to_group(
    _: Annotated[User, Depends(require_group(20))], username: str, group: str = "Users"
):
    return await admin_service.add_user_to_group(username, group)


@router.delete(
    "/admin/remove_user_from_group",
    response_model=Any,
    summary="Remove a user from a specific group",
    description="Remove a user from a cognito group, can be made that he does not have a group. Use with caution",
    tags=["admin"],
)
async def remove_user_from_group(
    _: Annotated[User, Depends(require_group(20))], username: str, group: str = "Users"
):
    return await admin_service.remove_user_from_group(username, group)


@router.patch(
    "/admin/enable_user",
    response_model=Any,
    summary="Enable a user",
    description="Enable a specific user in cognito",
    tags=["admin"],
)
async def enable_user(_: Annotated[User, Depends(require_group(20))], username: str):
    return await admin_service.enable_user(username)


@router.patch(
    "/admin/disable_user",
    response_model=Any,
    summary="Disbale a user",
    description="Disable a specific user in cognito",
    tags=["admin"],
)
async def disbale_user(_: Annotated[User, Depends(require_group(20))], username: str):
    return await admin_service.disable_user(username)


@router.post(
    "/admin/set_password",
    response_model=Any,
    summary="Admin can set a users password",
    description="Admin can lookup a user in cognito and set their password",
    tags=["admin"],
)
async def set_password(
    _: Annotated[User, Depends(require_group(20))], username: str, password: str
):
    return await admin_service.set_password(username, password)


@router.post(
    "/admin/sign_out",
    response_model=Any,
    summary="Admin can sign out a user",
    description="Admin can sign out a user globally making all his refresh tokens expired",
    tags=["admin"],
)
async def user_global_sign_out(
    _: Annotated[User, Depends(require_group(20))], username: str
):
    return await admin_service.user_global_sign_out(username)


@router.post(
    "/admin/create_user",
    response_model=Any,
    summary="Admin can create a user",
    description="AAdmin can create a user and give him a temp password the user has to change later",
    tags=["admin"],
)
async def create_user(
    _: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    username: str,
    email: str,
    temp_pass: str = "TempPass@123",
):
    return await admin_service.create_user(session, username, email, temp_pass)


@router.delete(
    "/admin/delete_user",
    response_model=Any,
    summary="Delete a user",
    description="Delete a user from cognito. Permanent delete. No undo",
    tags=["admin"],
)
async def delete_user(
    _: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    username: str,
    sub: str,
):
    return await admin_service.delete_user(session, username, sub)


@router.post(
    "/admin/create_group",
    response_model=Any,
    summary="Admin can create a group",
    description="Admin can create a new group which can be used in rbac",
    tags=["admin"],
)
async def create_group(
    _: Annotated[User, Depends(require_group(20))],
    group_name: str,
    precedence: int,
    description: str,
):
    return await admin_service.create_group(group_name, precedence, description)


@router.delete(
    "/admin/remove_group",
    response_model=Any,
    summary="Delete a group",
    description="Delete a cognito group. Use with caution",
    tags=["admin"],
)
async def delete_group(_: Annotated[User, Depends(require_group(20))], group_name: str):
    return await admin_service.delete_group(group_name)


@router.put(
    "/admin/update_group_attr",
    response_model=Any,
    summary="Update a groups attributes",
    description="Update agroups precedence and description",
    tags=["admin"],
)
async def update_group_attr(
    _: Annotated[User, Depends(require_group(20))],
    group_name: str,
    precedence: int,
    description: str,
):
    return await admin_service.update_group_attr(group_name, precedence, description)
