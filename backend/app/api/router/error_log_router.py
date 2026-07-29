from app.services.error_log_service import ErrorClass
from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.Models.auth_model import User
from app.api.auth import require_group
from app.Models.error_log_models import GetErrorLogLists, ToggleReview
from app.database.models import ErrorLog
from app.database.session import get_session

router = APIRouter()


@router.get("/dashboard/errors", tags=["dashboard"])
async def list_errors(
    _current_user: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    severity: str | None,
    service: str | None,
    reviewed: bool | None,
    limit: int = 30,
    offset: int = 10,
) -> list[GetErrorLogLists]:
    response: list[GetErrorLogLists] = await ErrorClass.get_errors_for_dashboard(
        session, severity, service, reviewed, limit, offset
    )
    return response


@router.get("/dashboard/errors/{error_id}", tags=["dashboard"])
async def list_error(
    _current_user: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    error_id: int,
) -> ErrorLog:
    response: ErrorLog = await ErrorClass.get_error_log(session, error_id)
    return response


@router.get("/dashboard/toggle/{error_id}", tags=["dashboard"])
async def toggle_reviewed(
    _current_user: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    error_id: int,
) -> ToggleReview:
    response: ToggleReview = await ErrorClass.toggle_reviewd(
        error_id, session, _current_user.sub
    )
    return response
