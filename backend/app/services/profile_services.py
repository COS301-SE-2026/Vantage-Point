from datetime import datetime, timedelta
from fastapi import HTTPException  # , status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import traceback

from typing import Any
from app.database.models import Users
from app.Models.profile_schemas import UserProfile

import boto3
from botocore.exceptions import ClientError
import asyncio
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient
from app.config import get_settings
from loguru import logger

settings = get_settings()
client: CognitoIdentityProviderClient = boto3.client(  # type: ignore
    "cognito-idp", region_name=settings.aws_region
)  # pyright: ignore[reportUnknownMemberType]

access_token_empty: str = "Access Token is empty."


class ProfileService:

    # need to add email, will do this later. At the moment is not of that much importance
    @staticmethod
    async def get_or_create_profile(session: AsyncSession, access_token: str) -> Users:
        try:
            if access_token == "":
                raise HTTPException(status_code=400, detail=access_token_empty)

            # find in user.sud in db, due to social login first find in cognito then look for in db, if not create user
            response = await asyncio.to_thread(
                client.get_user, AccessToken=access_token
            )
            # cast to user
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            # need to change object as can't hardcode user type
            # need to update this to what is expected give error due ti wrong data retrieved
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

            return await ProfileService.create_profile(session, user)
        except Exception:
            logger.exception("Get or create profile")
            raise HTTPException(status_code=500, detail=traceback.format_exc())

    @staticmethod
    async def create_profile(
        session: AsyncSession, user: UserProfile | None
    ) -> (
        Users
    ):  # none is there for incase we only want ti use this endpoint in admin. More flexibility
        try:
            if user is None:
                raise HTTPException(status_code=400, detail="User objects is empty.")

            if user.username is None:
                raise HTTPException(status_code=400, detail="Username is missing.")

            # create profile and get then return profile as is. Used when laod profile. Lazy loading
            # create in db
            profile = Users(
                cognito_sub=user.sub,
                email=user.email,
                display_name=user.username,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                deletion_scheduled_at=datetime(1999, 12, 31),
            )  # email needs to be added.
            session.add(profile)
            await session.commit()
            await session.refresh(user)

            return profile
        except ClientError as e:
            logger.exception("Create profile")
            print(e.response)
            raise

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
            # cast to user
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            # need to change object as can't hardcode user type
            user = UserProfile(
                sub=attributes["sub"],
                username=response["Username"],
                email=attributes["email"],
            )
            # 30 day waiting period
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
            # cast to user
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            # need to change object as can't hardcode user type
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

    # just db update, different endpoints for cognito updates
    @staticmethod
    async def update_email(
        session: AsyncSession, email: str | None, access_token: str
    ) -> Users:
        try:
            if email is None:
                raise HTTPException(status_code=400, detail="Email is empty")
            # will fix this a bit later
            client: (
                CognitoIdentityProviderClient
            ) = boto3.client(  # pyright: ignore[reportUnknownMemberType]
                "cognito-idp", region_name=settings.aws_region
            )  # type: ignore

            statement = select(Users).where(
                Users.email == email
            )  # need to change when email gets added to db
            result: Any = await session.execute(statement)
            profile: Users | None = result.scalar_one_or_none()

            if (
                profile is None
            ):  # idea behind this is if not in our db does not exist in cognito. Hence can look for in our db. Due to need to get profile to updatye
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

    
    # update pswd and confirm update
