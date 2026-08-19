from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.Models.admin_model import PlatformSettingsResponse, Response, UserResponse
from app.Models.auth_model import User
from app.api.auth import require_group
from app.database.session import get_session
from app.services.admin_matches_service import admin_service

router = APIRouter(tags=["admin"])


# User management routes
@router.get(
    "/admin/users",
    response_model=list[UserResponse],
    summary="Get all users from cognito",
    description="Fetch all users from cognito with roles",
)
async def get_users(
    _: Annotated[User, Depends(require_group(20))],
    limit: int = 10,
):
    return await admin_service.get_users(limit)


@router.get(
    "/admin/users/{username}",
    response_model=UserResponse,
    summary="Get a specific user from cognito",
    description="Use username to get user from cognito",
)
async def get_user(
    _: Annotated[User, Depends(require_group(20))],
    username: str,
):
    return await admin_service.get_user(username)


@router.post(
    "/admin/add_user_to_group",
    response_model=Response,
    summary="Add a user to a group",
    description="Admin can add a user to a specified group",
)
async def add_user_to_group(
    _: Annotated[User, Depends(require_group(20))],
    username: str,
    group: str = "User",
):
    return await admin_service.add_user_to_group(username, group)


@router.delete(
    "/admin/remove_user_from_group",
    response_model=Response,
    summary="Remove a user from a specific group",
    description="Remove a user from a cognito group. Use with caution",
)
async def remove_user_from_group(
    _: Annotated[User, Depends(require_group(20))],
    username: str,
    group: str = "User",
):
    return await admin_service.remove_user_from_group(username, group)


@router.patch(
    "/admin/enable_user",
    response_model=Response,
    summary="Enable a user",
    description="Enable a specific user in cognito",
)
async def enable_user(
    _: Annotated[User, Depends(require_group(20))],
    username: str,
):
    return await admin_service.enable_user(username)


@router.patch(
    "/admin/disable_user",
    response_model=Response,
    summary="Disable a user",
    description="Disable a specific user in cognito",
)
async def disable_user(
    _: Annotated[User, Depends(require_group(20))],
    username: str,
):
    return await admin_service.disable_user(username)


@router.post(
    "/admin/sign_out",
    response_model=Response,
    summary="Admin can sign out a user",
    description="Admin can sign out a user globally making all his refresh tokens expired",
)
async def user_global_sign_out(
    _: Annotated[User, Depends(require_group(20))],
    username: str,
):
    return await admin_service.user_global_sign_out(username)


@router.post(
    "/admin/create_user",
    response_model=UserResponse,
    summary="Admin can create a user",
    description="Admin can create a user and give him a temp password the user has to change later",
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
    response_model=Response,
    summary="Delete a user",
    description="Delete a user from cognito. Permanent delete. No undo",
)
async def delete_user(
    _: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    username: str,
    sub: str,
):
    return await admin_service.delete_user(session, username, sub)


# Platform settings routes
@router.get(
    "/admin/platform-settings",
    response_model=PlatformSettingsResponse,
    summary="Get platform settings",
    description="Return current platform settings like registration toggle",
)
async def get_platform_settings(
    _: Annotated[User, Depends(require_group(20))],
):
    return await admin_service.get_platform_settings()


@router.put(
    "/admin/platform-settings/registrations-open",
    response_model=PlatformSettingsResponse,
    summary="Set registration open/closed",
    description="Toggle whether public registration is allowed",
)
async def set_registrations_open(
    _: Annotated[User, Depends(require_group(20))],
    open_: bool,
):
    return await admin_service.set_registrations_open(open_)
