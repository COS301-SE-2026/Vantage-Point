"""Synthetic Match-V5 timelines for the seeded dev matches.

The seeded games do not exist on Riot's servers, so `timeline_ingest` can never fetch a
real timeline for them. Without this the replay map and the per-frame rows of the map
analysis table would only ever render for an account with a live Riot key and freshly
imported matches, which makes the feature impossible to look at or review locally.

What is produced here is plausible, deterministic and internally consistent with the
seeded scoreboard: every player walks their own lane, kills land where the killer was
standing, skill points arrive on the standard levelling pattern, and the item purchases
match the build already stored in `detail_json`. It is dev data, not a simulation.
"""

import json
import math
from typing import Any

# Riot map units for Summoner's Rift; see app.services.spatial_service.MAP_BOUNDS.
FRAME_INTERVAL_MS = 60_000

# Each track runs from the blue base to the red base along one lane. Blue-side players
# walk it forwards, red-side players walk it in reverse, so both teams end up in the
# lane their position says they are in.
LANE_TRACKS: dict[str, list[tuple[int, int]]] = {
    "TOP": [
        (1400, 1900),
        (1200, 4500),
        (1500, 8200),
        (2600, 10800),
        (4800, 12400),
        (8600, 12900),
        (12300, 13100),
    ],
    "MIDDLE": [
        (1900, 1900),
        (3400, 3400),
        (5200, 5200),
        (7400, 7400),
        (9600, 9600),
        (11400, 11400),
        (13000, 13000),
    ],
    "BOTTOM": [
        (1900, 1400),
        (4500, 1200),
        (8200, 1500),
        (10800, 2600),
        (12400, 4800),
        (12900, 8600),
        (13100, 12300),
    ],
}
# The support shares the bot lane, standing a little behind the carry.
LANE_TRACKS["UTILITY"] = [(x - 350, y + 350) for x, y in LANE_TRACKS["BOTTOM"]]

# The jungler runs a circuit of camps instead of holding a lane.
JUNGLE_CIRCUIT: list[tuple[int, int]] = [
    (2600, 3400),
    (3600, 6200),
    (5200, 8200),
    (6600, 5400),
    (8200, 3600),
    (9600, 6600),
    (8000, 9200),
    (5600, 10600),
]

MAP_MAX_X = 14870
MAP_MAX_Y = 14980

# Objective pits, for the events that have a fixed home on the map.
DRAGON_PIT = (9866, 4414)
BARON_PIT = (4950, 10400)
HERALD_PIT = (4950, 10400)

# Standard levelling order: R whenever it is available, otherwise Q, W, E in turn.
ULTIMATE_LEVELS = frozenset({6, 11, 16})
BASIC_SKILL_CYCLE = (1, 2, 3)

LANE_BY_BUILDING_INDEX = ("MID_LANE", "TOP_LANE", "BOT_LANE")


def _mirror(point: tuple[int, int]) -> tuple[int, int]:
    return (MAP_MAX_X - point[0], MAP_MAX_Y - point[1])


def _stable_offset(puuid: str, spread: float) -> float:
    """A per-player constant in [-spread, spread], so players do not move in lockstep."""
    digest = sum((index + 1) * ord(char) for index, char in enumerate(puuid))
    return ((digest % 1000) / 1000.0 * 2 - 1) * spread


def _sample_track(track: list[tuple[int, int]], progress: float) -> tuple[int, int]:
    """Point at `progress` (0-1) along a polyline, interpolating between waypoints."""
    clamped = min(1.0, max(0.0, progress))
    span = clamped * (len(track) - 1)
    index = min(len(track) - 2, int(span))
    ratio = span - index
    start, end = track[index], track[index + 1]
    return (
        round(start[0] + (end[0] - start[0]) * ratio),
        round(start[1] + (end[1] - start[1]) * ratio),
    )


def _position_at(
    puuid: str,
    position: str,
    team_id: int,
    winning: bool,
    elapsed_ms: int,
    duration_ms: int,
) -> tuple[int, int]:
    """Where a player is standing at a given moment.

    Laners oscillate around the middle of their lane on a five-minute rhythm and creep
    towards the enemy half as their team takes the game over; junglers loop their camps.
    """
    minutes = elapsed_ms / 60_000
    phase = _stable_offset(puuid, 0.12)

    if position == "JUNGLE":
        circuit = (
            JUNGLE_CIRCUIT if team_id == 100 else [_mirror(p) for p in JUNGLE_CIRCUIT]
        )
        step = (minutes / 1.5) + phase * 4
        index = int(step) % len(circuit)
        following = circuit[(index + 1) % len(circuit)]
        current = circuit[index]
        ratio = step - int(step)
        return (
            round(current[0] + (following[0] - current[0]) * ratio),
            round(current[1] + (following[1] - current[1]) * ratio),
        )

    track = LANE_TRACKS.get(position, LANE_TRACKS["MIDDLE"])
    if team_id == 200:
        track = list(reversed(track))

    # 0.25-0.75 of the lane, drifting up to 0.12 further forward for the winning side.
    swing = 0.5 + 0.25 * math.sin((minutes + phase * 10) * (2 * math.pi / 5))
    drift = (0.12 if winning else -0.08) * (elapsed_ms / max(duration_ms, 1))
    return _sample_track(track, swing + drift + phase)


def _level_at(elapsed_ms: int, duration_ms: int) -> int:
    """Roughly linear to 18, reached shortly before a full-length game ends."""
    share = elapsed_ms / max(duration_ms, 1)
    return max(1, min(18, 1 + round(share * 17)))


def _champion_stats(level: int, is_carry: bool) -> dict[str, int]:
    return {
        "health": 570 + 95 * level,
        "healthMax": 570 + 95 * level,
        "armor": 35 + 4 * level,
        "magicResist": 32 + 2 * level,
        "attackDamage": (62 + 4 * level) if is_carry else (55 + 3 * level),
        "abilityPower": 0 if is_carry else 12 * level,
        "movementSpeed": 335 + (45 if level >= 4 else 0),
    }


def _participant_frame(
    participant: dict[str, Any],
    participant_id: int,
    elapsed_ms: int,
    duration_ms: int,
    winning: bool,
) -> dict[str, Any]:
    share = elapsed_ms / max(duration_ms, 1)
    level = _level_at(elapsed_ms, duration_ms)
    position = _position_at(
        participant["puuid"],
        participant["position"],
        participant.get("team_id", 100),
        winning,
        elapsed_ms,
        duration_ms,
    )
    is_carry = participant["position"] in ("BOTTOM", "TOP")

    return {
        "participantId": participant_id,
        "position": {"x": position[0], "y": position[1]},
        "level": level,
        "xp": round(participant.get("xp_total", 18_000) * share),
        "minionsKilled": round(participant["cs"] * share),
        "jungleMinionsKilled": 0,
        "currentGold": round(participant["gold_earned"] * share * 0.15),
        "totalGold": round(participant["gold_earned"] * share),
        "championStats": _champion_stats(level, is_carry),
        "damageStats": {
            "totalDamageDoneToChampions": round(
                participant["damage_to_champions"] * share
            )
        },
    }


def _skill_slot_for_level(level: int, taken: int) -> int:
    if level in ULTIMATE_LEVELS:
        return 4
    return BASIC_SKILL_CYCLE[taken % len(BASIC_SKILL_CYCLE)]


def _levelling_events(participant_id: int, duration_ms: int) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    basics_taken = 0

    for level in range(2, 19):
        timestamp = round(duration_ms * (level - 1) / 18)
        if timestamp >= duration_ms:
            break
        slot = _skill_slot_for_level(level, basics_taken)
        if slot != 4:
            basics_taken += 1
        events.append(
            {
                "timestamp": timestamp,
                "type": "LEVEL_UP",
                "participantId": participant_id,
                "level": level,
            }
        )
        events.append(
            {
                "timestamp": timestamp + 1,
                "type": "SKILL_LEVEL_UP",
                "participantId": participant_id,
                "skillSlot": slot,
                "levelUpType": "NORMAL",
            }
        )
    return events


def _purchase_events(
    participant: dict[str, Any], participant_id: int, duration_ms: int
) -> list[dict[str, Any]]:
    """Buy the stored build in order, spread across the game."""
    items = [item for item in participant.get("items", []) if item]
    if not items:
        return []

    # First back is around four minutes in; the last item lands just before the end.
    first_ms = min(240_000, duration_ms // 5)
    span = max(1, duration_ms - first_ms)
    return [
        {
            "timestamp": first_ms + round(span * index / max(1, len(items))),
            "type": "ITEM_PURCHASED",
            "participantId": participant_id,
            "itemId": item,
        }
        for index, item in enumerate(items)
    ]


def _kill_events(
    participants: list[dict[str, Any]],
    ids_by_puuid: dict[str, int],
    duration_ms: int,
    winning_team: int,
) -> list[dict[str, Any]]:
    """One event per kill on the scoreboard, placed where the killer was standing."""
    events: list[dict[str, Any]] = []

    for killer in participants:
        enemies = [p for p in participants if p["team_id"] != killer["team_id"]]
        if not enemies:
            continue

        for index in range(killer["kills"]):
            # Kills spread over the game after an opening laning phase.
            share = (index + 1) / (killer["kills"] + 1)
            timestamp = round(duration_ms * (0.15 + 0.8 * share))
            victim = enemies[index % len(enemies)]
            position = _position_at(
                killer["puuid"],
                killer["position"],
                killer["team_id"],
                killer["team_id"] == winning_team,
                timestamp,
                duration_ms,
            )
            assists = [
                ids_by_puuid[mate["puuid"]]
                for mate in participants
                if mate["team_id"] == killer["team_id"]
                and mate["puuid"] != killer["puuid"]
            ][: index % 3]

            events.append(
                {
                    "timestamp": timestamp,
                    "type": "CHAMPION_KILL",
                    "killerId": ids_by_puuid[killer["puuid"]],
                    "victimId": ids_by_puuid[victim["puuid"]],
                    "assistingParticipantIds": assists,
                    "position": {"x": position[0], "y": position[1]},
                }
            )
    return events


def _objective_events(
    teams: list[dict[str, Any]], duration_ms: int
) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []

    for team in teams:
        team_id = team["team_id"]
        objectives = team.get("objectives", {})
        base = DRAGON_PIT if team_id == 100 else _mirror(DRAGON_PIT)

        for index in range(objectives.get("dragon", 0)):
            events.append(
                {
                    "timestamp": round(duration_ms * (0.2 + 0.18 * index)),
                    "type": "ELITE_MONSTER_KILL",
                    "monsterType": "DRAGON",
                    "monsterSubType": "FIRE_DRAGON",
                    "teamId": team_id,
                    "position": {"x": base[0], "y": base[1]},
                }
            )

        for index in range(objectives.get("rift_herald", 0)):
            events.append(
                {
                    "timestamp": round(duration_ms * 0.35),
                    "type": "ELITE_MONSTER_KILL",
                    "monsterType": "RIFTHERALD",
                    "teamId": team_id,
                    "position": {"x": HERALD_PIT[0], "y": HERALD_PIT[1]},
                }
            )

        for index in range(objectives.get("baron", 0)):
            events.append(
                {
                    "timestamp": round(duration_ms * 0.78),
                    "type": "ELITE_MONSTER_KILL",
                    "monsterType": "BARON_NASHOR",
                    "teamId": team_id,
                    "position": {"x": BARON_PIT[0], "y": BARON_PIT[1]},
                }
            )

        # Towers fall from the outside in, so walk each lane track towards the loser's base.
        for index in range(objectives.get("tower", 0)):
            lane = LANE_BY_BUILDING_INDEX[index % len(LANE_BY_BUILDING_INDEX)]
            track = LANE_TRACKS[
                {"MID_LANE": "MIDDLE", "TOP_LANE": "TOP", "BOT_LANE": "BOTTOM"}[lane]
            ]
            # Team 100 pushes towards the end of the track, team 200 towards the start.
            progress = 0.65 + 0.05 * index if team_id == 100 else 0.35 - 0.05 * index
            point = _sample_track(track, progress)
            events.append(
                {
                    "timestamp": round(duration_ms * (0.4 + 0.05 * index)),
                    "type": "BUILDING_KILL",
                    "buildingType": "TOWER_BUILDING",
                    "laneType": lane,
                    "teamId": 200 if team_id == 100 else 100,
                    "position": {"x": point[0], "y": point[1]},
                }
            )

    return events


def _ward_events(
    participants: list[dict[str, Any]], ids_by_puuid: dict[str, int], duration_ms: int
) -> list[dict[str, Any]]:
    """Riot carries no position on WARD_PLACED, so neither do we; these drive counts."""
    events: list[dict[str, Any]] = []
    for participant in participants:
        wards = max(1, participant.get("vision_score", 0) // 8)
        for index in range(wards):
            events.append(
                {
                    "timestamp": round(duration_ms * (index + 1) / (wards + 1)),
                    "type": "WARD_PLACED",
                    "creatorId": ids_by_puuid[participant["puuid"]],
                    "wardType": "YELLOW_TRINKET",
                }
            )
    return events


def build_timeline_payload(
    match_id: str, detail_json: str, duration_seconds: int
) -> dict[str, Any]:
    """A Riot-shaped timeline for a seeded match, ready for `distill_timeline`."""
    detail: dict[str, Any] = json.loads(detail_json)
    duration_ms = duration_seconds * 1000

    participants: list[dict[str, Any]] = []
    for team in detail["teams"]:
        for participant in team["participants"]:
            participants.append({**participant, "team_id": team["team_id"]})

    ids_by_puuid = {
        participant["puuid"]: index + 1
        for index, participant in enumerate(participants)
    }
    winning_team = next(
        (team["team_id"] for team in detail["teams"] if team["win"]), 100
    )

    events: list[dict[str, Any]] = []
    events.extend(_kill_events(participants, ids_by_puuid, duration_ms, winning_team))
    events.extend(_objective_events(detail["teams"], duration_ms))
    events.extend(_ward_events(participants, ids_by_puuid, duration_ms))
    for participant in participants:
        participant_id = ids_by_puuid[participant["puuid"]]
        events.extend(_levelling_events(participant_id, duration_ms))
        events.extend(_purchase_events(participant, participant_id, duration_ms))

    frames: list[dict[str, Any]] = []
    for timestamp in range(0, duration_ms + 1, FRAME_INTERVAL_MS):
        frames.append(
            {
                "timestamp": timestamp,
                "participantFrames": {
                    str(ids_by_puuid[participant["puuid"]]): _participant_frame(
                        participant,
                        ids_by_puuid[participant["puuid"]],
                        timestamp,
                        duration_ms,
                        participant["team_id"] == winning_team,
                    )
                    for participant in participants
                },
                "events": [
                    event
                    for event in events
                    if timestamp <= event["timestamp"] < timestamp + FRAME_INTERVAL_MS
                ],
            }
        )

    return {
        "metadata": {
            "matchId": match_id,
            "participants": [p["puuid"] for p in participants],
        },
        "info": {
            "frameInterval": FRAME_INTERVAL_MS,
            "gameId": 0,
            "participants": [
                {"participantId": participant_id, "puuid": puuid}
                for puuid, participant_id in ids_by_puuid.items()
            ],
            "frames": frames,
        },
    }
