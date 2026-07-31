"""Distillation tests for the Match-V5 timeline.

Fetching needs a live Riot key, so these cover the transform: that Riot's
`participantId`-keyed payload comes out keyed by PUUID, that only the event types the
client draws survive, and that the fields each event type carries land in the right
place.
"""

from typing import Any

from app.schemas.spatial_schemas import Coordinate
from app.services.spatial_service import (
    heatmap_intensity,
    map_bounds_for,
    path_distance,
)
from app.services.timeline_ingest import distill_timeline

PUUID_ONE = "puuid-one"
PUUID_TWO = "puuid-two"


def _participant_frame(participant_id: int, x: int, y: int) -> dict[str, Any]:
    return {
        "participantId": participant_id,
        "position": {"x": x, "y": y},
        "level": 6,
        "xp": 5000,
        "minionsKilled": 80,
        "jungleMinionsKilled": 10,
        "currentGold": 300,
        "totalGold": 5200,
        "championStats": {
            "health": 1200,
            "healthMax": 1400,
            "armor": 60,
            "magicResist": 40,
            "attackDamage": 90,
            "abilityPower": 0,
            "movementSpeed": 380,
        },
        "damageStats": {"totalDamageDoneToChampions": 4200},
    }


def _payload(events: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    return {
        "metadata": {"matchId": "EUW1_1"},
        "info": {
            "frameInterval": 60_000,
            "participants": [
                {"participantId": 1, "puuid": PUUID_ONE},
                {"participantId": 2, "puuid": PUUID_TWO},
            ],
            "frames": [
                {
                    "timestamp": 0,
                    "participantFrames": {
                        "1": _participant_frame(1, 100, 100),
                        "2": _participant_frame(2, 900, 900),
                    },
                    "events": events or [],
                },
                {
                    "timestamp": 60_000,
                    "participantFrames": {
                        "1": _participant_frame(1, 400, 100),
                        "2": _participant_frame(2, 900, 900),
                    },
                    "events": [],
                },
            ],
        },
    }


def test_frames_are_rekeyed_from_participant_id_to_puuid():
    distilled = distill_timeline(_payload())

    assert len(distilled["frames"]) == 2
    puuids = {p["puuid"] for p in distilled["frames"][0]["participants"]}
    assert puuids == {PUUID_ONE, PUUID_TWO}


def test_participant_frame_flattens_the_stat_blocks():
    distilled = distill_timeline(_payload())
    frame = distilled["frames"][0]["participants"][0]

    assert frame["cs"] == 90  # lane minions + jungle camps
    assert frame["health"] == 1200
    assert frame["health_max"] == 1400
    assert frame["armor"] == 60
    assert frame["movement_speed"] == 380
    assert frame["damage_to_champions"] == 4200


def test_only_drawable_event_types_are_kept():
    distilled = distill_timeline(
        _payload(
            [
                {"timestamp": 1, "type": "PAUSE_END"},
                {"timestamp": 2, "type": "TURRET_PLATE_DESTROYED", "teamId": 100},
                {"timestamp": 3, "type": "GAME_END"},
                {
                    "timestamp": 4,
                    "type": "SKILL_LEVEL_UP",
                    "participantId": 1,
                    "skillSlot": 2,
                },
            ]
        )
    )

    kept = [event["type"] for event in distilled["events"]]
    assert kept == ["SKILL_LEVEL_UP"]
    assert distilled["events"][0]["actor_puuid"] == PUUID_ONE
    assert distilled["events"][0]["skill_slot"] == 2


def test_champion_kill_carries_killer_victim_and_assists():
    distilled = distill_timeline(
        _payload(
            [
                {
                    "timestamp": 30_000,
                    "type": "CHAMPION_KILL",
                    "killerId": 1,
                    "victimId": 2,
                    "assistingParticipantIds": [2, 99],
                    "position": {"x": 500, "y": 500},
                }
            ]
        )
    )
    event = distilled["events"][0]

    assert event["actor_puuid"] == PUUID_ONE
    assert event["victim_puuid"] == PUUID_TWO
    # Participant 99 is not in this match and must not produce a phantom assist.
    assert event["assist_puuids"] == [PUUID_TWO]
    assert event["position"] == {"x": 500, "y": 500}


def test_ward_placed_uses_creator_id_and_has_no_position():
    distilled = distill_timeline(
        _payload(
            [
                {
                    "timestamp": 5_000,
                    "type": "WARD_PLACED",
                    "creatorId": 2,
                    "wardType": "CONTROL_WARD",
                }
            ]
        )
    )
    event = distilled["events"][0]

    assert event["actor_puuid"] == PUUID_TWO
    assert event["ward_type"] == "CONTROL_WARD"
    assert event["position"] is None


def test_elite_monster_falls_back_to_killer_team_id():
    """Riot names the team `teamId` on buildings but `killerTeamId` on monsters."""
    distilled = distill_timeline(
        _payload(
            [
                {
                    "timestamp": 40_000,
                    "type": "ELITE_MONSTER_KILL",
                    "killerId": 1,
                    "killerTeamId": 100,
                    "monsterType": "DRAGON",
                    "position": {"x": 9866, "y": 4414},
                },
                {
                    "timestamp": 41_000,
                    "type": "BUILDING_KILL",
                    "teamId": 200,
                    "buildingType": "TOWER_BUILDING",
                    "laneType": "MID_LANE",
                },
            ]
        )
    )
    monster, building = distilled["events"]

    assert monster["team_id"] == 100
    assert monster["monster_type"] == "DRAGON"
    assert building["team_id"] == 200
    assert building["building_type"] == "TOWER_BUILDING"


def test_distance_travelled_is_computed_per_player():
    distilled = distill_timeline(_payload())
    by_puuid = {p["puuid"]: p["distance_travelled"] for p in distilled["participants"]}

    assert by_puuid[PUUID_ONE] == 300.0  # (100,100) -> (400,100)
    assert by_puuid[PUUID_TWO] == 0.0


def test_path_distance_ignores_recalls_and_teleports():
    walked = [Coordinate(x=0, y=0), Coordinate(x=300, y=0)]
    assert path_distance(walked) == 300.0

    # A jump across the map is a recall, not ground covered.
    recalled = [Coordinate(x=0, y=0), Coordinate(x=14_000, y=0)]
    assert path_distance(recalled) == 0.0


def test_heatmap_sums_to_one_and_puts_the_top_of_the_map_in_row_zero():
    bounds = map_bounds_for(11)
    top_of_map = Coordinate(x=100, y=bounds[3] - 100)
    cells = heatmap_intensity([top_of_map], 11, grid=8)

    assert sum(cells) == 1.0
    assert cells[0] == 1.0  # row 0, column 0


def test_heatmap_of_an_empty_path_is_all_zeroes():
    cells = heatmap_intensity([], 11, grid=4)
    assert cells == [0.0] * 16
