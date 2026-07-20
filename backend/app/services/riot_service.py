import os
import httpx
from dotenv import load_dotenv
from app.config import get_settings
from fastapi import HTTPException, Depends
from typing import Any, Annotated

load_dotenv()

API_KEY = os.getenv("RIOT_API_KEY")
# Riot ID lookups use regional routing (americas, europe, asia)
BASE_URL = "https://americas.api.riotgames.com"
settings = get_settings()

class RiotService:
    def __init__(self):
        self.headers = {"X-Riot-Token": settings.riot_api_key}
        self.account_url = (
            "https://europe.api.riotgames.com"  # Region (americas, europe, etc)
        )
        self.platform_url = (
            "https://euw1.api.riotgames.com"  # Platform (na1, euw1, etc)
        )

    def _get_macro_region(self, server_region: str) -> str:
        """Maps a local Riot server region to its Match-V5 macro-region."""
        region_map = {
            # Americas
            "na1": "americas",
            "br1": "americas",
            "la1": "americas",
            "la2": "americas",
            # Europe
            "euw1": "europe",
            "eun1": "europe",
            "tr1": "europe",
            "ru": "europe",
            # Asia
            "kr": "asia",
            "jp1": "asia",
            # South East Asia
            "oc1": "sea",
            "ph2": "sea",
            "sg2": "sea",
            "th2": "sea",
            "tw2": "sea",
            "vn2": "sea",
        }

        # Default to americas if somehow not found
        return region_map.get(server_region.lower(), "americas")

    async def get_puuid(self, game_name: str, tag_line: str) -> str:
        """
        In 2024+, you must use the Account-V1 API to get a PUUID
        via GameName and TagLine (e.g., Hide on bush #KR1).
        """
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
        """Gets level and profile icon using the PUUID."""
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
        # Fetches a list of match IDs for a given PUUID

        macro_region = self._get_macro_region(server_region)
        # Dynamically inject the macro-region into the URL
        base_url = f"https://{macro_region}.api.riotgames.com"
        endpoint = f"/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}"
        url = base_url + endpoint

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)

        if response.status_code == 200:
            # Explicitly cast to list[str] to prevent Pylance "Unknown" errors
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
        """
        Fetches the complete MatchDto dictionary from Riot's Match-V5 API.
        """

        server_region = match_id.split("_")[0].lower()
        macro_region = self._get_macro_region(server_region)
        url = (
            f"https://{macro_region}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        )
        # change store object and if it is alreayd just return object instead of having to call again
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
        """
        Going to be used when we need to get timeline data. Then will be filtered at perspective endpoints
        """
        server_region = match_id.split("_")[0].lower()
        macro_region = self._get_macro_region(server_region)
        url = f"https://{macro_region}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"

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