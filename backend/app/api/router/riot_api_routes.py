from app.services.riot_service import RiotServiceDep
from fastapi import APIRouter
from typing import Any

router = APIRouter()


async def get_match_detail(match_id: str, riot: RiotServiceDep) -> Any:
    return await riot.get_match_detail(match_id)


