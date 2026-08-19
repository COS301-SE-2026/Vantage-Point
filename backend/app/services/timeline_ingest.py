"""Fetches, distills and stores the Match-V5 timeline for a match.

The raw timeline is the largest payload Riot serves for a game — a frame per minute
carrying every stat of all ten players, plus every event that fired. We keep only what
the replay map and the map-analysis table draw, which is roughly a tenth of the size,
and re-key it from Riot's `participantId` to PUUID so the client can join it against
the scoreboard it already holds.

Fetching is lazy: `sync_matches_for_puuid` stores the scoreboard, and a timeline is
pulled the first time someone opens the replay for that match. One extra Riot round trip
per match viewed is far cheaper against a dev key's rate limit than one per match
imported, and most imported matches are never opened.
"""

import json
import logging
from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from app.database.models import MatchTimelines, Matches
from app.schemas.spatial_schemas import Coordinate
from app.schemas.timeline import (
    MapBounds,
    MatchTimelineResponse,
    TimelineEvent,
    TimelineFrame,
    TimelineParticipant,
    TimelineParticipantFrame,
    TimelinePosition,
)
from app.services.match_ingest import (
    RIOT_TIMEOUT_SECONDS,
    raise_for_riot_status,
    riot_api_key,
)
from app.services.riot_service import get_region
from app.services.spatial_service import map_bounds_for, path_distance

logger = logging.getLogger("app.timeline")

# Event types worth storing. Everything else Riot emits (turret plates, ward kills,
# objective bounties, pause markers) has nowhere to go in the current designs.
KEPT_EVENT_TYPES = frozenset(
    {
        "CHAMPION_KILL",
        "BUILDING_KILL",
        "ELITE_MONSTER_KILL",
        "WARD_PLACED",
        "SKILL_LEVEL_UP",
        "LEVEL_UP",
        "ITEM_PURCHASED",
        "ITEM_SOLD",
        "ITEM_DESTROYED",
        "ITEM_UNDO",
    }
)

DEFAULT_FRAME_INTERVAL_MS = 60_000


class TimelineNotAvailableError(Exception):
    """Riot has no timeline for this match (too old, or it never existed)."""


# error message if wrong region how would I tell them this.
async def fetch_timeline(
    client: httpx.AsyncClient, region: str, headers: dict[str, str], match_id: str
) -> dict[str, Any]:
    url = (
        f"https://{region}.api.riotgames.com/lol/match/v5/matches/"
        f"{match_id}/timeline"
    )

    response = await client.get(url, headers={"X-Riot-Token": riot_api_key()})
    raise_for_riot_status(response)
    if response.status_code == 404:
        raise TimelineNotAvailableError(f"Riot has no timeline for match {match_id}.")
    if response.status_code != 200:
        raise TimelineNotAvailableError(
            f"Riot returned {response.status_code} for the {match_id} timeline."
        )
    # add maybe region is wrong needs to be changed
    payload: dict[str, Any] = response.json()
    return payload


# --------------------------------------------------------------------------------------
# Riot payload -> stored shape
# --------------------------------------------------------------------------------------


def _puuid_by_participant_id(info: dict[str, Any]) -> dict[int, str]:
    return {
        int(entry.get("participantId", 0)): str(entry.get("puuid", ""))
        for entry in info.get("participants", [])
        if entry.get("puuid")
    }


def _position(raw: Any) -> dict[str, int] | None:
    if not isinstance(raw, dict):
        return None
    if "x" not in raw or "y" not in raw:
        return None
    return {"x": int(raw["x"]), "y": int(raw["y"])}


def _participant_frame(raw: dict[str, Any], puuid: str) -> dict[str, Any] | None:
    position = _position(raw.get("position"))
    if position is None:
        return None

    stats: dict[str, Any] = raw.get("championStats", {}) or {}
    damage: dict[str, Any] = raw.get("damageStats", {}) or {}
    return {
        "puuid": puuid,
        "position": position,
        "damage_to_champions": int(damage.get("totalDamageDoneToChampions", 0) or 0),
        "level": int(raw.get("level", 1) or 1),
        "xp": int(raw.get("xp", 0) or 0),
        "cs": int(raw.get("minionsKilled", 0) or 0)
        + int(raw.get("jungleMinionsKilled", 0) or 0),
        "current_gold": int(raw.get("currentGold", 0) or 0),
        "total_gold": int(raw.get("totalGold", 0) or 0),
        "health": int(stats.get("health", 0) or 0),
        "health_max": int(stats.get("healthMax", 0) or 0),
        "armor": int(stats.get("armor", 0) or 0),
        "magic_resist": int(stats.get("magicResist", 0) or 0),
        "attack_damage": int(stats.get("attackDamage", 0) or 0),
        "ability_power": int(stats.get("abilityPower", 0) or 0),
        "movement_speed": int(stats.get("movementSpeed", 0) or 0),
    }


def _assist_puuids(raw: dict[str, Any], by_id: dict[int, str]) -> list[str]:
    return [
        by_id[int(participant_id)]
        for participant_id in raw.get("assistingParticipantIds", []) or []
        if int(participant_id) in by_id
    ]


def _actor_id(raw: dict[str, Any]) -> int:
    """Riot names the acting player differently per event type."""
    for key in ("killerId", "creatorId", "participantId"):
        value = raw.get(key)
        if value:
            return int(value)
    return 0


def _optional_int(raw: dict[str, Any], key: str) -> int | None:
    value = raw.get(key)
    return int(value) if value is not None else None


def _event(raw: dict[str, Any], by_id: dict[int, str]) -> dict[str, Any] | None:
    event_type = str(raw.get("type", ""))
    if event_type not in KEPT_EVENT_TYPES:
        return None

    victim_id = int(raw.get("victimId", 0) or 0)
    return {
        "timestamp_ms": int(raw.get("timestamp", 0) or 0),
        "type": event_type,
        "position": _position(raw.get("position")),
        "actor_puuid": by_id.get(_actor_id(raw)),
        "victim_puuid": by_id.get(victim_id),
        "assist_puuids": _assist_puuids(raw, by_id),
        "team_id": (
            _optional_int(raw, "teamId")
            if raw.get("teamId") is not None
            else _optional_int(raw, "killerTeamId")
        ),
        "item_id": _optional_int(raw, "itemId"),
        "skill_slot": _optional_int(raw, "skillSlot"),
        "level": _optional_int(raw, "level"),
        "monster_type": raw.get("monsterType"),
        "building_type": raw.get("buildingType"),
        "lane_type": raw.get("laneType"),
        "ward_type": raw.get("wardType"),
    }


def distill_timeline(payload: dict[str, Any]) -> dict[str, Any]:
    """Reduce Riot's timeline to the frames and events the client draws."""
    info: dict[str, Any] = payload.get("info", {})
    by_id = _puuid_by_participant_id(info)

    frames: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []
    positions: dict[str, list[Coordinate]] = {puuid: [] for puuid in by_id.values()}

    for raw_frame in info.get("frames", []):
        participant_frames: list[dict[str, Any]] = []
        for participant_id, raw in (
            raw_frame.get("participantFrames", {}) or {}
        ).items():
            puuid = by_id.get(int(participant_id))
            if not puuid:
                continue
            frame = _participant_frame(raw, puuid)
            if frame is None:
                continue
            participant_frames.append(frame)
            positions[puuid].append(
                Coordinate(x=frame["position"]["x"], y=frame["position"]["y"])
            )

        frames.append(
            {
                "timestamp_ms": int(raw_frame.get("timestamp", 0) or 0),
                "participants": participant_frames,
            }
        )

        for raw_event in raw_frame.get("events", []) or []:
            event = _event(raw_event, by_id)
            if event is not None:
                events.append(event)

    participants = [
        {"puuid": puuid, "distance_travelled": round(path_distance(path), 1)}
        for puuid, path in positions.items()
    ]

    return {"frames": frames, "events": events, "participants": participants}


# --------------------------------------------------------------------------------------
# Persistence and read side
# --------------------------------------------------------------------------------------


async def _stored_timeline(
    session: AsyncSession, match_id: str
) -> MatchTimelines | None:
    result = await session.execute(
        select(MatchTimelines).where(col(MatchTimelines.match_id) == match_id)
    )
    return result.scalar_one_or_none()


def _to_response(row: MatchTimelines) -> MatchTimelineResponse:
    stored: dict[str, Any] = json.loads(row.timeline_json)
    min_x, min_y, max_x, max_y = map_bounds_for(row.map_id)

    return MatchTimelineResponse(
        match_id=row.match_id,
        frame_interval_ms=row.frame_interval_ms,
        game_duration_ms=row.game_duration_ms,
        map_id=row.map_id,
        map_bounds=MapBounds(min_x=min_x, min_y=min_y, max_x=max_x, max_y=max_y),
        participants=[
            TimelineParticipant(**participant)
            for participant in stored.get("participants", [])
        ],
        frames=[
            TimelineFrame(
                timestamp_ms=frame["timestamp_ms"],
                participants=[
                    TimelineParticipantFrame(
                        puuid=p["puuid"],
                        position=TimelinePosition(**p["position"]),
                        damage_to_champions=p.get("damage_to_champions", 0),
                        level=p["level"],
                        xp=p["xp"],
                        cs=p["cs"],
                        current_gold=p["current_gold"],
                        total_gold=p["total_gold"],
                        health=p["health"],
                        health_max=p["health_max"],
                        armor=p["armor"],
                        magic_resist=p["magic_resist"],
                        attack_damage=p["attack_damage"],
                        ability_power=p["ability_power"],
                        movement_speed=p["movement_speed"],
                    )
                    for p in frame.get("participants", [])
                ],
            )
            for frame in stored.get("frames", [])
        ],
        events=[
            TimelineEvent(
                timestamp_ms=event["timestamp_ms"],
                type=event["type"],
                position=(
                    TimelinePosition(**event["position"])
                    if event.get("position")
                    else None
                ),
                actor_puuid=event.get("actor_puuid"),
                victim_puuid=event.get("victim_puuid"),
                assist_puuids=event.get("assist_puuids", []),
                team_id=event.get("team_id"),
                item_id=event.get("item_id"),
                skill_slot=event.get("skill_slot"),
                level=event.get("level"),
                monster_type=event.get("monster_type"),
                building_type=event.get("building_type"),
                lane_type=event.get("lane_type"),
                ward_type=event.get("ward_type"),
            )
            for event in stored.get("events", [])
        ],
    )


async def store_timeline(
    session: AsyncSession,
    match_id: str,
    payload: dict[str, Any],
    *,
    map_id: int,
    game_duration_ms: int,
) -> MatchTimelines:
    info: dict[str, Any] = payload.get("info", {})
    distilled = distill_timeline(payload)

    frames = distilled["frames"]
    duration_ms = game_duration_ms or (int(frames[-1]["timestamp_ms"]) if frames else 0)

    row = MatchTimelines(
        match_id=match_id,
        frame_interval_ms=int(
            info.get("frameInterval", DEFAULT_FRAME_INTERVAL_MS)
            or DEFAULT_FRAME_INTERVAL_MS
        ),
        game_duration_ms=duration_ms,
        map_id=map_id,
        timeline_json=json.dumps(distilled),
    )
    await session.merge(row)
    await session.commit()
    return row


async def get_or_fetch_timeline(
    session: AsyncSession, cognito_sub: str, match_id: str
) -> MatchTimelineResponse:
    """Return the stored timeline, pulling it from Riot the first time it is asked for."""
    stored = await _stored_timeline(session, match_id)
    if stored:
        return _to_response(stored)

    result = await session.execute(
        select(Matches).where(col(Matches.match_id) == match_id)
    )
    match = result.scalar_one_or_none()
    if not match:
        raise TimelineNotAvailableError(f"Match {match_id} is not stored locally.")

    headers = {"X-Riot-Token": riot_api_key()}
    region = await get_region(session, cognito_sub)
    async with httpx.AsyncClient(timeout=RIOT_TIMEOUT_SECONDS) as client:
        payload = await fetch_timeline(client, region, headers, match_id)
    row = await store_timeline(
        session,
        match_id,
        payload,
        map_id=match.map_id,
        game_duration_ms=match.game_duration * 1000,
    )
    logger.info("Stored timeline for %s", match_id)
    return _to_response(row)
