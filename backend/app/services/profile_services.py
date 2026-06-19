from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from sqlalchemy import Integer, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col

from app.database.models import Champions, Participants, UserProfile, GameAccounts
from app.Models.profile_schemas import (
    PlayerSummary,
    ProfileCreateRequest,
    ProfileUpdateRequest,
)


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class ProfileService:
    @staticmethod
    async def get_or_create_profile(session: AsyncSession, user_id: str) -> UserProfile:
        statement = select(UserProfile).where(col(UserProfile.user_id) == user_id)
        result = await session.execute(statement)
        profile = result.scalar_one_or_none()

        if profile:
            return profile

        profile = UserProfile(
            user_id=user_id,
            username=f"Summoner_{user_id[:8]}",
        )
        session.add(profile)
        await session.commit()
        await session.refresh(profile)

        return profile

    @staticmethod
    async def build_player_summary(
        session: AsyncSession, current_user: str
    ) -> tuple[int, PlayerSummary]:
        total_matches_stmt = select(
            func.count(func.distinct(col(Participants.match_id)))
        ).where(col(Participants.puuid) == current_user)
        total_matches_result = await session.execute(total_matches_stmt)
        total_matches = int(total_matches_result.scalar_one() or 0)

        most_played_stmt = (
            select(col(Champions.name), func.count())
            .join(
                Participants,
                col(Participants.champion_id) == col(Champions.champion_id),
            )
            .where(col(Participants.puuid) == current_user)
            .group_by(col(Champions.name))
            .order_by(func.count().desc())
            .limit(1)
        )
        most_played_result = await session.execute(most_played_stmt)
        most_played_row = most_played_result.one_or_none()

        stats_stmt = select(
            func.coalesce(func.sum(col(Participants.kills)), 0).label("kills"),
            func.coalesce(func.sum(col(Participants.deaths)), 0).label("deaths"),
            func.coalesce(func.sum(col(Participants.assists)), 0).label("assists"),
            func.coalesce(func.sum(cast(col(Participants.win), Integer)), 0).label(
                "wins"
            ),
            func.count(col(Participants.match_id)).label("games_played"),
        ).where(col(Participants.puuid) == current_user)

        stats_result = await session.execute(stats_stmt)
        stats_row = stats_result.one()

        kills = int(stats_row.kills or 0)
        deaths = int(stats_row.deaths or 0)
        assists = int(stats_row.assists or 0)
        wins = int(stats_row.wins or 0)
        games_played = int(stats_row.games_played or 0)

        if games_played == 0:
            return 0, PlayerSummary(
                most_played_character="No matches yet",
                common_mistakes=[],
                avg_kda="0.0 / 0.0 / 0.0",
                win_rate="0%",
            )

        avg_deaths = float(deaths) / games_played
        common_mistakes: list[str] = []
        if avg_deaths >= 6:
            common_mistakes.append("High average deaths")
        if (float(assists) / games_played) < 5:
            common_mistakes.append("Low average assists")
        if not common_mistakes:
            common_mistakes.append("No recurring mistakes detected")

        summary = PlayerSummary(
            most_played_character=(
                str(most_played_row[0]) if most_played_row else "Unknown"
            ),
            common_mistakes=common_mistakes,
            avg_kda=(
                f"{float(kills) / games_played:.1f} / "
                f"{avg_deaths:.1f} / "
                f"{float(assists) / games_played:.1f}"
            ),
            win_rate=f"{round((float(wins) / games_played) * 100)}%",
        )

        return total_matches, summary

    @staticmethod
    async def schedule_account_deletion(
        session: AsyncSession, user_id: str
    ) -> datetime:
        profile = await ProfileService.get_or_create_profile(session, user_id)

        deletion_date = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(
            days=30
        )
        profile.deletion_scheduled_at = deletion_date
        profile.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
        return deletion_date

    @staticmethod
    async def undo_account_deletion(session: AsyncSession, user_id: str) -> bool:
        statement = select(UserProfile).where(col(UserProfile.user_id) == user_id)
        result = await session.execute(statement)
        profile = result.scalar_one_or_none()

        if not profile or not profile.deletion_scheduled_at:
            return False

        profile.deletion_scheduled_at = None
        profile.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        session.add(profile)
        await session.commit()
        return True

    @staticmethod
    async def create_profile(
        session: AsyncSession, user_id: str, request: ProfileCreateRequest
    ) -> UserProfile:
        statement = select(UserProfile).where(col(UserProfile.user_id) == user_id)
        result = await session.execute(statement)
        existing_profile = result.scalar_one_or_none()

        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Profile already exists."
            )
        if request.riot_puuid is not None:
            account_stmt = select(GameAccounts).where(
                col(GameAccounts.puuid) == request.riot_puuid
            )
            account_result = await session.execute(account_stmt)
            game_account = account_result.scalar_one_or_none()

            if game_account is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Linked Riot account was not found.",
                )

        now = utc_now_naive()

        profile = UserProfile(
            user_id=user_id,
            username=request.username,
            riot_puuid=request.riot_puuid,
            created_at=now,
            updated_at=now,
        )

        session.add(profile)
        await session.commit()
        await session.refresh(profile)

        return profile

    @staticmethod
    async def update_profile(
        session: AsyncSession,
        user_id: str,
        request: ProfileUpdateRequest,
    ) -> UserProfile:
        statement = select(UserProfile).where(col(UserProfile.user_id) == user_id)
        result = await session.execute(statement)
        profile = result.scalar_one_or_none()

        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Profile not found."
            )

        if request.riot_puuid is not None:
            account_stmt = select(GameAccounts).where(
                col(GameAccounts.puuid) == request.riot_puuid
            )
            account_result = await session.execute(account_stmt)
            game_account = account_result.scalar_one_or_none()

            if game_account is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Linked Riot account was not found.",
                )
            profile.riot_puuid = request.riot_puuid

        if request.username is not None:
            profile.username = request.username

        profile.updated_at = utc_now_naive()

        session.add(profile)
        await session.commit()
        await session.refresh(profile)

        return profile
