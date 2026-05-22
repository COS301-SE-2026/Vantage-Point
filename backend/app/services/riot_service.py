import os
import httpx
from dotenv import load_dotenv
from app.config import get_settings
from fastapi import HTTPException
from typing import Any, Optional
from app.schemas.riot_schemas import (
    SimplifiedPlayerStats,
    SimplifiedMatchResponse,
    SimplifiedTeammate,
)

load_dotenv()

API_KEY = os.getenv("RIOT_API_KEY")
# Riot ID lookups use regional routing (americas, europe, asia)
BASE_URL = "https://americas.api.riotgames.com"
settings = get_settings()


def get_macro_region(server_region: str) -> str:
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

    def set_api_key(self, new_key: str):
        """
        Updates the internal headers with a new API key.
        """
        self.headers["X-Riot-Token"] = new_key
        return {"status": "success", "message": "Service headers updated"}

    async def get_match_ids(
        self, server_region: str, puuid: str, count: int = 5
    ) -> list[str]:
        # Fetches a list of match IDs for a given PUUID

        macro_region = get_macro_region(server_region)
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
        macro_region = get_macro_region(server_region)
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


riot_service = RiotService()


def simplify_participant(participant: Any) -> SimplifiedPlayerStats:
    """Converts a raw Riot ParticipantDto into your clean format"""

    deaths_safe = max(participant["deaths"], 1)
    calculated_kda = round(
        (participant["kills"] + participant["assists"]) / deaths_safe, 2
    )

    game_name = participant.get("riotIdGameName")
    tag_line = participant.get("riotIdTagline")
    fallback_name = participant.get("summonerName")

    if game_name and tag_line:
        name = f"{game_name}#{tag_line}"
    elif game_name:
        name = game_name
    elif fallback_name and fallback_name.strip():
        name = fallback_name
    else:
        name = participant.get("summonerName", "Unknown Summoner")

    assigned_role = (
        participant["teamPosition"] if participant["teamPosition"] else "UNKNOWN"
    )

    primary_runes = None
    secondary_runes = None

    perks = participant.get("perks")
    if perks and perks.get("style"):
        for style in perks["styles"]:
            if style.get("description") == "primaryStyle":
                primary_runes = [
                    selection["perk"] for selection in style.get("selections", [])
                ]
            elif style.get("description") == "subStyle":
                secondary_runes = [
                    selection["perk"] for selection in style.get("selections", [])
                ]

    return SimplifiedPlayerStats(
        summoner_name=name,
        champion_name=participant["championName"],
        kills=participant["kills"],
        deaths=participant["deaths"],
        assists=participant["assists"],
        kda=calculated_kda,
        role=assigned_role,
        double_kills=participant["doubleKills"],
        triple_kills=participant["tripleKills"],
        quadra_kills=participant["quadraKills"],
        penta_kills=participant["pentaKills"],
        largest_multikill=participant["largestMultiKill"],
        primary_runes=primary_runes,
        secondary_runes=secondary_runes,
    )


def _format_teammate(p: Any) -> SimplifiedTeammate:
    """Helper function to transform a raw participant into a SimplifiedTeammate."""
    # Handle Riot ID naming combinations
    game_name = p.get("riotIdGameName")
    tag_line = p.get("riotIdTagline")
    fallback_name = p.get("summonerName")

    if game_name and tag_line:
        t_name = f"{game_name}#{tag_line}"
    elif game_name:
        t_name = game_name
    elif fallback_name and fallback_name.strip():
        t_name = fallback_name
    else:
        t_name = f"Teammate ({p.get('championName', 'Unknown')})"

    return SimplifiedTeammate(
        summoner_name=t_name,
        champion_name=p["championName"],
        kills=p["kills"],
        deaths=p["deaths"],
        assists=p["assists"],
        kda=round((p["kills"] + p["assists"]) / max(p["deaths"], 1), 2),
        role=p["teamPosition"] if p["teamPosition"] else "UNKNOWN",
    )


def filter_match_for_players(
    full_match: Any, target_puuid: str
) -> Optional[SimplifiedMatchResponse]:
    # 1. Find the target participant without a standard for-loop
    target_participant = next(
        (p for p in full_match["info"]["participants"] if p["puuid"] == target_puuid),
        None,
    )

    # Early return guard clause
    if not target_participant:
        return None

    target_team_id = target_participant["teamId"]

    # 2. Find if the team won without a standard for-loop
    your_team_won = next(
        (
            team["win"]
            for team in full_match["info"]["teams"]
            if team["teamId"] == target_team_id
        ),
        False,
    )

    # 3. Filter and build teammates using a list comprehension + helper function
    teammates = [
        _format_teammate(p)
        for p in full_match["info"]["participants"]
        if p["teamId"] == target_team_id and p["puuid"] != target_puuid
    ]

    return SimplifiedMatchResponse(
        match_id=full_match["metadata"]["matchId"],
        game_mode=full_match["info"]["gameMode"],
        map_id=full_match["info"]["mapId"],
        duration_seconds=full_match["info"]["gameDuration"],
        your_team_won=your_team_won,
        your_stats=simplify_participant(target_participant),
        teammates=teammates,
    )
