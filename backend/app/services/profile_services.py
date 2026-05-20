from datetime import datetime, timedelta, timezone

from sqlalchemy import Integer, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col

from app.database.models import Champions, Participants, UserProfile
from app.schemas.profile_schemas import PlayerSummary


class ProfileService:
    @staticmethod
    async def get_or_create_profile(
        session: AsyncSession, current_user: str
    ) -> UserProfile:
        profile = await session.get(UserProfile, current_user)
        if profile:
            return profile

        profile = UserProfile(user_id=current_user, username=current_user)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
        return profile

    @staticmethod
    async def build_player_summary(
        session: AsyncSession, current_user: str
    ) -> tuple[int, PlayerSummary]:
        total_matches_result = await session.execute(
            select(func.count(func.distinct(col(Participants.match_id)))).where(
                col(Participants.puuid) == current_user
            )
        )
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
        most_played_row = most_played_result.first()

        stats_stmt = select(
            func.coalesce(func.sum(col(Participants.kills)), 0),
            func.coalesce(func.sum(col(Participants.deaths)), 0),
            func.coalesce(func.sum(col(Participants.assists)), 0),
            func.coalesce(func.sum(cast(col(Participants.win), Integer)), 0),
            func.count(),
        ).where(col(Participants.puuid) == current_user)
        stats_result = await session.execute(stats_stmt)

        stats_row = stats_result.one()
        kills, deaths, assists, wins, games_played = stats_row
        games_played = int(games_played or 0)

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
        session: AsyncSession, current_user: str
    ) -> datetime:
        deletion_date = datetime.now(timezone.utc) + timedelta(days=30)
        profile = await ProfileService.get_or_create_profile(session, current_user)
        profile.deletion_scheduled_at = deletion_date
        profile.updated_at = datetime.now(timezone.utc)
        session.add(profile)
        await session.commit()
        return deletion_date

    @staticmethod
    async def undo_account_deletion(session: AsyncSession, current_user: str) -> bool:
        profile = await session.get(UserProfile, current_user)
        if not profile or not profile.deletion_scheduled_at:
            return False

        profile.deletion_scheduled_at = None
        profile.updated_at = datetime.now(timezone.utc)
        session.add(profile)
        await session.commit()
        return True
