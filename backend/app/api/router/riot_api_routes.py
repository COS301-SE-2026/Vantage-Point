from app.services.riot_service import RiotServiceDep
from fastapi import APIRouter
from typing import Any
from app.services.riot_api import get_puuid_by_riot_id

router = APIRouter()

@router.get(
        "/riot/get-match",
        tags=["riot"],
)
async def get_match_detail(match_id: str, riot: RiotServiceDep) -> Any:
    return await riot.get_match_detail(match_id)

async def get_match_timeline(match_id: str, riot: RiotServiceDep) -> Any:
    return await riot.get_match_timeline(match_id)

async def get_match_ids(riot: RiotServiceDep, server_region: str, puuid: str, count: int=5) -> Any:
    return await riot.get_match_ids(server_region, puuid, count)

async def get_puuid_by_riot_id(game_name: str, tag_line: str) -> str | None:
    return await get_puuid_by_riot_id(game_name, tag_line)

async def get_summoner_data(riot: RiotServiceDep, puuid: str) -> Any:
    return await riot.get_summoner_data(puuid)

