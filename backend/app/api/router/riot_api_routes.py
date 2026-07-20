from app.services.riot_service import RiotServiceDep
from fastapi import APIRouter
from typing import Any

router = APIRouter()


async def get_match_detail(match_id: str, riot: RiotServiceDep) -> Any:
    return await riot.get_match_detail(match_id)

async def get_match_timeline(match_id: str, riot: RiotServiceDep):
    return await riot.get_match_timeline(match_id)

async def get_match_ids(riot: RiotServiceDep, server_region: str, puuid: str, count: int=5):
    return await riot.get_match_ids(server_region, puuid, count)
