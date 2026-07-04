from datetime import datetime, timedelta
from fastapi import HTTPException  # , status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import traceback
# from sqlmodel import col
from typing import Any
from app.database.models import Users
# from app.Models.profile_schemas import User

# from app.Models.profile_schemas import (
#     PlayerSummary,
#     ProfileCreateRequest,
#     ProfileUpdateRequest,
# )
import boto3
from botocore.exceptions import ClientError
import asyncio
from mypy_boto3_cognito_idp import CognitoIdentityProviderClient
from app.config import get_settings
from loguru import logger

settings = get_settings()
client: CognitoIdentityProviderClient = boto3.client("cognito-idp", region_name=settings.aws_region)  # type: ignore
#     @staticmethod
#     async def build_player_summary(
#         session: AsyncSession, current_user: str
#     ) -> tuple[int, PlayerSummary]:
#         total_matches_stmt = select(
#             func.count(func.distinct(col(Participants.match_id)))
#         ).where(col(Participants.puuid) == current_user)
#         total_matches_result = await session.execute(total_matches_stmt)
#         total_matches = int(total_matches_result.scalar_one() or 0)

#         most_played_stmt = (
#             select(col(Champions.name), func.count())
#             .join(
#                 Participants,
#                 col(Participants.champion_id) == col(Champions.champion_id),
#             )
#             .where(col(Participants.puuid) == current_user)
#             .group_by(col(Champions.name))
#             .order_by(func.count().desc())
#             .limit(1)
#         )
#         most_played_result = await session.execute(most_played_stmt)
#         most_played_row = most_played_result.one_or_none()

#         stats_stmt = select(
#             func.coalesce(func.sum(col(Participants.kills)), 0).label("kills"),
#             func.coalesce(func.sum(col(Participants.deaths)), 0).label("deaths"),
#             func.coalesce(func.sum(col(Participants.assists)), 0).label("assists"),
#             func.coalesce(func.sum(cast(col(Participants.win), Integer)), 0).label(
#                 "wins"
#             ),
#             func.count(col(Participants.match_id)).label("games_played"),
#         ).where(col(Participants.puuid) == current_user)

#         stats_result = await session.execute(stats_stmt)
#         stats_row = stats_result.one()

#         kills = int(stats_row.kills or 0)
#         deaths = int(stats_row.deaths or 0)
#         assists = int(stats_row.assists or 0)
#         wins = int(stats_row.wins or 0)
#         games_played = int(stats_row.games_played or 0)

#         if games_played == 0:
#             return 0, PlayerSummary(
#                 most_played_character="No matches yet",
#                 common_mistakes=[],
#                 avg_kda="0.0 / 0.0 / 0.0",
#                 win_rate="0%",
#             )

#         avg_deaths = float(deaths) / games_played
#         common_mistakes: list[str] = []
#         if avg_deaths >= 6:
#             common_mistakes.append("High average deaths")
#         if (float(assists) / games_played) < 5:
#             common_mistakes.append("Low average assists")
#         if not common_mistakes:
#             common_mistakes.append("No recurring mistakes detected")

#         summary = PlayerSummary(
#             most_played_character=(
#                 str(most_played_row[0]) if most_played_row else "Unknown"
#             ),
#             common_mistakes=common_mistakes,
#             avg_kda=(
#                 f"{float(kills) / games_played:.1f} / "
#                 f"{avg_deaths:.1f} / "
#                 f"{float(assists) / games_played:.1f}"
#             ),
#             win_rate=f"{round((float(wins) / games_played) * 100)}%",
#         )

#         return total_matches, summary

#     @staticmethod
#     async def update_profile(
#         session: AsyncSession,
#         user_id: str,
#         request: ProfileUpdateRequest,
#     ) -> UserProfile:
#         statement = select(UserProfile).where(col(UserProfile.user_id) == user_id)
#         result = await session.execute(statement)
#         profile = result.scalar_one_or_none()

#         if profile is None:
#             raise HTTPException(
#                 status_code=status.HTTP_409_CONFLICT, detail="Profile not found."
#             )

#         if request.riot_puuid is not None:
#             account_stmt = select(GameAccounts).where(
#                 col(GameAccounts.puuid) == request.riot_puuid
#             )
#             account_result = await session.execute(account_stmt)
#             game_account = account_result.scalar_one_or_none()

#             if game_account is None:
#                 raise HTTPException(
#                     status_code=status.HTTP_404_NOT_FOUND,
#                     detail="Linked Riot account was not found.",
#                 )
#             profile.riot_puuid = request.riot_puuid

#         if request.username is not None:
#             profile.username = request.username

#         profile.updated_at = utc_now_naive()

#         session.add(profile)
#         await session.commit()
#         await session.refresh(profile)

#         return profile


class ProfileService:
    # need to add email, will do this later. At the moment is not of that much importance
    @staticmethod
    async def get_or_create_profile(session: AsyncSession, access_token: str) -> Users:
        try:
            if access_token == "":
                raise HTTPException(status_code=400, detail="Access Token is empty.")
            
            # find in user.sud in db, due to social login first find in cognito then look for in db, if not create user
            response = await asyncio.to_thread(
                client.get_user, AccessToken=access_token
            )
            # cast to user
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            # todo need to change object as can't hardcode user type
            #need to update this to what is expected give error due ti wrong data retrieved
            user = Users(
                cognito_sub=attributes["sub"],
                email=attributes["email"],
                display_name=response["Username"],           
            )

            statement = select(Users).where(Users.cognito_sub == user.cognito_sub)
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
        session: AsyncSession, user: Users | None
    ) -> (
        Users
    ):  # none is there for incase we only want ti use this endpoint in admin. More flexibility
        try:
            if user is None:
                raise HTTPException(status_code=400, detail="User objects is empty.")

            if user.display_name is None:
                raise HTTPException(status_code=400, detail="Username is missing.")          

            # create profile and get then return profile as is. Used when laod profile. Lazy loading
            # create in db
            profile = Users(
                cognito_sub=user.cognito_sub,
                email=user.email,
                display_name=user.display_name,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                deletion_scheduled_at=datetime(1999, 12, 31),
            )  # email needs to be added.
            session.add(profile)
            await session.commit()
            await session.refresh(user)

            return user
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
                raise HTTPException(status_code=400, detail="Access Token is empty.")

            response = await asyncio.to_thread(
                client.get_user, AccessToken=access_token
            )
            # cast to user
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            # todo need to change object as can't hardcode user type
            user = User(
                sub=attributes["sub"],
                groups=["user"],
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
                raise HTTPException(status_code=400, detail="Access Token is empty.")

            response = await asyncio.to_thread(
                client.get_user, AccessToken=access_token
            )
            # cast to user
            attributes = {
                attr["Name"]: attr.get("Value", "")
                for attr in response["UserAttributes"]
            }
            # todo need to change object as can't hardcode user type
            user = User(
                sub=attributes["sub"],
                groups=["user"],
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
            client: CognitoIdentityProviderClient = boto3.client(
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

    # todo update pswd and confirm update
