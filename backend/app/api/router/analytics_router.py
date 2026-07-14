from fastapi import APIRouter, Depends
from app.Models.auth_model import User
from app.api.auth import require_group
from typing import Annotated
from app.services.analytics import LiveAnalyticsService
from app.Models.riot_schemas import (
    MapReplay,
    MapSuggestData,
    ProfileData,
    MatchData,
    ChampionData,
    ItemData,
    SkillData,
    RoleData,
)

router = APIRouter()

@router.get(
    "/analytics/map-replay/{matchId}",
    response_model=MapReplay,
    tags=["Analytics"]
)
async def map_replay(_: Annotated[User, Depends(require_group(10))], matchId: str):
    return await LiveAnalyticsService.map_replay(matchId)