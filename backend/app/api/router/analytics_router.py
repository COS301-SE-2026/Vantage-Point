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
    "/analytics/map-replay/{match_id}",
    response_model=MapReplay,
    tags=["Analytics"]
)
async def map_replay(_: Annotated[User, Depends(require_group(10))], match_id: str):
    return await LiveAnalyticsService.map_replay(match_id)

@router.get(
    "/analytics/map_suggest_data/{match_id}",
    response_model=MapSuggestData,
    tags=["Analytics"]
)
async def map_suggest_data(_: Annotated[User, Depends(require_group(10))], match_id: str):
    return await LiveAnalyticsService.map_suggest_data(match_id)

@router.get(
    "/analytics/profile_data/{match_id}",
    response_model=ProfileData,
    tags=["Analytics"]
)
async def profile_data(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str):
    return await LiveAnalyticsService.profile_data(match_id, puuid)

@router.get(
    "/analytics/match_data/{match_id}",
    response_model=MatchData,
    tags=["Analytics"]
)
async def match_data(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str):
    return await LiveAnalyticsService.match_data(match_id, puuid)

@router.get(
    "/analytics/match_data/{match_id}",
    response_model=ChampionData,
    tags=["Analytics"]
)
async def champion_data(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str):
    return await LiveAnalyticsService.champion_data(match_id, puuid)