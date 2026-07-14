from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from app.database.models import Champions, Matches, Participants
from app.Models.match import MatchHistorySummaryResponse
from app.utils.game_labels import map_label


async def list_match_history(
    session: AsyncSession, puuid: str
) -> list[MatchHistorySummaryResponse]:
    result = await session.execute(
        select(Participants, Matches, Champions)
        .join(Matches, col(Matches.match_id) == col(Participants.match_id))
        .join(Champions, col(Champions.champion_id) == col(Participants.champion_id))
        .where(col(Participants.puuid) == puuid)
        .order_by(col(Matches.game_creation).desc(), col(Matches.match_id).desc())
    )
    rows = result.all()
    summaries: list[MatchHistorySummaryResponse] = []
    for participant, match, champion in rows:
        duration_minutes = max(1, round(match.game_duration / 60))
        summaries.append(
            MatchHistorySummaryResponse(
                match_id=match.match_id,
                champion_name=champion.name,
                outcome="Victory" if participant.win else "Defeat",
                duration_minutes=duration_minutes,
                map_label=map_label(match.map_id),
                played_on=match.played_on.isoformat(),
                kills=participant.kills,
                deaths=participant.deaths,
                assists=participant.assists,
                cs=participant.cs,
                position=participant.individual_position,
            )
        )
    return summaries
