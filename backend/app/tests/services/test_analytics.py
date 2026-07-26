from pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException
from app.services.analytics import LiveAnalyticsService
from typing import Any

def make_champion_stats(**overrides: Any):
    base = {
        "abilityPower": 10, "armor": 20, "armorPenPercent": 0, "attackDamage": 60,
        "attackSpeed": 100, "ccReduction": 0, "health": 500, "healthMax": 600,
        "healthRegen": 5, "lifesteal": 0, "magicPen": 0, "magicPenPercent": 0,
        "magicResist": 30, "movementSpeed": 350, "omnivamp": 0, "power": 30, 
        "powerMax": 300, "physicalVamp": 0, "spellVamp": 0, "abilityHaste": 0,
        "cooldownReduction": 0
    }
    base.update(overrides)
    return base

def make_damage_stats(**overrides: Any):
    base = {
        "magicDamageDone": 100, "magicDamageDoneToChampions": 50, "magicDamageTaken": 20,
        "physicalDamageDone": 200, "physicalDamageDoneToChampions": 80, "physicalDamageTaken": 40,
        "totalDamageDone": 300, "totalDamageDoneToChampions": 130 ,"totalDamageTaken": 60,
        "trueDamageDone": 0, "trueDamageDoneToChampions": 0, "trueDamageTaken": 0
    }
    base.update(overrides)
    return base

def make_participant_frame(participant_id: str="1", **overrides: Any) -> Any:
    base: Any = {
        "championStates": make_champion_stats(),
        "damageStats": make_damage_stats(),
        "currentGold": 500, "goldPerSecond": 2, "jungleMinionsKilled": 3,
        "level": 5, "minionsKilled": 40, "timeSpentControlled": 0,
        "totalGold": 3000, "xp": 4000,
        "position": {"x": 100, "y": 200}
    }
    base.update(overrides)
    return base

def make_frame(timestamp: int=60000, participants_ids: Any=None, events: Any=None):
    participants_ids = participants_ids or [str(i) for i in range(1, 11)]
    response: Any = {
        "timestamp": timestamp,
        "participantFrames": {pid: make_participant_frame(pid) for pid in participants_ids},
        "events": events or []
    }
    return response

def make_timeline(num_frames: int=2, participants: Any= None, events_per_frame: Any=None):
    participants = participants or [
        {"puuid": f"puuid-{i}", "participantId": i} for i in range(1, 11)
    ]
    frames = [
        make_frame(60000 * (i+1), (events_per_frame or [[]] * num_frames)[i])
        for i in range(num_frames)
    ]

    response: Any = {
        "info": {
            "frames": frames,
            "participants": participants,
            "frameInterval": 60000
        }
    }
    return response

def make_match_particpants(puuid: str="puuid-1", particpant_id:int=1, **overrides: Any):
    base: Any = {
        "puuid": puuid, "particpantId": particpant_id, "teamId":100,
        "championId": 1, "championName": "Ahri", "kills": 5, "deaths": 2, "assits": 5,
        "champExperience": 1000, "champLevel": 10, "teamPosition": "MIDDLE", "lane": "MIDDLE",
        "role": "SOLO", "goldEarned": 10000, "challenges": {"kda": 5.0}
    }
    base.update(overrides)
    return base

def make_match_detail(particpants=None, teams=None, **overrides):
    particpants = particpants or [make_match_particpants]
    teams = teams or [
        {
            "teamdId": 100, "win": True, "bans": [{"championId": 99, "pickTurn": 1}],
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
        "particpants": "participants",
        "teams": teams
    }
    info.update(overrides)
    return {"info": info}