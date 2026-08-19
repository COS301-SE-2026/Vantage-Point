import asyncio
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.Models.admin_model import (
    CreateGroupResponse,
    PlatformSettingsResponse,
    Response,
    UserResponse,
)
from app.config import get_settings
from app.database.models import Users

settings = get_settings()

# App-level toggle for (public registration on/off).
# get_platform_settings at the end or near end for why this isn't a DB table. 
# Having a new table would be easier for me to make this file but long term it would be problematic to handle for multiple instances of the backend. 
# So I am going to keep it in memory for now. Hopefully when discussing with dev ops we can come up with a better solution for the deployment
_registrations_open: bool = True

# AWS Cognito IDP client (server-side only)
client = boto3.client("cognito-idp", region_name=settings.aws_region)


# Role / group helpers below for backend
# These MUST match the actual Cognito group names and the role_levels
# dictionary in app/api/auth.py.

GROUP_PRIORITY = {
    "User": 1,
    "Admin": 2,
    "SuperAdmin": 3,
}

USER_NOT_FOUND = "User not found"
INVALID_USERNAME = "Invalid username"


def _highest_priority_group(groups: list[str] | None) -> str | None:
    #Return the group with the highest priority from a list of groups
    if not groups:
        return None
    recognized = [g for g in groups if g in GROUP_PRIORITY]
    if not recognized:
        return None
    return max(recognized, key=lambda g: GROUP_PRIORITY[g])


async def _list_all_users() -> list[dict[str, Any]]:
    #Fetch all users from Cognito with pagination
    users: list[dict[str, Any]] = []
    pagination_token: str | None = None

    while True:
        if pagination_token:
            response = await asyncio.to_thread(
                client.list_users,
                UserPoolId=settings.cognito_user_pool_id,
                Limit=60,
                PaginationToken=pagination_token,
            )
        else:
            response = await asyncio.to_thread(
                client.list_users,
                UserPoolId=settings.cognito_user_pool_id,
                Limit=60,
            )

        users.extend(response.get("Users", []))
        pagination_token = response.get("PaginationToken")
        if not pagination_token:
            break

    return users


async def _list_users_in_group(group_name: str) -> list[dict[str, Any]]:
    #Fetch all users in a group with pagination
    users: list[dict[str, Any]] = []
    pagination_token: str | None = None

    while True:
        if pagination_token:
            response = await asyncio.to_thread(
                client.list_users_in_group,
                UserPoolId=settings.cognito_user_pool_id,
                GroupName=group_name,
                Limit=60,
                PaginationToken=pagination_token,
            )
        else:
            response = await asyncio.to_thread(
                client.list_users_in_group,
                UserPoolId=settings.cognito_user_pool_id,
                GroupName=group_name,
                Limit=60,
            )

        users.extend(response.get("Users", []))
        pagination_token = response.get("PaginationToken")
        if not pagination_token:
            break

    return users


class admin_service:
    @staticmethod
    async def get_users(limit: int = 10) -> list[UserResponse]:

        # Fetch all Cognito users paginated and enrich each with their role.
        # The limit parameter is ignored, we fetch all users.

        try:
            #First Fetch all users
            users_data = await _list_all_users()

            # Then Build username, highest-priority group map
            user_role_map: dict[str, str] = {}

            for group_name in ["User", "Admin", "SuperAdmin"]:
                members = await _list_users_in_group(group_name)
                for member in members:
                    username = member.get("Username")
                    if not username:
                        continue

                    # Assign the highest priority group if already present
                    current = user_role_map.get(username)
                    if current is None or GROUP_PRIORITY.get(
                        group_name, 0
                    ) > GROUP_PRIORITY.get(current, 0):
                        user_role_map[username] = group_name

            # Then Build response list
            users: list[UserResponse] = []
            for user in users_data:
                attributes: dict[str, Any] = {
                    attr["Name"]: attr.get("Value", "")
                    for attr in user.get("Attributes", [])
                }
                username = user.get("Username", "")
                users.append(
                    UserResponse(
                        username=username,
                        email=attributes.get("email", ""),
                        sub=attributes.get("sub", ""),
                        user_created_date=user.get("UserCreateDate", datetime.now()),
                        user_last_modified_date=user.get(
                            "UserLastModifiedDate", datetime.now()
                        ),
                        enabled=user.get("Enabled", True),
                        user_status=user.get("UserStatus", ""),
                        role=user_role_map.get(username),
                    )
                )

            return users

        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail=USER_NOT_FOUND)
            if error_code == "InvalidParameterException":
                raise HTTPException(status_code=422, detail=INVALID_USERNAME)
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def get_user(username: str) -> UserResponse:
        # Fetch a single user and include their role
        try:
            #First Get user
            response = await asyncio.to_thread(
                client.admin_get_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )
            attributes = {
                attr["Name"]: attr.get("Value") for attr in response["UserAttributes"]
            }

            # Then Get user's groups
            groups_response = await asyncio.to_thread(
                client.admin_list_groups_for_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )
            group_names = [
                g.get("GroupName", "") for g in groups_response.get("Groups", [])
            ]
            role = _highest_priority_group(group_names)

            return UserResponse(
                username=response["Username"],
                email=attributes.get("email", ""),
                sub=attributes.get("sub", ""),
                user_created_date=response["UserCreateDate"],
                user_last_modified_date=response["UserLastModifiedDate"],
                enabled=response["Enabled"],
                user_status=response["UserStatus"],
                role=role,
            )

        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail=USER_NOT_FOUND)
            if error_code == "InvalidParameterException":
                raise HTTPException(status_code=422, detail=INVALID_USERNAME)
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def add_user_to_group(username: str, group: str = "User") -> Response:
        try:
            await asyncio.to_thread(
                client.admin_add_user_to_group,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                GroupName=group,
            )
            return Response(success=True, message=f"Added {username} to {group}")
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail="User not found.")
            if error_code == "ResourceNotFoundException":
                raise HTTPException(
                    status_code=400, detail="The specified group was not found."
                )
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def remove_user_from_group(username: str, group: str = "User") -> Response:
        try:
            await asyncio.to_thread(
                client.admin_remove_user_from_group,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                GroupName=group,
            )
            return Response(success=True, message=f"Removed {username} from {group}")
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def disable_user(username: str) -> Response:
        try:
            await asyncio.to_thread(
                client.admin_disable_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )
            return Response(success=True, message=f"Disabled {username}")
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def enable_user(username: str) -> Response:
        try:
            await asyncio.to_thread(
                client.admin_enable_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )
            return Response(success=True, message=f"Enabled {username}")
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)


    @staticmethod
    async def user_global_sign_out(username: str) -> Response:
        try:
            await asyncio.to_thread(
                client.admin_user_global_sign_out,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )
            return Response(
                success=True, message=f"Signed out {username} globally"
            )
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def delete_user(session: AsyncSession, username: str, sub: str) -> Response:
        try:
            # 1. Find the user in the DB. we want to be sure to amke sure they exist locally before wasting money or requests on Cognito early
            statement = select(Users).where(Users.cognito_sub == sub)
            result = await session.execute(statement)
            db_user = result.scalar_one_or_none()

            # Once we confirm that the user does in fact exist, then delete from Cognito
            await asyncio.to_thread(
                client.admin_delete_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )

            # 3. based on the first and previous search and delete, we then delete from DB. 
            # We do this after the Cognito is deleted before we might accidently lose in during the await earlier not be able to see it in time for it to complete the delete.
            if db_user is not None:
                await session.delete(db_user)
                await session.commit()

            return Response(
                success=True, message=f"Deleted {username} permanently"
            )
        except ClientError as e:
            logger.exception("Admin delete user profile")
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail=USER_NOT_FOUND)
            if error_code == "InvalidParameterException":
                raise HTTPException(status_code=422, detail=INVALID_USERNAME)
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def create_user(
        session: AsyncSession,
        username: str,
        email: str,
        temp_pass: str = "TemPass@123",
    ) -> UserResponse:
        try:
            # 1. Check if user already exists in DB (by email or username)
            existing = await session.execute(
                select(Users).where(
                    (Users.email == email) | (Users.display_name == username)
                )
            )
            if existing.scalar_one_or_none() is not None:
                raise HTTPException(status_code=400, detail="User already exists")

            # 2. Create user in Cognito
            response = await asyncio.to_thread(
                client.admin_create_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                UserAttributes=[
                    {"Name": "email", "Value": email},
                    {"Name": "email_verified", "Value": "true"},
                ],
                TemporaryPassword=temp_pass,
                MessageAction="SUPPRESS",
            )

            user = response["User"]
            attrs = {
                attr["Name"]: attr.get("Value", "")
                for attr in user.get("Attributes", [])
            }
            sub = attrs.get("sub", "")

            # 3. Create DB profile
            profile = Users(
                cognito_sub=sub,
                email=email,
                display_name=user.get("Username", username),
                created_at=user.get(
                    "UserCreateDate", datetime.now(timezone.utc).replace(tzinfo=None)
                ),
                updated_at=user.get(
                    "UserLastModifiedDate",
                    datetime.now(timezone.utc).replace(tzinfo=None),
                ),
                deletion_scheduled_at=None,
            )
            session.add(profile)
            await session.commit()
            await session.refresh(profile)

            return UserResponse(
                username=profile.display_name or username,
                email=profile.email,
                sub=profile.cognito_sub,
                user_created_date=profile.created_at,
                user_last_modified_date=profile.updated_at,
                enabled=user.get("Enabled", True),
                user_status=user.get("UserStatus", "FORCE_CHANGE_PASSWORD"),
            )

        except ClientError as e:
            logger.exception("Admin create user")
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNameExistException":
                raise HTTPException(
                    status_code=400, detail="Username or email already exist."
                )
            if error_code == "InvalidPasswordException":
                raise HTTPException(
                    status_code=400, detail="Password does not meet format"
                )
            if error_code == "InvalidParameterException":
                raise HTTPException(status_code=422, detail="Invalid username")
            raise HTTPException(status_code=400, detail=error_code)

    # Platform settings (registration toggle)
    @staticmethod
    async def get_platform_settings() -> PlatformSettingsResponse:
        return PlatformSettingsResponse(registrations_open=_registrations_open)

    @staticmethod
    async def set_registrations_open(open_: bool) -> PlatformSettingsResponse:
        global _registrations_open
        _registrations_open = open_
        return PlatformSettingsResponse(registrations_open=_registrations_open)

    @staticmethod
    async def is_registration_open() -> bool:
        return _registrations_open