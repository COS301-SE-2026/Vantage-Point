"""Shared profile seed inserts for main seed and test fixtures."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import (
    AchievementDefinitions,
    GameAccounts,
    UserAchievements,
    UserFeaturedGames,
)
from app.database.seed_data.profile import (
    PROFILE_MATCHES_SAMPLED,
    SEED_ACHIEVEMENT_DEFINITIONS,
    SEED_FEATURED_GAMES,
    SEED_USER_ACHIEVEMENTS,
)


async def seed_profile_for_puuid(
    session: AsyncSession,
    puuid: str,
    *,
    set_matches_sampled: bool = True,
) -> None:
    session.add_all(
        [
            AchievementDefinitions(
                id=d.id,
                label=d.label,
                description=d.description,
                source_field=d.source_field,
            )
            for d in SEED_ACHIEVEMENT_DEFINITIONS
        ]
    )

    session.add_all(
        [
            UserAchievements(
                puuid=puuid,
                achievement_id=ua.achievement_id,
                count=ua.count,
            )
            for ua in SEED_USER_ACHIEVEMENTS
        ]
    )

    session.add_all(
        [
            UserFeaturedGames(
                puuid=puuid,
                sort_order=fg.sort_order,
                game_name=fg.game_name,
                cover_image_key=fg.cover_image_key,
                card_image_key=fg.card_image_key,
                efficiency_score=fg.efficiency_score,
                time_spent_seconds=fg.time_spent_seconds,
                wins=fg.wins,
                losses=fg.losses,
                average_kda=fg.average_kda,
            )
            for fg in SEED_FEATURED_GAMES
        ]
    )

    if set_matches_sampled:
        from sqlmodel import select

        result = await session.execute(
            select(GameAccounts).where(GameAccounts.puuid == puuid)
        )
        account = result.scalar_one_or_none()
        if account:
            account.profile_matches_sampled = PROFILE_MATCHES_SAMPLED
