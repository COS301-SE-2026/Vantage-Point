import os
import httpx
from dotenv import load_dotenv
from app.config import get_settings
from fastapi import HTTPException

load_dotenv()

API_KEY = os.getenv("RIOT_API_KEY")
# Riot ID lookups use regional routing (americas, europe, asia)
BASE_URL = "https://americas.api.riotgames.com"
settings = get_settings()


class RiotService:
    def __init__(self):
        self.headers = {"X-Riot-Token": settings.riot_api_key}
        # Riot uses different base URLs for account data vs game data
        self.account_url = (
            "https://europe.api.riotgames.com"  # Region (americas, europe, etc)
        )
        self.platform_url = (
            "https://euw1.api.riotgames.com"  # Platform (na1, euw1, etc)
        )

    async def get_puuid(self, game_name: str, tag_line: str):
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
            return response.json()["puuid"]

    async def get_summoner_data(self, puuid: str):
        """Gets level and profile icon using the PUUID."""
        url = f"{self.platform_url}/lol/summoner/v4/summoners/by-puuid/{puuid}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            return response.json()

    def set_api_key(self, new_key: str):
        """
        Updates the internal headers with a new API key.
        """
        self.headers["X-Riot-Token"] = new_key
        return {"status": "success", "message": "Service headers updated"}


riot_service = RiotService()


# Neo : I created this for the purpose of testing the Riot API connection
# needs to be actually made for it using the MATCH V5 Api
