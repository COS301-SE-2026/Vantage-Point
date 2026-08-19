"""Pulls a player's recent matches from Riot and persists them locally.

`/api/v1/matches`, the match-detail scoreboard and the profile radar all read the
`Matches` / `Participants` tables — before this module existed only `scripts/seed.sh`
ever wrote to them, so a real account that linked a Riot ID saw an empty dashboard.

Rows are written in exactly the shape the seed produces so the read side needs no
special-casing:

* one `Matches` row per match, with `detail_json` holding the full two-team scoreboard
  (`app.services.match_detail` reads that blob),
* one `Participants` row for the linked player only — the other nine players live inside
  `detail_json`, which is what the seed does and what avoids inventing `GameAccounts`
  rows for strangers,
* derived `UserAchievements` / `UserFeaturedGames` for the profile page.
"""

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any
import asyncio

import httpx
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from app.database.models import (
    AchievementDefinitions,
    Champions,
    GameAccounts,
    Matches,
    Participants,
    UserAchievements,
    UserFeaturedGames,
)
from app.services.riot_api import (
    RiotApiNotConfiguredError,
    RiotApiUnauthorizedError,
)
from app.services.riot_service import get_region

logger = logging.getLogger("app.match_ingest")

# Account-V1 has no region, but Match-V5 does, and we only know the player's PUUID.
# Probing in this order finds the right cluster in one call for most accounts.


DEFAULT_SYNC_COUNT = 10
MAX_SYNC_COUNT = 40
RIOT_TIMEOUT_SECONDS = 20.0


def riot_api_key() -> str:
    load_dotenv(override=True)
    key = os.getenv("RIOT_API_KEY", "").strip()
    if not key:
        raise RiotApiNotConfiguredError(
            "RIOT_API_KEY is not set. Add your Riot developer API key to backend/.env"
        )
    return key


def raise_for_riot_status(response: httpx.Response) -> None:
    if response.status_code in (401, 403):
        raise RiotApiUnauthorizedError(
            "Riot API key is invalid or expired. Regenerate it at "
            "https://developer.riotgames.com/ and update backend/.env"
        )
    if response.status_code == 429:
        raise RiotApiUnauthorizedError(
            "Riot API rate limit reached. Wait a minute and try again."
        )


async def fetch_recent_match_ids(
    client: httpx.AsyncClient,
    region: str,
    headers: dict[str, str],
    puuid: str,
    count: int,
) -> list[str]:
    """Recent Match-V5 ids for a PUUID, probing routing clusters until one answers."""

    url = (
        f"https://{region}.api.riotgames.com/lol/match/v5/matches/"
        f"by-puuid/{puuid}/ids?start=0&count={count}"
    )
    response = await client.get(url, headers=headers)
    raise_for_riot_status(response)

    if response.status_code == 200:
        ids = [str(match_id) for match_id in response.json()]
        if ids:
            return ids
    # 404 or an empty list means this cluster does not host the account.

    return []


async def fetch_match(
    client: httpx.AsyncClient, region: str, headers: dict[str, str], match_id: str
) -> dict[str, Any] | None:
    url = f"https://{region}.api.riotgames.com/lol/match/v5/matches/{match_id}"

    
    response = await client.get(url, headers=headers)

    raise_for_riot_status(response)
    if response.status_code != 200:
        logger.warning(
            "Skipping match %s: Riot returned %s", match_id, response.status_code
        )
        return None

    payload: dict[str, Any] = response.json()
    return payload


# --------------------------------------------------------------------------------------
# Riot MatchDto -> our row shapes
# --------------------------------------------------------------------------------------


def _game_duration_seconds(info: dict[str, Any]) -> int:
    """Riot reported duration in milliseconds before patch 11.20 and seconds after."""
    raw = info.get("gameDuration", 0) or 0
    if info.get("gameEndTimestamp") is None and raw > 10_000:
        return int(raw // 1000)
    return int(raw)


def _position(participant: dict[str, Any]) -> str:
    return str(
        participant.get("teamPosition")
        or participant.get("individualPosition")
        or "UNKNOWN"
    ).upper()


def _riot_id(participant: dict[str, Any]) -> str | None:
    game_name = participant.get("riotIdGameName") or participant.get("summonerName")
    tag_line = participant.get("riotIdTagline")
    if game_name and tag_line:
        return f"{game_name}#{tag_line}"
    return str(game_name) if game_name else None


def _cs(participant: dict[str, Any]) -> int:
    return int(participant.get("totalMinionsKilled", 0)) + int(
        participant.get("neutralMinionsKilled", 0)
    )


def _items(participant: dict[str, Any]) -> list[int]:
    return [int(participant.get(f"item{slot}", 0) or 0) for slot in range(7)]


def _summoner_spells(participant: dict[str, Any]) -> list[int]:
    return [
        int(participant.get("summoner1Id", 0) or 0),
        int(participant.get("summoner2Id", 0) or 0),
    ]


def _objectives(team: dict[str, Any]) -> dict[str, int]:
    objectives = team.get("objectives", {})

    def kills(key: str) -> int:
        return int(objectives.get(key, {}).get("kills", 0) or 0)

    return {
        "baron": kills("baron"),
        "dragon": kills("dragon"),
        "rift_herald": kills("riftHerald"),
        "tower": kills("tower"),
        "inhibitor": kills("inhibitor"),
    }


def _participant_payload(
    participant: dict[str, Any], viewer_puuid: str
) -> dict[str, Any]:
    return {
        "puuid": str(participant.get("puuid", "")),
        "riot_id": _riot_id(participant),
        "champion_id": int(participant.get("championId", 0)),
        "champion_name": str(participant.get("championName", "Unknown")),
        "position": _position(participant),
        "win": bool(participant.get("win", False)),
        "kills": int(participant.get("kills", 0)),
        "deaths": int(participant.get("deaths", 0)),
        "assists": int(participant.get("assists", 0)),
        "cs": _cs(participant),
        "gold_earned": int(participant.get("goldEarned", 0)),
        "damage_to_champions": int(participant.get("totalDamageDealtToChampions", 0)),
        "vision_score": int(participant.get("visionScore", 0)),
        "items": _items(participant),
        "summoner_spells": _summoner_spells(participant),
        "is_viewer": str(participant.get("puuid", "")) == viewer_puuid,
    }


def build_detail_payload(match: dict[str, Any], viewer_puuid: str) -> dict[str, Any]:
    """The `detail_json` blob `app.services.match_detail` reads back."""
    info: dict[str, Any] = match.get("info", {})
    participants: list[dict[str, Any]] = info.get("participants", [])

    teams: list[dict[str, Any]] = []
    for team in info.get("teams", []):
        team_id = int(team.get("teamId", 100))
        teams.append(
            {
                "team_id": team_id,
                "win": bool(team.get("win", False)),
                "bans": [
                    int(ban.get("championId", 0))
                    for ban in team.get("bans", [])
                    if int(ban.get("championId", 0)) > 0
                ],
                "objectives": _objectives(team),
                "participants": [
                    _participant_payload(participant, viewer_puuid)
                    for participant in participants
                    if int(participant.get("teamId", 0)) == team_id
                ],
            }
        )

    return {
        "match_id": str(match.get("metadata", {}).get("matchId", "")),
        "teams": teams,
    }


# --------------------------------------------------------------------------------------
# Persistence
# --------------------------------------------------------------------------------------


async def _ensure_champion(
    session: AsyncSession, champion_id: int, champion_name: str
) -> None:
    """`Participants.champion_id` is a foreign key, and a fresh DB may not be seeded."""
    if champion_id <= 0:
        return
    existing = await session.execute(
        select(Champions).where(col(Champions.champion_id) == champion_id)
    )
    if existing.scalar_one_or_none() is None:
        session.add(
            Champions(champion_id=champion_id, name=champion_name, tags="Unknown")
        )
        await session.flush()


async def _existing_match_ids(session: AsyncSession, match_ids: list[str]) -> set[str]:
    if not match_ids:
        return set()
    result = await session.execute(
        select(Matches.match_id).where(col(Matches.match_id).in_(match_ids))
    )
    return {str(row) for row in result.scalars().all()}


async def _has_participant_row(
    session: AsyncSession, match_id: str, puuid: str
) -> bool:
    result = await session.execute(
        select(Participants.internal_id)
        .where(
            col(Participants.match_id) == match_id,
            col(Participants.puuid) == puuid,
        )
        .limit(1)
    )
    return result.scalar_one_or_none() is not None


async def _persist_match(
    session: AsyncSession,
    match: dict[str, Any],
    viewer_puuid: str,
    *,
    match_exists: bool,
) -> bool:
    """Write one match plus the viewer's participant row. Returns True when stored."""
    info: dict[str, Any] = match.get("info", {})
    match_id = str(match.get("metadata", {}).get("matchId", ""))
    if not match_id:
        return False

    viewer = next(
        (
            p
            for p in info.get("participants", [])
            if str(p.get("puuid", "")) == viewer_puuid
        ),
        None,
    )
    if viewer is None:
        return False

    game_creation = int(info.get("gameCreation", 0) or 0)
    played_on = datetime.fromtimestamp(
        game_creation / 1000 if game_creation else 0, tz=timezone.utc
    ).date()

    if not match_exists:
        session.add(
            Matches(
                match_id=match_id,
                game_version=str(info.get("gameVersion", "unknown")),
                game_duration=_game_duration_seconds(info),
                queue_id=int(info.get("queueId", 0) or 0),
                game_creation=game_creation,
                map_id=int(info.get("mapId", 11) or 11),
                played_on=played_on,
                detail_json=json.dumps(build_detail_payload(match, viewer_puuid)),
            )
        )
        await session.flush()

    if await _has_participant_row(session, match_id, viewer_puuid):
        return False

    champion_id = int(viewer.get("championId", 0))
    await _ensure_champion(
        session, champion_id, str(viewer.get("championName", "Unknown"))
    )

    challenges: dict[str, Any] = viewer.get("challenges", {}) or {}
    session.add(
        Participants(
            match_id=match_id,
            puuid=viewer_puuid,
            champion_id=champion_id,
            team_id=int(viewer.get("teamId", 100)),
            win=bool(viewer.get("win", False)),
            kills=int(viewer.get("kills", 0)),
            deaths=int(viewer.get("deaths", 0)),
            assists=int(viewer.get("assists", 0)),
            individual_position=_position(viewer),
            cs=_cs(viewer),
            gold_earned=int(viewer.get("goldEarned", 0)),
            damage_to_champions=int(viewer.get("totalDamageDealtToChampions", 0)),
            vision_score=int(viewer.get("visionScore", 0)),
            items_json=json.dumps(_items(viewer)),
            summoner_spells_json=json.dumps(_summoner_spells(viewer)),
            riot_id_display=_riot_id(viewer),
            kill_participation=float(challenges.get("killParticipation", 0.0) or 0.0),
        )
    )
    await session.flush()
    return True


# --------------------------------------------------------------------------------------
# Derived profile data
# --------------------------------------------------------------------------------------

ACHIEVEMENT_DEFINITIONS: tuple[tuple[str, str, str, str], ...] = (
    (
        "triple-kill",
        "Triple",
        "Triple kills across sampled matches",
        "challenges.tripleKills",
    ),
    ("first-blood", "First Blood", "First blood kills", "challenges.firstBloodKill"),
    ("killing-spree", "Spree", "Killing sprees of 3+", "challenges.killingSprees"),
    (
        "high-kp",
        "Team Fight",
        "Matches with 70%+ kill participation",
        "challenges.killParticipation",
    ),
    (
        "vision",
        "Ward King",
        "Top vision score on team",
        "challenges.visionScorePerMinute",
    ),
    (
        "damage",
        "Carry",
        "Highest damage to champions on team",
        "challenges.teamDamagePercentage",
    ),
    ("turrets", "Siege", "Turret takedowns", "challenges.turretTakedowns"),
)


def _achievement_counts(matches: list[dict[str, Any]], puuid: str) -> dict[str, int]:
    counts = {definition[0]: 0 for definition in ACHIEVEMENT_DEFINITIONS}

    for match in matches:
        participants: list[dict[str, Any]] = match.get("info", {}).get(
            "participants", []
        )
        viewer = next(
            (p for p in participants if str(p.get("puuid", "")) == puuid), None
        )
        if viewer is None:
            continue

        challenges: dict[str, Any] = viewer.get("challenges", {}) or {}
        team_id = viewer.get("teamId")
        team = [p for p in participants if p.get("teamId") == team_id]

        counts["triple-kill"] += int(viewer.get("tripleKills", 0) or 0)
        counts["first-blood"] += int(bool(viewer.get("firstBloodKill", False)))
        counts["killing-spree"] += int(challenges.get("killingSprees", 0) or 0)
        counts["turrets"] += int(challenges.get("turretTakedowns", 0) or 0)

        if float(challenges.get("killParticipation", 0.0) or 0.0) >= 0.7:
            counts["high-kp"] += 1
        if team and viewer.get("visionScore", 0) >= max(
            p.get("visionScore", 0) for p in team
        ):
            counts["vision"] += 1
        if team and viewer.get("totalDamageDealtToChampions", 0) >= max(
            p.get("totalDamageDealtToChampions", 0) for p in team
        ):
            counts["damage"] += 1

    return counts


async def _rebuild_achievements(
    session: AsyncSession, puuid: str, matches: list[dict[str, Any]]
) -> None:
    existing_definitions = await session.execute(select(AchievementDefinitions.id))
    known = {str(row) for row in existing_definitions.scalars().all()}
    for definition_id, label, description, source_field in ACHIEVEMENT_DEFINITIONS:
        if definition_id not in known:
            session.add(
                AchievementDefinitions(
                    id=definition_id,
                    label=label,
                    description=description,
                    source_field=source_field,
                )
            )
    await session.flush()

    counts = _achievement_counts(matches, puuid)
    result = await session.execute(
        select(UserAchievements).where(col(UserAchievements.puuid) == puuid)
    )
    by_id = {row.achievement_id: row for row in result.scalars().all()}

    for achievement_id, count in counts.items():
        row = by_id.get(achievement_id)
        if row is None:
            session.add(
                UserAchievements(
                    puuid=puuid, achievement_id=achievement_id, count=count
                )
            )
        else:
            row.count = count
            session.add(row)
    await session.flush()


def _efficiency_score(
    avg_kda: float, kill_participation_pct: float, cs_per_minute: float
) -> int:
    """Single headline number for the featured-game card.

    Weighted so a solid game (3.8 KDA, 60% KP, 7 CS/min) lands near 110, which is where
    the design's sample sits — it is a composite of the three rates the radar already
    tracks, not a Riot-supplied rating.
    """
    return round(avg_kda * 15 + kill_participation_pct * 0.4 + cs_per_minute * 4)


async def _rebuild_featured_game(session: AsyncSession, puuid: str) -> None:
    result = await session.execute(
        select(Participants, Matches)
        .join(Matches, col(Matches.match_id) == col(Participants.match_id))
        .where(col(Participants.puuid) == puuid)
    )
    rows = result.all()
    if not rows:
        return

    wins = sum(1 for participant, _ in rows if participant.win)
    losses = len(rows) - wins
    total_seconds = sum(match.game_duration for _, match in rows)
    minutes = max(1.0, total_seconds / 60)

    kda_values = [
        (participant.kills + participant.assists) / max(participant.deaths, 1)
        for participant, _ in rows
    ]
    avg_kda = sum(kda_values) / len(kda_values)
    avg_kp_pct = (
        sum((participant.kill_participation or 0.0) for participant, _ in rows)
        / len(rows)
        * 100
    )
    cs_per_minute = sum(participant.cs for participant, _ in rows) / minutes

    existing = await session.execute(
        select(UserFeaturedGames).where(col(UserFeaturedGames.puuid) == puuid)
    )
    slide = next(iter(existing.scalars().all()), None)
    if slide is None:
        slide = UserFeaturedGames(
            puuid=puuid,
            sort_order=0,
            game_name="League Of Legends",
            cover_image_key="league_of_legends_cover",
            card_image_key="league_of_legends_card",
            efficiency_score=0,
            time_spent_seconds=0,
            wins=0,
            losses=0,
            average_kda=0.0,
        )

    slide.efficiency_score = _efficiency_score(avg_kda, avg_kp_pct, cs_per_minute)
    slide.time_spent_seconds = total_seconds
    slide.wins = wins
    slide.losses = losses
    slide.average_kda = round(avg_kda, 2)
    session.add(slide)
    await session.flush()


# --------------------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------------------


async def sync_matches_for_puuid(
    session: AsyncSession,
    puuid: str,
    *,
    count: int = DEFAULT_SYNC_COUNT,
    cognito_sub: str,
) -> dict[str, int]:
    """Fetch the player's recent matches and store any that are not already local.

    Returns `{"fetched": n, "imported": n, "total": n}` where `total` is how many matches
    this player now has stored.
    """
    count = max(1, min(count, MAX_SYNC_COUNT))
    imported = 0
    fetched_matches: list[dict[str, Any]] = []
    region = await get_region(session, cognito_sub)
    api_key = riot_api_key()
    headers = {"X-Riot-Token": api_key}

    async with httpx.AsyncClient(timeout=RIOT_TIMEOUT_SECONDS) as client:
        match_ids = await fetch_recent_match_ids(client, region, headers, puuid, count)
        already_stored = await _existing_match_ids(session, match_ids)

        sem = asyncio.Semaphore(5)

        async def _bounded_fetch(match_id: str) -> dict[str, Any] | None:
            async with sem:
                return await fetch_match(client, region, headers, match_id)

        results = await asyncio.gather(*(_bounded_fetch(mid) for mid in match_ids))  # type: ignore

    for match_id, match in zip(match_ids, results):
        match = await fetch_match(client, region, headers, match_id)
        if match is None:
            continue
        fetched_matches.append(match)
        if await _persist_match(
            session, match, puuid, match_exists=match_id in already_stored
        ):
            imported += 1

    if fetched_matches:
        await _rebuild_achievements(session, puuid, fetched_matches)

    await _rebuild_featured_game(session, puuid)

    total_result = await session.execute(
        select(Participants.internal_id).where(col(Participants.puuid) == puuid)
    )
    total = len(total_result.scalars().all())

    account_result = await session.execute(
        select(GameAccounts).where(col(GameAccounts.puuid) == puuid)
    )
    account = account_result.scalar_one_or_none()
    if account:
        account.profile_matches_sampled = total
        session.add(account)

    await session.commit()

    return {"fetched": len(match_ids), "imported": imported, "total": total}


async def resolve_platform(session: AsyncSession, puuid: str) -> str | None:
    """Best guess at the player's Riot platform, e.g. `euw1`, from a stored match id.

    Match ids are prefixed with the platform they were played on (`EUW1_700000001`), so
    the most recent stored match is a more reliable source than the configured default.
    """
    result = await session.execute(
        select(Matches.match_id)
        .join(Participants, col(Participants.match_id) == col(Matches.match_id))
        .where(col(Participants.puuid) == puuid)
        .order_by(col(Matches.game_creation).desc())
        .limit(1)
    )
    match_id = result.scalar_one_or_none()
    if not match_id or "_" not in str(match_id):
        return None
    return str(match_id).split("_")[0].lower()


async def sync_matches_best_effort(
    session: AsyncSession,
    puuid: str,
    *,
    count: int = DEFAULT_SYNC_COUNT,
    cognito_sub: str,
) -> dict[str, int] | None:
    """Sync without letting a Riot outage fail the request that triggered it."""
    try:
        return await sync_matches_for_puuid(
            session, puuid, count=count, cognito_sub=cognito_sub
        )
    except (RiotApiNotConfiguredError, RiotApiUnauthorizedError) as exc:
        logger.warning("Match sync skipped for %s: %s", puuid, exc)
    except Exception as exc:  # noqa: BLE001 - background best-effort import
        logger.warning("Match sync failed for %s: %s", puuid, exc)
        await session.rollback()
    return None
