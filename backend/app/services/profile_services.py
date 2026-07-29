import asyncio
from datetime import datetime, timedelta
import traceback
from typing import Any

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from loguru import logger
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.config import get_settings
from app.database.models import Users
from app.Models.profile_schemas import UserProfile

settings = get_settings()
client: CognitoIdentityProviderClient = boto3.client(  # type: ignore
    "cognito-idp", region_name=settings.aws_region
)  # pyright: ignore[reportUnknownMemberType]

access_token_empty: str = "Access Token is empty."


class ProfileService:

    @staticmethod
    async def get_or_create_profile(session: AsyncSession, access_token: str) -> Users:
        try:
            if access_token == "":
                raise HTTPException(status_code=400, detail=access_token_empty)

            response = await asyncio.to_thread(
                client.get_user, AccessToken=access_token
            )
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            user = UserProfile(
                sub=attributes["sub"],
                email=attributes["email"],
                username=response["Username"],
            )

            statement = select(Users).where(Users.cognito_sub == user.sub)
            result: Any = await session.execute(statement)
            profile: Any | None = result.scalar_one_or_none()

            if profile is not None:
                return profile

            return await ProfileService.create_profile(session, user=user)
        except Exception:
            logger.exception("Get or create profile")
            raise HTTPException(status_code=500, detail=traceback.format_exc())

    @staticmethod
    async def create_profile(
        session: AsyncSession,
        user: UserProfile | None = None,
        user_id: int | str | None = None,
        request: Any = None,
    ) -> Users:
        try:
            if user is None and request is not None:
                sub = getattr(request, "sub", str(user_id or ""))
                email = getattr(request, "email", "")
                username = getattr(
                    request, "display_name", getattr(request, "username", "")
                )
                user = UserProfile(sub=sub, email=email, username=username)

            if user is None:
                raise HTTPException(status_code=400, detail="User objects is empty.")

            if user.username is None:
                raise HTTPException(status_code=400, detail="Username is missing.")

            profile = Users(
                cognito_sub=user.sub,
                email=user.email,
                display_name=user.username,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                deletion_scheduled_at=datetime(1999, 12, 31),
            )
            session.add(profile)
            await session.commit()
            await session.refresh(profile)

            return profile
        except ClientError as e:
            logger.exception("Create profile")
            print(e.response)
            raise

    @staticmethod
    async def build_player_summary(
        session: AsyncSession, user_id: int | str
    ) -> dict[str, Any]:
        statement = select(Users).where(Users.cognito_sub == str(user_id))
        result = await session.execute(statement)
        profile = result.scalar_one_or_none()

        if profile is None:
            raise HTTPException(status_code=404, detail="User profile not found.")

        return {
            "user_id": profile.cognito_sub,
            "cognito_sub": profile.cognito_sub,
            "display_name": profile.display_name,
            "email": profile.email,
            "created_at": profile.created_at,
        }

    @staticmethod
    async def update_profile(
        session: AsyncSession, user_id: int | str, profile_data: Any
    ) -> Users:
        statement = select(Users).where(Users.cognito_sub == str(user_id))
        result = await session.execute(statement)
        profile = result.scalar_one_or_none()

        if profile is None:
            raise HTTPException(status_code=404, detail="User profile not found.")

        if hasattr(profile_data, "display_name") and profile_data.display_name:
            profile.display_name = profile_data.display_name
        if hasattr(profile_data, "email") and profile_data.email:
            profile.email = profile_data.email

        profile.updated_at = datetime.now()
        await session.commit()
        await session.refresh(profile)
        return profile

    @staticmethod
    async def schedule_account_deletion(
        session: AsyncSession, access_token: str
    ) -> datetime:
        try:
            if access_token == "":
                raise HTTPException(status_code=400, detail=access_token_empty)

            response = await asyncio.to_thread(
                client.get_user, AccessToken=access_token
            )
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            user = UserProfile(
                sub=attributes["sub"],
                username=response["Username"],
                email=attributes["email"],
            )

            statement = select(Users).where(Users.cognito_sub == user.sub)
            result = await session.execute(statement=statement)
            profile = result.scalar_one_or_none()

            if profile is None:
                raise HTTPException(status_code=404, detail="User does not exist")

            profile.updated_at = datetime.now()
            profile.deletion_scheduled_at = datetime.now() + timedelta(30)

            await session.commit()
            await session.refresh(profile)

            return profile.deletion_scheduled_at
        except ClientError as e:
            print(e.response)
            raise

    @staticmethod
    async def undo_account_deletion(session: AsyncSession, access_token: str) -> Any:
        try:
            if access_token == "":
                raise HTTPException(status_code=400, detail=access_token_empty)

            response = await asyncio.to_thread(
                client.get_user, AccessToken=access_token
            )
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            user = UserProfile(
                sub=attributes["sub"],
                username=response["Username"],
                email=attributes["email"],
            )

            statement = select(Users).where(Users.cognito_sub == user.sub)
            result = await session.execute(statement)
            profile = result.scalar_one_or_none()

            if profile is None:
                raise HTTPException(status_code=404, detail="Account not Found !")

            profile.deletion_scheduled_at = datetime(1999, 12, 31)
            await session.commit()
            await session.refresh(profile)
            return profile.display_name
        except ClientError as e:
            print(e.response)
            raise

    @staticmethod
    async def update_email(
        session: AsyncSession, email: str | None, access_token: str
    ) -> Users:
        try:
            if email is None:
                raise HTTPException(status_code=400, detail="Email is empty")

            client: (
                CognitoIdentityProviderClient
            ) = boto3.client(  # pyright: ignore[reportUnknownMemberType]
                "cognito-idp", region_name=settings.aws_region
            )  # type: ignore

            statement = select(Users).where(Users.email == email)
            result: Any = await session.execute(statement)
            profile: Users | None = result.scalar_one_or_none()

            if profile is None:
                raise HTTPException(status_code=400, detail="User does not exist.")
            profile.email = email

            await session.commit()
            await asyncio.to_thread(
                client.update_user_attributes,
                AccessToken=access_token,
                UserAttributes=[{"Name": "email", "Value": email}],
            )
            await session.refresh(profile)
            return profile
        except ClientError as e:
            print(e.response)
            raise
