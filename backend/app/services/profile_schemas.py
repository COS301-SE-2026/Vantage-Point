from typing import Any
from sqlalchemy import func, select, cast, Integer
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import UserProfile, Participants, Champions
from app.schemas.profile_schemas import PlayerSummary

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


async def build_player_summary(
    session: AsyncSession, current_user: str
) -> tuple[int, PlayerSummary]:
    total_matches_result = await session.execute(
        select(func.count(func.distinct(Participants.match_id))).where(
            Participants.puuid == current_user
        )
    )
    total_matches = int(total_matches_result.scalar_one() or 0)

    most_played_result = await session.execute(
        select(Champions.name, func.count(Participants.internal_id))
        .join(Participants, Participants.champion_id == Champions.champion_id)
        .where(Participants.puuid == current_user)
        .group_by(Champions.name)
        .order_by(func.count(Participants.internal_id).desc())
        .limit(1)
    )
    most_played_row = most_played_result.first()

    stats_result = await session.execute(
        select(
            func.coalesce(func.sum(Participants.kills), 0),
            func.coalesce(func.sum(Participants.deaths), 0),
            func.coalesce(func.sum(Participants.assists), 0),
            func.coalesce(func.sum(cast(Participants.win, Integer)), 0),
            func.count(Participants.internal_id),
        ).where(Participants.puuid == current_user)
    )
    kills, deaths, assists, wins, games_played = stats_result.one()
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
        most_played_character=str(most_played_row[0]) if most_played_row else "Unknown",
        common_mistakes=common_mistakes,
        avg_kda=(
            f"{float(kills) / games_played:.1f} / "
            f"{avg_deaths:.1f} / "
            f"{float(assists) / games_played:.1f}"
        ),
        win_rate=f"{round((float(wins) / games_played) * 100)}%",
    )

    return total_matches, summary
