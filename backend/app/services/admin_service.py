import boto3
from botocore.exceptions import ClientError
from app.config import get_settings
from fastapi import HTTPException
import asyncio
from app.database.models import Users
from sqlmodel import select
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from loguru import logger
from app.Models.admin_model import (UserResponse)

settings = get_settings()

client = boto3.client("cognito-idp", region_name=settings.aws_region)  # type: ignore

# admin abilities/services


class admin_service:
    @staticmethod
    async def get_users(limit: int = 10) -> list[UserResponse]:
        try:
            response = await asyncio.to_thread(
                client.list_users, UserPoolId=settings.cognito_user_pool_id, Limit=limit
            )
            users: list[UserResponse] = []

            for user in response["Users"]:
                attributes: Any = {
                    attr["Name"]: attr.get("Value", "")
                    for attr in user.get("Attributes",[])
                }
            
                users.append(
                    UserResponse(
                        username=user.get("Username", ""),
                        email=attributes.get("email", ""),
                        sub=attributes.get("sub", ""),
                        user_created_date=user.get("UserCreateDate", datetime.now()),
                        user_last_modified_date=user.get("UserLastModifiedDate", datetime.now()),
                        enabled=user.get("Enabled", True),
                        user_status=user.get("UserStatus", "")
                    )
                )

            return users
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail="Uer not found.")
            if error_code == "InvalidParameterException":
                raise HTTPException(status_code=422, detail="Invalid username")
            print(e.response)
            raise
        #    raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def get_user(username: str) -> UserResponse:
        try:
            response = await asyncio.to_thread(
                client.admin_get_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )

            attributes = {
                attr["Name"]: attr.get("Value")
                for attr in response["UserAttributes"]
                }

            user = UserResponse(
                username=response["Username"],
                email=attributes.get("email", ""),
                sub=attributes.get("sub", ""),
                user_created_date=response["UserCreateDate"],
                user_last_modified_date=response["UserLastModifiedDate"],
                enabled=response["Enabled"],
                user_status=response["UserStatus"]
            )

            return user
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail="User not found.")
            if error_code == "InvalidParameterException":
                raise HTTPException(status_code=422, detail="Invalid username")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def add_user_to_group(username: str, group: str = "Users"):
        try:
            await asyncio.to_thread(
                client.admin_add_user_to_group,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                GroupName=group,
            )

            return {"success": True}
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
    async def remove_user_from_group(username: str, group: str = "Users"):
        try:
            await asyncio.to_thread(
                client.admin_remove_user_from_group,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                GroupName=group,
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def disable_user(username: str):
        try:
            await asyncio.to_thread(
                client.admin_disable_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def enable_user(username: str):
        try:
            await asyncio.to_thread(
                client.admin_enable_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def set_password(username: str, password: str):
        try:
            await asyncio.to_thread(
                client.admin_set_user_password,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                Password=password,
                Permanent=True,
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=403, detail="User not found.")
            if error_code == "InvalidPasswordException":
                raise HTTPException(
                    status_code=400, detail="Password does not meet format"
                )
            raise HTTPException(status_code=400, detail=error_code)

    # todo update user attr

    @staticmethod
    async def user_global_sign_out(username: str):
        try:
            await asyncio.to_thread(
                client.admin_user_global_sign_out,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    # require db
    @staticmethod
    async def delete_user(session: AsyncSession, username: str, sub: str):
        try:
            await asyncio.to_thread(
                client.admin_delete_user,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )

            statement = select(Users).where(Users.cognito_sub == sub)
            result = await session.execute(statement)
            user = result.scalar_one_or_none()

            if user is not None:
                await session.delete(user)
                await session.commit()

            return {"success": True}
        except ClientError as e:
            logger.exception("Admin delete user profile")
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "UserNotFoundException":
                raise HTTPException(status_code=404, detail="Uer not found.")

    # require db
    @staticmethod
    async def create_user(
        session: AsyncSession, username: str, email: str, temp_pass: str = "TemPass@123"
    ):
        try:
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
            statement = select(Users).where(Users.cognito_sub == attrs["sub"])
            result: Any = await session.execute(statement)
            profile: Users | None = result.scalar_one_or_none()

            if profile is not None:
                raise HTTPException(status_code=400, detail="USer already exist")

            profile = Users(
                cognito_sub=attrs.get("sub", ""),
                email=email,
                display_name=user.get("Username", username),
                created_at=user.get("UserCreateDate", datetime.now()),
                updated_at=user.get("UserLastModifiedDate", datetime.now()),
                deletion_scheduled_at=datetime(1999, 12, 31),
            )
            session.add(profile)
            await session.commit()
            await session.refresh(profile)

            return response
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

    @staticmethod
    async def create_group(group_name: str, precedence: int, description: str):
        try:
            response = await asyncio.to_thread(
                client.create_group,
                GroupName=group_name,
                UserPoolId=settings.cognito_user_pool_id,
                Description=description,
                Precedence=precedence,
            )

            return response
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            if error_code == "GroupExistException":
                raise HTTPException(status_code=400, detail="Group name already exist.")
            raise HTTPException(status_code=400, detail=error_code)
        # {

    @staticmethod
    async def update_group_attr(group_name: str, precedence: int, description: str):
        try:
            await asyncio.to_thread(
                client.update_group,
                GroupName=group_name,
                UserPoolId=settings.cognito_user_pool_id,
                Description=description,
                Precedence=precedence,
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def delete_group(group_name: str):
        try:
            await asyncio.to_thread(
                client.delete_group,
                GroupName=group_name,
                UserPoolId=settings.cognito_user_pool_id,
            )

            return {"success": True}
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)
