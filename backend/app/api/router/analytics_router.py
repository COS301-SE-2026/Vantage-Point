from fastapi import APIRouter, Depends
from app.Models.auth_model import User
from app.api.auth import require_group
from typing import Annotated
from app.services.analytics import LiveAnalyticsService, LiveAnalyticsServiceDep
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
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session

router = APIRouter()


@router.get(
    "/analytics/map-replay/{match_id}", response_model=MapReplay, tags=["Analytics"]
)
async def map_replay(
    _: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    match_id: str,
    puuid: str,
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.map_replay(analytics_service, match_id, session, puuid)


@router.get(
    "/analytics/map_suggest_data/{match_id}",
    response_model=MapSuggestData,
    tags=["Analytics"],
)
async def map_suggest_data(
    _: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    match_id: str,
    puuid: str,
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.map_suggest_data(analytics_service,match_id, puuid, session)


@router.get(
    "/analytics/profile_data/{match_id}", response_model=ProfileData, tags=["Analytics"]
)
async def profile_data(
    _: Annotated[User, Depends(require_group(10))],
    match_id: str,
    puuid: str,
    session: Annotated[AsyncSession, Depends(get_session)],
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.profile_data(analytics_service, match_id, puuid, session)


@router.get(
    "/analytics/match_data/{match_id}", response_model=MatchData, tags=["Analytics"]
)
async def match_data(
    _: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    match_id: str,
    puuid: str,
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.match_data(analytics_service, session, match_id, puuid)


@router.get(
    "/analytics/champion_data/{match_id}",
    response_model=ChampionData,
    tags=["Analytics"],
)
async def champion_data(
    _: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str,
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.champion_data(analytics_service, match_id, puuid)


@router.get(
    "/analytics/item_data/{match_id}", response_model=ItemData, tags=["Analytics"]
)
async def item_data(
    _: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    match_id: str,
    puuid: str,
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.item_data(analytics_service, match_id, puuid, session)


@router.get(
    "/analytics/skill_data/{match_id}", response_model=SkillData, tags=["Analytics"]
)
async def skill_data(
    _: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    match_id: str,
    puuid: str,
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.skill_data(analytics_service, match_id, puuid, session)


@router.get(
    "/analytics/role_data/{match_id}", response_model=RoleData, tags=["Analytics"]
)
async def role_data(
    _: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str,
    analytics_service: LiveAnalyticsServiceDep,
):
    return await LiveAnalyticsService.role_data(analytics_service, match_id, puuid)
