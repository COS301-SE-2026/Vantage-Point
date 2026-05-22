import json

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database.models import Champions, Matches, Participants
from app.schemas.match import (
    ChampionBanResponse,
    MatchDetailResponse,
    ObjectivesSummaryResponse,
    ParticipantDetailResponse,
    TeamDetailResponse,
)
from app.utils.game_labels import map_label, queue_label


async def user_has_match_access(
    session: AsyncSession, user_puuids: list[str], match_id: str
) -> bool:
    if not user_puuids:
        return False
    result = await session.execute(
        select(Participants.internal_id)
        .where(
            Participants.match_id == match_id,
            Participants.puuid.in_(user_puuids),
        )
        .limit(1)
    )
    return result.scalar_one_or_none() is not None


async def get_match_detail(
    session: AsyncSession, match_id: str, viewer_puuid: str | None
) -> MatchDetailResponse | None:
    result = await session.execute(
        select(Matches).where(Matches.match_id == match_id)
    )
    match = result.scalar_one_or_none()
    if not match or not match.detail_json:
        return None

    payload = json.loads(match.detail_json)
    teams_raw = payload.get("teams", [])

    ban_ids: set[int] = set()
    for team in teams_raw:
        ban_ids.update(team.get("bans", []))

    name_by_id: dict[int, str] = {}
    if ban_ids:
        champ_result = await session.execute(
            select(Champions.champion_id, Champions.name).where(
                Champions.champion_id.in_(ban_ids)
            )
        )
        name_by_id = dict(champ_result.all())

    teams: list[TeamDetailResponse] = []

    for team in teams_raw:
        participants: list[ParticipantDetailResponse] = []
        for p in team.get("participants", []):
            puuid = p.get("puuid", "")
            is_viewer = bool(
                viewer_puuid and puuid == viewer_puuid
            ) or p.get("is_viewer", False)
            participants.append(
                ParticipantDetailResponse(
                    puuid=puuid,
                    riot_id=p.get("riot_id"),
                    champion_id=p["champion_id"],
                    champion_name=p["champion_name"],
                    position=p["position"],
                    win=p["win"],
                    kills=p["kills"],
                    deaths=p["deaths"],
                    assists=p["assists"],
                    cs=p["cs"],
                    gold_earned=p["gold_earned"],
                    damage_to_champions=p["damage_to_champions"],
                    vision_score=p["vision_score"],
                    items=p.get("items", []),
                    summoner_spells=p.get("summoner_spells", []),
                    is_viewer=is_viewer,
                )
            )
        obj = team.get("objectives", {})
        bans = [
            ChampionBanResponse(
                champion_id=ban_id,
                champion_name=name_by_id.get(ban_id, f"Champion {ban_id}"),
            )
            for ban_id in team.get("bans", [])
        ]
        teams.append(
            TeamDetailResponse(
                team_id=team["team_id"],
                win=team["win"],
                bans=bans,
                objectives=ObjectivesSummaryResponse(
                    baron=obj.get("baron", 0),
                    dragon=obj.get("dragon", 0),
                    rift_herald=obj.get("rift_herald", 0),
                    tower=obj.get("tower", 0),
                    inhibitor=obj.get("inhibitor", 0),
                ),
                participants=participants,
            )
        )

    return MatchDetailResponse(
        match_id=match.match_id,
        game_creation=match.game_creation,
        game_duration=match.game_duration,
        game_version=match.game_version,
        queue_id=match.queue_id,
        queue_label=queue_label(match.queue_id),
        map_id=match.map_id,
        map_label=map_label(match.map_id),
        teams=teams,
    )
