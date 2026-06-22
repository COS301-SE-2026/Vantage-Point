import asyncio
from typing import Any
from app.Models.profile_schemas import LiveAdvancedMetrics
from app.Models.riot_schemas import MapReplay
from app.services.riot_service import riot_service


class LiveAnalyticsService:
    @staticmethod
    def _empty_live_metrics() -> LiveAdvancedMetrics:
        return LiveAdvancedMetrics(
            games_analyzed=0,
            avg_kda="0.0 / 0.0 / 0.0",
            avg_vision_score=0.0,
            avg_kill_participation_pct=0.0,
            avg_cs_per_minute=0.0,
            avg_damage_per_minute=0.0,
            avg_gold_per_minute=0.0,
            win_rate="0%",
        )

    @staticmethod
    def _get_game_minutes(match: dict[str, Any]) -> float:
        # Explicit type typing prevents "Unknown" tracking inside nested dicts
        info: dict[str, Any] = match.get("info", {})
        duration_seconds: Any = info.get("gameDuration", 1)

        if isinstance(duration_seconds, (int, float)) and duration_seconds > 10000:
            duration_seconds = duration_seconds / 1000

        return float(duration_seconds) / 60.0

    @staticmethod
    def _find_player_and_team_kills(
        participants: list[dict[str, Any]], puuid: str
    ) -> tuple[dict[str, Any] | None, int]:
        player = next((p for p in participants if p.get("puuid") == puuid), None)

        if not player:
            return None, 0

        user_team_id = player.get("teamId")

        team_kills = sum(
            int(p.get("kills", 0))
            for p in participants
            if p.get("teamId") == user_team_id
        )

        return player, team_kills

    @staticmethod
    async def get_live_metrics_from_api(
        server_region: str, puuid: str, count: int = 20
    ) -> LiveAdvancedMetrics:
        """
        Queries live match details through RiotService and returns aggregated performance metrics.
        """
        match_ids = await riot_service.get_match_ids(
            server_region=server_region,
            puuid=puuid,
            count=count,
        )

        if not match_ids:
            return LiveAnalyticsService._empty_live_metrics()

        tasks = [riot_service.get_match_detail(match_id) for match_id in match_ids]
        matches_data: list[dict[str, Any]] = await asyncio.gather(*tasks)

        # Explicitly typing the accumulator dictionary fixes type inference errors
        stats: dict[str, Any] = {
            "kills": 0,
            "deaths": 0,
            "assists": 0,
            "wins": 0,
            "vision": 0,
            "damage": 0,
            "gold": 0,
            "cs": 0,
            "team_kills": 0,
            "duration_minutes": 0.0,
            "games_analyzed": 0,
        }

        for match in matches_data:
            if not match or "info" not in match:
                continue

            info: dict[str, Any] = match["info"]
            participants: list[dict[str, Any]] = info.get("participants", [])

            player, team_kills = LiveAnalyticsService._find_player_and_team_kills(
                participants,
                puuid,
            )

            if not player:
                continue

            stats["games_analyzed"] += 1
            stats["duration_minutes"] += LiveAnalyticsService._get_game_minutes(match)
            stats["team_kills"] += team_kills

            stats["kills"] += player.get("kills", 0)
            stats["deaths"] += player.get("deaths", 0)
            stats["assists"] += player.get("assists", 0)
            stats["vision"] += player.get("visionScore", 0)
            stats["damage"] += player.get("totalDamageDealtToChampions", 0)
            stats["gold"] += player.get("goldEarned", 0)
            stats["cs"] += player.get("totalMinionsKilled", 0) + player.get(
                "neutralMinionsKilled", 0
            )

            if player.get("win"):
                stats["wins"] += 1

        if stats["games_analyzed"] == 0:
            return LiveAnalyticsService._empty_live_metrics()

        return LiveAnalyticsService._build_live_metrics_response(stats)

    @staticmethod
    def _build_live_metrics_response(stats: dict[str, Any]) -> LiveAdvancedMetrics:
        games: int = stats["games_analyzed"]
        duration: float = stats["duration_minutes"] or 1.0

        kill_participation = 0.0

        if stats["team_kills"] > 0:
            kill_participation = (
                (stats["kills"] + stats["assists"]) / stats["team_kills"]
            ) * 100

        return LiveAdvancedMetrics(
            games_analyzed=games,
            avg_kda=(
                f"{stats['kills'] / games:.1f} / "
                f"{stats['deaths'] / games:.1f} / "
                f"{stats['assists'] / games:.1f}"
            ),
            avg_vision_score=round(stats["vision"] / games, 1),
            avg_kill_participation_pct=round(kill_participation, 1),
            avg_cs_per_minute=round(stats["cs"] / duration, 1),
            avg_damage_per_minute=round(stats["damage"] / duration, 1),
            avg_gold_per_minute=round(stats["gold"] / duration, 1),
            win_rate=f"{round((stats['wins'] / games) * 100)}%",
        )

#at the moment only the user hence we need the puuid in the the method call as paramater, otherwise no way to know which user you are. Might add it 
#to a env and then just update it when the user changes his/her puuid they are using. Don't have to call/put it in each time
    async def map_replay(self, match_id: str, puuid: str) -> Any:
        data: Any = riot_service.get_match_timeline(match_id)

        x_values = {}
        y_values = {}
        frames = data["info"]["frames"]
        for i in range(1, 10):
            x_values[str(i)] = [
                frame["participantFrames"][str(i)]["position"]["x"]
                for frame in frames
            ]
            y_values[str(i)] = [
                frame["participantFrames"][str(i)]["position"]["y"]
                for frame in frames
            ]
        
        return MapReplay(          
                puuid=[p["puuid"] for p in data["info"]["participants"]],
                participant_id=[p["participantId"] for p in data["info"]["participants"]],#is a list need to change/update the model as it stands
                frame_interval=data["info"]["frameInterval"],
                timestamp=data["info"]["frames"]["timestamp"],
                position_x=x_values,
                position_y=y_values,          
        )
