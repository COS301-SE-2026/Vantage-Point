from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database.models import Users
from app.database.session import get_session
from app.schemas.match import (
    MatchDetailResponse,
    MatchHistorySummaryResponse,
    MatchSyncResponse,
)
from app.services.match_detail import get_match_detail, user_has_match_access
from app.services.match_history import list_match_history
from app.services.match_ingest import (
    DEFAULT_SYNC_COUNT,
    MAX_SYNC_COUNT,
    sync_matches_for_puuid,
)
from app.services.riot_api import RiotApiNotConfiguredError, RiotApiUnauthorizedError
from app.services.user_accounts import get_linked_puuids, get_primary_linked_puuid

router = APIRouter(prefix="/api/v1/matches", tags=["matches"])


@router.get("", response_model=list[MatchHistorySummaryResponse])
async def get_matches(
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    puuid = await get_primary_linked_puuid(session, current_user.cognito_sub)
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
    count: int = Query(
        DEFAULT_SYNC_COUNT,
        ge=1,
        le=MAX_SYNC_COUNT,
        description="How many recent matches to pull from Riot",
    ),
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    puuid = await get_primary_linked_puuid(session, current_user.cognito_sub)
    if not puuid:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Link a Riot ID before syncing matches.",
        )

    try:
        result = await sync_matches_for_puuid(session, puuid, count=count)
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


@router.get("/{match_id}", response_model=MatchDetailResponse)
async def get_match_by_id(
    match_id: str,
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    puuids = await get_linked_puuids(session, current_user.cognito_sub)
    if not await user_has_match_access(session, puuids, match_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )

    viewer_puuid = await get_primary_linked_puuid(session, current_user.cognito_sub)
    detail = await get_match_detail(session, match_id, viewer_puuid)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found",
        )
    return detail
