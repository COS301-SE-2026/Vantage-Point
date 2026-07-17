from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database.models import Users
from app.database.session import get_session
from app.Models.match import MatchDetailResponse, MatchHistorySummaryResponse
from app.services.match_detail import get_match_detail, user_has_match_access
from app.services.match_history import list_match_history
from app.services.user_accounts import get_linked_puuids, get_primary_linked_puuid

router = APIRouter(prefix="/api/v1/matches", tags=["matches"])


@router.get("", response_model=list[MatchHistorySummaryResponse])
async def get_matches(
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[MatchHistorySummaryResponse]:
    puuid = await get_primary_linked_puuid(session, current_user.cognito_sub)
    if not puuid:
        return []
    return await list_match_history(session, puuid)


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
