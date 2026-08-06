import pytest

# from unittest.mock import AsyncMock, patch

# from fastapi import HTTPException
from app.services.analytics import LiveAnalyticsService
from typing import Any


def make_champion_stats(**overrides: Any):
    base = {
        "abilityPower": 10,
        "armor": 20,
        "armorPenPercent": 0,
        "attackDamage": 60,
        "attackSpeed": 100,
        "ccReduction": 0,
        "health": 500,
        "healthMax": 600,
        "healthRegen": 5,
        "lifesteal": 0,
        "magicPen": 0,
        "magicPenPercent": 0,
        "magicResist": 30,
        "movementSpeed": 350,
        "omnivamp": 0,
        "power": 30,
        "powerMax": 300,
        "physicalVamp": 0,
        "spellVamp": 0,
        "abilityHaste": 0,
        "cooldownReduction": 0,
    }
    base.update(overrides)
    return base


def make_damage_stats(**overrides: Any):
    base = {
        "magicDamageDone": 100,
        "magicDamageDoneToChampions": 50,
        "magicDamageTaken": 20,
        "physicalDamageDone": 200,
        "physicalDamageDoneToChampions": 80,
        "physicalDamageTaken": 40,
        "totalDamageDone": 300,
        "totalDamageDoneToChampions": 130,
        "totalDamageTaken": 60,
        "trueDamageDone": 0,
        "trueDamageDoneToChampions": 0,
        "trueDamageTaken": 0,
    }
    base.update(overrides)
    return base


def make_participant_frame(participant_id: str = "1", **overrides: Any) -> Any:
    base: Any = {
        "championStats": make_champion_stats(),
        "damageStats": make_damage_stats(),
        "currentGold": 500,
        "goldPerSecond": 2,
        "jungleMinionsKilled": 3,
        "level": 5,
        "minionsKilled": 40,
        "timeEnemySpentControlled": 0,
        "totalGold": 3000,
        "xp": 4000,
        "position": {"x": 100, "y": 200},
    }
    base.update(overrides)
    return base


def make_frame(
    timestamp: int = 60000, participants_ids: Any = None, events: Any = None
):
    participants_ids = participants_ids or [str(i) for i in range(1, 11)]
    response: Any = {
        "timestamp": timestamp,
        "participantFrames": {
            pid: make_participant_frame(pid) for pid in participants_ids
        },
        "events": events or [],
    }
    return response


def make_timeline(
    num_frames: int = 2, participants: Any = None, events_per_frame: Any = None
):
    participants = participants or [
        {"puuid": f"puuid-{i}", "participantId": i} for i in range(1, 11)
    ]
    frames = [
        make_frame(60000 * (i + 1), (events_per_frame or [[]] * num_frames)[i])
        for i in range(num_frames)
    ]

    response: Any = {
        "info": {"frames": frames, "participants": participants, "frameInterval": 60000}
    }
    return response


def make_match_participants(
    puuid: str = "puuid-1", participant_id: int = 1, **overrides: Any
):
    base: Any = {
        "puuid": puuid,
        "participantId": participant_id,
        "teamId": 100,
        "championId": 1,
        "championName": "Ahri",
        "kills": 5,
        "deaths": 2,
        "assits": 5,
        "champExperience": 1000,
        "champLevel": 10,
        "teamPosition": "MIDDLE",
        "lane": "MIDDLE",
        "role": "SOLO",
        "goldEarned": 10000,
        "challenges": {"kda": 5.0},
    }
    base.update(overrides)
    return base


def make_match_detail(participants: Any = None, teams: Any = None, **overrides: Any):
    participants = participants or [make_match_participants()]
    teams = teams or [
        {
            "teamId": 100,
            "win": True,
            "bans": [{"championId": 99, "pickTurn": 1}],
            "objectives": {
                "baron": {"first": True, "kills": 1},
                "champion": {"first": True, "kills": 20},
                "dragon": {"first": False, "kills": 2},
                "horde": {"first": False, "kills": 0},
                "inhibitor": {"first": True, "kills": 1},
                "riftHerald": {"first": False, "kills": 1},
                "tower": {"first": True, "kills": 5},
            },
        }
    ]
    info: Any = {
        "endOfGameResult": "GameComplete",
        "gameDuration": 1800,
        "gameMode": "Classic",
        "gameName": "Ranked",
        "mapId": 11,
        "platformId": "NA1",
        "participants": "participants",
        "teams": teams,
    }
    info.update(overrides)
    return {"info": info}


@pytest.mark.anyio
class TestAnalytics:

    @staticmethod
    def test_find_participant_id_found():
        participants: Any = [
            {"puuid": "a", "participantId": 1},
            {"puuid": "b", "participantId": 2},
        ]
        assert LiveAnalyticsService.find_participant_id(participants, "b") == "2"

    @staticmethod
    def test_find_participant_id_not_found():
        participants: Any = [
            {"puuid": "a", "participantId": 1},
            {"puuid": "b", "participantId": 2},
        ]
        assert LiveAnalyticsService.find_participant_id(participants, "zzz") is None

    @staticmethod
    def test_get_champion_stats():
        frames = [make_frame(), make_frame()]
        stats = LiveAnalyticsService.get_champion_stats(frames, "1")
        assert stats.armor == [20, 20]
        assert stats.attackDamage == [60, 60]
        assert len(stats.abilityPower) == 2

    @staticmethod
    def test_get_damage_stats():
        frames = [make_frame(), make_frame()]
        stats = LiveAnalyticsService.get_damage_stats(frames, "1")
        assert stats.totalDamageDone == [300, 300]
        assert stats.magicDamageDoneToChampions == [50, 50]

    @staticmethod
    def test_get_participants_stats():
        frames = [make_frame()]
        stats = LiveAnalyticsService.get_participants_data(frames, "1")
        assert stats.participantId == "1"
        assert stats.currentGold == [500]
        assert stats.level == [5]

    # @staticmethod
    # async def test_map_replay_uses_provided_data():
    #     timeline = make_timeline()
    #     result = await LiveAnalyticsService.map_replay("match-1", data=timeline)

    #     assert result.frame_interval == 60000
    #     assert len(result.timestamp) == 2
    #     assert result.puuid == [f"puuid-{i}" for i in range(1, 11)]
    #     assert len(result.position_x["1"]) == 2

    # @staticmethod
    # @patch("app.services.analytics.riot_service")
    # async def test_map_replay_fecthes_no_provided_data(mock_riot_service: Any):
    #     timeline: Any = make_timeline(1)
    #     mock_riot_service.get_match_timeline = AsyncMock(return_value=timeline)
    #     result = await LiveAnalyticsService.map_replay("match-1")
    #     mock_riot_service.get_match_timeline.assert_called_once_with("match-1")
    #     assert result.frame_interval == 60000
