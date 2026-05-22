import os
from urllib.parse import quote

import httpx
from dotenv import load_dotenv

load_dotenv()

# Account API routing clusters (try in order — EU accounts need `europe`, not `americas`)
ROUTING_CLUSTERS = ("europe", "americas", "asia", "sea")


class RiotApiNotConfiguredError(Exception):
    """Raised when RIOT_API_KEY is missing from the environment."""


class RiotApiUnauthorizedError(Exception):
    """Raised when the Riot API key is invalid or expired."""


def _normalize_tag_line(tag_line: str) -> str:
    return tag_line.strip().lstrip("#")


async def get_puuid_by_riot_id(game_name: str, tag_line: str) -> str | None:
    """Get PUUID by Riot ID (game name + tag), trying all regional routing clusters."""
    load_dotenv(override=True)
    api_key = os.getenv("RIOT_API_KEY", "").strip()
    if not api_key:
        raise RiotApiNotConfiguredError(
            "RIOT_API_KEY is not set. Add your Riot developer API key to backend/.env"
        )

    safe_game_name = quote(game_name.strip(), safe="")
    safe_tag_line = quote(_normalize_tag_line(tag_line), safe="")
    headers: dict[str, str] = {"X-Riot-Token": api_key}

    async with httpx.AsyncClient(timeout=15.0) as client:
        for cluster in ROUTING_CLUSTERS:
            url = (
                f"https://{cluster}.api.riotgames.com/riot/account/v1/"
                f"accounts/by-riot-id/{safe_game_name}/{safe_tag_line}"
            )
            response = await client.get(url, headers=headers)

            if response.status_code == 200:
                return response.json().get("puuid")

            if response.status_code == 401:
                raise RiotApiUnauthorizedError(
                    "Riot API key is invalid or expired. Regenerate it at "
                    "https://developer.riotgames.com/ and update backend/.env"
                )

            if response.status_code == 429:
                raise RiotApiUnauthorizedError(
                    "Riot API rate limit reached. Wait a minute and try again."
                )

            # 404 on this cluster — try the next routing region
            continue

    return None
