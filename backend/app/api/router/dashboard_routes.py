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

@router.get(
    "/dashboard/new_users_this_month",
    response_model=int,
    summary="Get newly created users done this month",
    tags=["dashboard"],
)
async def get_new_users_this_month(_: Annotated[User, Depends(require_group(20))]):
    return await DashboardService.new_users_this_month()

@router.get(
    "/dashboard/new_users_this_week",
    response_model=int,
    summary="Get newly created users done this week",
    tags=["dashboard"],
)
async def get_new_users_this_week(_: Annotated[User, Depends(require_group(20))]):
    return await DashboardService.new_users_this_week()

@router.get(
    "/dashboard/confirmed_users",
    response_model=int,
    summary="Get confirmed users from cognito pool",
    tags=["dashboard"],
)
async def get_confirmed_users(_: Annotated[User, Depends(require_group(20))]):
    return await DashboardService.confirmed_users()

@router.get(
    "/dashboard/unconfirmed_users",
    response_model=int,
    summary="Get unconfirmed users from cognito pool",
    tags=["dashboard"],
)
async def get_unconfirmed_users(_: Annotated[User, Depends(require_group(20))]):
    return await DashboardService.unconfirmed_users()

