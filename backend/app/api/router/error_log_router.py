from app.services import error_log_service
from fastapi import APIRouter
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.auth import require_group
from app.Models.error_log_models import GetErrorLogLists, ToggleReview

router = APIRouter()

@router.get("/dashboard/errors", dependencies=[Depends])