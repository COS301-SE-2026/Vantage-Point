from app.services.riot_service import RiotServiceDep
from fastapi import APIRouter
from typing import Any
from app.services.riot_api import get_puuid_by_riot_id

router = APIRouter()

@router.get(
        "/riot/get-match",
        summary="Gets a match detail",
        description="Takes in match id and then goes and extracts the data of a match from the riot api(matchv5)",
        tags=["riot"],
)
async def get_match_detail(match_id: str, riot: RiotServiceDep) -> Any:
    return await riot.get_match_detail(match_id)

@router.get(
        "/riot/get-timeline",
        summary="Gets a match timeline",
        description="Takes in match id and then goes and extracts the data of a match timeline from the riot api(matchv5)",
        tags=["riot"],
)
async def get_match_timeline(match_id: str, riot: RiotServiceDep) -> Any:
    return await riot.get_match_timeline(match_id)

@router.get(
        "/riot/get-match-ids",
        summary="Gtes the match ids of a certain player for x amount",
        description="It takes in player id and amount of games you want. It then goes and look at the server where the player played and extracts the x" \
        "amount of games specified",
        tags=["riot"],
)
async def get_match_ids(riot: RiotServiceDep, server_region: str, puuid: str, count: int=5) -> Any:
    return await riot.get_match_ids(server_region, puuid, count)

@router.get(
        "/riot/get_puuid_by_riot_id",
        summary="Gets the player id using his riot id",
        tags=["riot"],
)
async def get_puuid(game_name: str, tag_line: str) -> str | None:
    return await get_puuid_by_riot_id(game_name, tag_line)

@router.get(
        "/riot/get_summoner_data",
        summary="Gets the sumoner level, profile icon and last time modified using the player id",
        tags=["riot"],
)
async def get_summoner_data(riot: RiotServiceDep, puuid: str) -> Any:
    return await riot.get_summoner_data(puuid)

