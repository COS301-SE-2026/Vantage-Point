import os
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("RIOT_API_KEY")
# Riot ID lookups use regional routing (americas, europe, asia)
BASE_URL = "https://americas.api.riotgames.com" 

async def get_puuid_by_riot_id(game_name: str, tag_line: str):
    url = f"{BASE_URL}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    headers = {"X-Riot-Token": API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json().get("puuid")
        elif response.status_code == 429:
            print("⚠️ Rate limit hit! Slow down.")
        elif response.status_code == 404:
            print("❌ Player not found.")
        return None