import os
import httpx
from dotenv import load_dotenv
from app.config import get_settings
from fastapi import HTTPException
from typing import Any
from app.schemas.riot_schemas import SimplifiedPlayerStats, SimplifiedMatchResponse, SimplifiedTeammate

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

    async def get_match_ids(self, puuid: str, count: int = 5) -> list[str]:
        #Fetches a list of match IDs for a given PUUID
        url = f"{self.account_url}/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)

        if response.status_code == 200:
            #Explicitly cast to list[str] to prevent Pylance "Unknown" errors
            return list(response.json())
        elif response.status_code == 401:
            raise HTTPException(status_code=401, detail="Unauthorized: Your Riot API Key has expired")
        elif response.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limit exceeded: Riot is throttling requests")
        elif response.status_code == 404:
            raise HTTPException(status_code=404, detail="Data not found: PUUID has no match history")
        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch match IDs from Riot")
            
riot_service = RiotService()

def simplify_participant(participant: Any) -> SimplifiedPlayerStats:
    """Converts a raw Riot ParticipantDto into your clean format"""
    
    deaths_safe = max(participant.deaths, 1)
    calculated_kda = round((participant.kills + participant.assists) / deaths_safe, 2)
    
    name = participant.summonerName
    if hasattr(participant, "riotIdGameName") and participant.riotIdGameName:
        name = f"{participant.riotIdGameName}#{participant.riotIdTagline}"

    assigned_role = participant.teamPosition if participant.teamPosition else "UNKNOWN"

    primary_runes = None
    secondary_runes = None
    
    if hasattr(participant, "perks") and participant.perks.styles:
        for style in participant.perks.styles:
            if style.description == "primaryStyle":
                primary_runes = [selection.perk for selection in style.selections]
            elif style.description == "subStyle":
                secondary_runes = [selection.perk for selection in style.selections]

    return SimplifiedPlayerStats(
        summoner_name=name,
        champion_name=participant.championName,
        kills=participant.kills,
        deaths=participant.deaths,
        assists=participant.assists,
        kda=calculated_kda,
        role=assigned_role,
        double_kills=participant.doubleKills,
        triple_kills=participant.tripleKills,
        quadra_kills=participant.quadraKills,
        penta_kills=participant.pentaKills,
        largest_multikill=participant.largestMultiKill,
        primary_runes=primary_runes,
        secondary_runes=secondary_runes
    )


