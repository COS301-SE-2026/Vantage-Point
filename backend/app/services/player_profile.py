from collections import Counter

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database.models import (
    AchievementDefinitions,
    Champions,
    GameAccounts,
    Matches,
    Participants,
    UserAchievements,
    UserFeaturedGames,
    Users,
)
from app.schemas.profile import (
    FeaturedGameSlideResponse,
    PlayerAchievementResponse,
    PlayerProfileResponse,
    RadarMetricResponse,
    RecentChampionResponse,
)


def _avatar_initials(display_name: str) -> str:
    parts = display_name.strip().split()
    if not parts:
        return "VP"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[1][0]}".upper()


def _format_win_rate(wins: int, losses: int) -> str:
    total = wins + losses
    if total == 0:
        return "—"
    pct = round((wins / total) * 100)
    return f"{pct}% ({wins}W / {losses}L)"


def _format_kda(avg: float) -> str:
    return f"{avg:.1f} avg"


def _format_time_spent(total_seconds: int) -> str:
    days, rem = divmod(total_seconds, 86400)
    hours, rem = divmod(rem, 3600)
    minutes, seconds = divmod(rem, 60)
    return f"{days}:{hours:02d}:{minutes:02d}:{seconds:02d}"


def _normalize_radar(value: float, cap: float) -> int:
    return min(100, max(0, round((value / cap) * 100)))


async def _load_matches_sampled(session: AsyncSession, puuid: str) -> int:
    result = await session.execute(
        select(GameAccounts.profile_matches_sampled).where(GameAccounts.puuid == puuid)
    )
    value = result.scalar_one_or_none()
    return value if value is not None else 0


async def _load_achievements(
    session: AsyncSession, puuid: str
) -> list[PlayerAchievementResponse]:
    result = await session.execute(
        select(UserAchievements, AchievementDefinitions)
        .join(
            AchievementDefinitions,
            AchievementDefinitions.id == UserAchievements.achievement_id,
        )
        .where(UserAchievements.puuid == puuid)
        .order_by(UserAchievements.achievement_id)
    )
    return [
        PlayerAchievementResponse(
            id=definition.id,
            label=definition.label,
            description=definition.description,
            source_field=definition.source_field,
            count=ua.count,
        )
        for ua, definition in result.all()
    ]


async def _load_featured_games(
    session: AsyncSession, puuid: str
) -> list[FeaturedGameSlideResponse]:
    result = await session.execute(
        select(UserFeaturedGames)
        .where(UserFeaturedGames.puuid == puuid)
        .order_by(UserFeaturedGames.sort_order)
    )
    slides = result.scalars().all()
    return [
        FeaturedGameSlideResponse(
            game_name=slide.game_name,
            cover_image_key=slide.cover_image_key,
            card_image_key=slide.card_image_key,
            efficiency_score=slide.efficiency_score,
            time_spent_label=_format_time_spent(slide.time_spent_seconds),
            win_rate_label=_format_win_rate(slide.wins, slide.losses),
            kda_label=_format_kda(slide.average_kda),
        )
        for slide in slides
    ]


async def build_player_profile(
    session: AsyncSession,
    user: Users,
    puuid: str | None,
    riot_id_tag: str | None,
) -> PlayerProfileResponse:
    display_name = user.display_name
    tag = riot_id_tag or "Not linked"
    initials = _avatar_initials(display_name)
    avatar_url = user.avatar_url

    if not puuid:
        return PlayerProfileResponse(
            display_name=display_name,
            riot_id_tag=tag,
            avatar_initials=initials,
            avatar_url=avatar_url,
            matches_sampled=0,
            radar_metrics=[],
            recent_champions=[],
            achievements=[],
            featured_games=[],
        )

    matches_sampled = await _load_matches_sampled(session, puuid)
    achievements = await _load_achievements(session, puuid)
    featured_games = await _load_featured_games(session, puuid)

    result = await session.execute(
        select(Participants, Matches, Champions)
        .join(Matches, Matches.match_id == Participants.match_id)
        .join(Champions, Champions.champion_id == Participants.champion_id)
        .where(Participants.puuid == puuid)
        .order_by(Matches.game_creation.desc())
    )
    rows = result.all()

    if not rows:
        return PlayerProfileResponse(
            display_name=display_name,
            riot_id_tag=tag,
            avatar_initials=initials,
            avatar_url=avatar_url,
            matches_sampled=matches_sampled,
            radar_metrics=[],
            recent_champions=[],
            achievements=achievements,
            featured_games=featured_games,
        )

    total_duration = sum(m.game_duration for _, m, _ in rows) or 1

    kda_values = [(p.kills + p.assists) / max(p.deaths, 1) for p, _, _ in rows]
    avg_kda = sum(kda_values) / len(kda_values)

    total_cs = sum(p.cs for p, _, _ in rows)
    total_gold = sum(p.gold_earned for p, _, _ in rows)
    total_damage = sum(p.damage_to_champions for p, _, _ in rows)
    total_vision = sum(p.vision_score for p, _, _ in rows)
    kp_values = [p.kill_participation or 0.0 for p, _, _ in rows]
    avg_kp = sum(kp_values) / len(kp_values) if kp_values else 0.0

    cspm = total_cs / (total_duration / 60)
    gpm = total_gold / (total_duration / 60)
    dpm = total_damage / (total_duration / 60)
    vision_per_min = total_vision / (total_duration / 60)

    champion_counts: Counter[int] = Counter()
    champion_names: dict[int, str] = {}
    for p, _, c in rows:
        champion_counts[c.champion_id] += 1
        champion_names[c.champion_id] = c.name

    recent_champions = [
        RecentChampionResponse(
            champion_id=cid,
            champion_name=champion_names[cid],
            games_played=count,
        )
        for cid, count in champion_counts.most_common(5)
    ]

    radar_metrics = [
        RadarMetricResponse(
            key="kda",
            label="KDA",
            value=_normalize_radar(avg_kda, 5.0),
            raw_label=_format_kda(avg_kda),
        ),
        RadarMetricResponse(
            key="vision",
            label="Vision",
            value=_normalize_radar(vision_per_min, 2.0),
            raw_label=f"{vision_per_min:.1f}/min",
        ),
        RadarMetricResponse(
            key="gpm",
            label="GPM",
            value=_normalize_radar(gpm, 500.0),
            raw_label=f"{round(gpm)} GPM",
        ),
        RadarMetricResponse(
            key="dpm",
            label="DPM",
            value=_normalize_radar(dpm, 900.0),
            raw_label=f"{round(dpm)} DPM",
        ),
        RadarMetricResponse(
            key="cspm",
            label="CS/min",
            value=_normalize_radar(cspm, 10.0),
            raw_label=f"{cspm:.1f} CS/min",
        ),
        RadarMetricResponse(
            key="kp",
            label="Kill Part.",
            value=_normalize_radar(avg_kp * 100, 100.0),
            raw_label=f"{round(avg_kp * 100)}% KP",
        ),
    ]

    return PlayerProfileResponse(
        display_name=display_name,
        riot_id_tag=tag,
        avatar_initials=initials,
        avatar_url=avatar_url,
        matches_sampled=matches_sampled,
        radar_metrics=radar_metrics,
        recent_champions=recent_champions,
        achievements=achievements,
        featured_games=featured_games,
    )
