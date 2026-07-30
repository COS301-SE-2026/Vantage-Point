from app.services.admin_service import admin_service
from typing import Any
from app.Models.admin_model import UserResponse
from datetime import datetime, timezone, timedelta


class DashboardService:

    users: list[UserResponse] | None=None

    @staticmethod
    async def new_users_today() -> int:
        DashboardService.users=await admin_service.get_users()
        today = datetime.now(timezone.utc).date
        new_today = sum(
            1 for user in DashboardService.users
            if user.user_created_date == today
        )
        return new_today

    @staticmethod
    async def new_users_this_week() -> int:
        DashboardService.users=await admin_service.get_users()

        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        new_week = sum(
            1 for user in DashboardService.users
            if user.user_created_date >= week_ago
        )
        return new_week


    @staticmethod
    async def new_users_this_month() -> int: