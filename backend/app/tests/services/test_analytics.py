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