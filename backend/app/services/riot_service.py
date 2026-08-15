import os
import re
from typing import Annotated, Any
from urllib.parse import quote

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
import httpx

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
from app.database.models import Users
from botocore.exceptions import ClientError

from app.config import get_settings

load_dotenv()

API_KEY = os.getenv("RIOT_API_KEY")
BASE_URL = "https://americas.api.riotgames.com"
settings = get_settings()


async def get_region(session: AsyncSession, cognito_sub: str) -> str:
    try:
        statement = select(Users).where(
                    Users.cognito_sub == cognito_sub
                )  # need to change when email gets added to db
        result: Any = await session.execute(statement)
        user: Users | None = result.scalar_one_or_none()

        if user is None:  
            # idea behind this is if not in our db does not exist in cognito. Hence can look for in our db. Due to need to get profile to updatye
            raise HTTPException(status_code=400, detail="User does not exist.")

        if user.region is None: 
            raise HTTPException(status_code=404, detail="User missing play region")
        
        return user.region
    except ClientError as e:
        print(e.response)
        raise

def filter_match_for_players(
    match_data: dict[str, Any] | None = None,
    player_ids: list[str] | str | None = None,
    full_match: dict[str, Any] | None = None,
    target_puuid: str | list[str] | None = None,
) -> dict[str, Any]:
    """
    Filters match details to retain participants matching the given player ID(s)/PUUID(s).
    Supports positional args, match_data/player_ids, and full_match/target_puuid kwargs.
    """
    data = full_match if full_match is not None else match_data
    if not data or "info" not in data:
        return data or {}

    raw_targets = target_puuid if target_puuid is not None else player_ids
    if raw_targets is None:
        targets: set[str] = set()
    elif isinstance(raw_targets, str):
        targets = {raw_targets}
    else:
        targets = set(raw_targets)

    if not targets:
        return data

    participants = data.get("info", {}).get("participants", [])
    data["info"]["participants"] = [
        p
        for p in participants
        if p.get("puuid") in targets or p.get("summonerId") in targets
    ]
    return data


# Match-V5 is served per macro-region rather than per platform, so every match call has
# to map the player's local server across first.
MACRO_REGIONS = {
    "na1": "americas",
    "br1": "americas",
    "la1": "americas",
    "la2": "americas",
    "euw1": "europe",
    "eun1": "europe",
    "tr1": "europe",
    "ru": "europe",
    "kr": "asia",
    "jp1": "asia",
    "oc1": "sea",
    "ph2": "sea",
    "sg2": "sea",
    "th2": "sea",
    "tw2": "sea",
    "vn2": "sea",
}


def get_macro_region(server_region: str) -> str:
    """Maps a local Riot server region to its Match-V5 macro-region."""
    return MACRO_REGIONS.get(server_region.lower(), "americas")


class RiotService:
    def __init__(self):
        self.headers = {"X-Riot-Token": settings.riot_api_key}
        self.account_url = "https://europe.api.riotgames.com"
        self.platform_url = "https://euw1.api.riotgames.com"

    def _get_macro_region(self, server_region: str) -> str:
        return get_macro_region(server_region)

    async def get_puuid(self, game_name: str, tag_line: str) -> str:
        url = f"{self.account_url}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, detail="Summoner not found"
                )

            data = response.json()
            puuid = data.get("puuid")

            if not isinstance(puuid, str):
                raise HTTPException(status_code=500, detail="Invalid Riot API Response")

            return puuid

    async def get_summoner_data(self, puuid: str):
        url = f"{self.platform_url}/lol/summoner/v4/summoners/by-puuid/{puuid}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=404, detail="Summoner data not found for this PUUID."
                )
            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded: Riot is throttling requests.",
                )
            elif response.status_code in (401, 403):
                raise HTTPException(
                    status_code=401, detail="Unauthorized: Check your Riot API Key."
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Riot API Error: {response.text}",
                )

    async def get_match_ids(
        self, server_region: str, puuid: str, count: int = 5
    ) -> list[str]:
        macro_region = self._get_macro_region(server_region)
        base_url = f"https://{macro_region}.api.riotgames.com"
        endpoint = f"/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}"
        url = base_url + endpoint

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)

        if response.status_code == 200:
            return list(response.json())
        elif response.status_code == 401:
            raise HTTPException(
                status_code=401, detail="Unauthorized: Your Riot API Key has expired"
            )
        elif response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded: Riot is throttling requests",
            )
        elif response.status_code == 404:
            raise HTTPException(
                status_code=404, detail="Data not found: PUUID has no match history"
            )
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch match IDs from Riot",
            )

    async def get_match_detail(self, match_id: str) -> Any:
        server_region = match_id.split("_")[0].lower()
        macro_region = self._get_macro_region(server_region)
        url = (
            f"https://{macro_region}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        )
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail=f"Match {match_id} not found on Riot servers",
                )
            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="Riot API rate limit exceeded. Try again later.",
                )
            elif response.status_code == 403:
                raise HTTPException(
                    status_code=403, detail="Riot API key is invalid or expired."
                )
            else:
                error_text: str = str(response.text)
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Riot API Error: {error_text}",
                )

    async def get_match_timeline(self, match_id: str) -> Any:
        MATCH_ID_PATTERN = re.compile(r"^[a-zA-Z0-9]+_\d+$")

        if not MATCH_ID_PATTERN.match(match_id):
            raise HTTPException(
                status_code=400, detail="Invalid match ID format provided."
            )

        server_region = match_id.split("_")[0].lower()
        macro_region = self._get_macro_region(server_region)

        safe_match_id = quote(match_id, safe="")
        url = f"https://{macro_region}.api.riotgames.com/lol/match/v5/matches/{safe_match_id}/timeline"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 403:
                raise HTTPException(
                    status_code=403, detail="Riot API key is invalid or expired."
                )
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail=f"Match {match_id} not found on Riot servers",
                )
            elif response.status_code == 429:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded. Please try again later.",
                )
            else:
                error_text: str = str(response.text)
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Riot API Error: {error_text}",
                )


riot_service = RiotService()


def get_riot_service() -> RiotService:
    return RiotService()


RiotServiceDep = Annotated[RiotService, Depends(get_riot_service)]
