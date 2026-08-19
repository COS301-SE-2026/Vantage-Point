from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from pydantic import BaseModel

from app.api.auth import require_group
from app.Models.profile_schemas import User
from app.database.session import get_session
from app.schemas.match import (
    MatchDetailResponse,
    MatchHistorySummaryResponse,
    MatchSyncResponse,
)
from app.schemas.timeline import MatchTimelineResponse
from app.services.match_detail import get_match_detail, user_has_match_access
from app.services.match_history import list_match_history
from app.services.match_ingest import (
    DEFAULT_SYNC_COUNT,
    MAX_SYNC_COUNT,
    sync_matches_for_puuid,
)
from app.services.riot_api import RiotApiNotConfiguredError, RiotApiUnauthorizedError
from app.services.timeline_ingest import (
    TimelineNotAvailableError,
    get_or_fetch_timeline,
)
from app.services.user_accounts import get_linked_puuids, get_primary_linked_puuid

router = APIRouter(prefix="/api/v1/matches", tags=["matches"])

MATCH_NOT_FOUND = "Match not found"


class SimplifiedMatchResponse(BaseModel):
    match_id: str
    champion_id: int | None = None
    champion_name: str
    kills: int
    deaths: int
    assists: int
    win: bool
    game_creation: datetime | None = None
    game_duration: int | None = None


@router.get("")
async def get_matches(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[MatchHistorySummaryResponse]:
    puuid = await get_primary_linked_puuid(session, current_user.sub)
    if not puuid:
        return []
    return await list_match_history(session, puuid)


@router.post(
    "/sync",
    response_model=MatchSyncResponse,
    summary="Import recent matches from Riot",
    description=(
        "Fetches the linked account's most recent matches from the Riot Match-V5 API "
        "and stores any that are not already held locally."
    ),
)
async def sync_matches(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    count: Annotated[
        int,
        Query(
            ge=1,
            le=MAX_SYNC_COUNT,
            description="How many recent matches to pull from Riot",
        ),
    ] = DEFAULT_SYNC_COUNT,
):
    puuid = await get_primary_linked_puuid(session, current_user.sub)
    if not puuid:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Link a Riot ID before syncing matches.",
        )

    try:
        result = await sync_matches_for_puuid(session, puuid, count=count, cognito_sub=current_user.sub)
    except RiotApiNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except RiotApiUnauthorizedError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return MatchSyncResponse(**result)


async def _assert_match_access(
    session: AsyncSession, cognito_sub: str, match_id: str
) -> None:
    """404 rather than 403 — whether a match exists is itself not the caller's business."""
    puuids = await get_linked_puuids(session, cognito_sub)
    if not await user_has_match_access(session, puuids, match_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MATCH_NOT_FOUND,
        )


@router.get("/{match_id}", response_model=MatchDetailResponse)
async def get_match_by_id(
    match_id: str,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    puuids = await get_linked_puuids(session, current_user.sub)
    if not await user_has_match_access(session, puuids, match_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MATCH_NOT_FOUND,
        )

    viewer_puuid = await get_primary_linked_puuid(session, current_user.sub)
    detail = await get_match_detail(session, match_id, viewer_puuid)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=MATCH_NOT_FOUND,
        )
    return detail


@router.get(
    "/{match_id}/timeline",
    response_model=MatchTimelineResponse,
    summary="Positions and events over the course of a match",
    description=(
        "Returns the Match-V5 timeline: a frame per minute holding every player's map "
        "position and champion stats, plus the kills, objectives, skill points and item "
        "purchases that fired. Fetched from Riot and cached on first request."
    ),
    responses={
        404: {"description": f"{MATCH_NOT_FOUND}, or Riot has no timeline for it"},
        502: {"description": "Riot rejected the request"},
        503: {"description": "No Riot API key is configured"},
    },
)
async def get_match_timeline(
    match_id: str,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    await _assert_match_access(session, current_user.sub, match_id)

    try:
        return await get_or_fetch_timeline(session, current_user.sub, match_id)
    except TimelineNotAvailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except RiotApiNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except RiotApiUnauthorizedError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
