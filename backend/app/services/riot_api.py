import os
import httpx
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()

API_KEY: str | None = os.getenv("RIOT_API_KEY")

# Riot ID lookups use regional routing (americas, europe, asia)
BASE_URL = "https://americas.api.riotgames.com"


async def get_puuid_by_riot_id(game_name: str, tag_line: str) -> str | None:
    """Get PUUID by Riot ID (game name + tag)."""
    if not API_KEY:
        raise ValueError("RIOT_API_KEY environment variable is not set")

    # Safely encode user inputs
    safe_game_name = quote(game_name, safe='')
    safe_tag_line = quote(tag_line, safe='')

    url = f"{BASE_URL}/riot/account/v1/accounts/by-riot-id/{safe_game_name}/{safe_tag_line}"
    headers: dict[str, str] = {"X-Riot-Token": API_KEY}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

        if response.status_code == 200:
            puuid: str | None = response.json().get("puuid")
            return puuid
        elif response.status_code == 429:
            print("Rate limit hit!")
        elif response.status_code == 404:
            print("Player not found.")
        return None


# Neo : I created this for the purpose of testing the Riot API connection
# needs to be actually made for it using the MATCH V5 Api
