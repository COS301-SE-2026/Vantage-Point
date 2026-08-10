from app.services.dashboard_services import DashboardService
from fastapi import Depends, APIRouter
from app.Models.auth_model import User
from app.api.auth import require_group
from typing import Any, Annotated
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.Models.admin_model import UserResponse

router = APIRouter()

@router.get(
    "/dashboard/new-users-today",
    response_model=int,
    summary="Get newly created users done today",
    tags=["dashboard"],
)
async def get_new_users_today(_: Annotated[User, Depends(require_group(20))]):
    return await DashboardService.new_users_today()