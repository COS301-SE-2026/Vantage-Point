from app.services.admin_service import admin_service
from typing import Any
from app.Models.admin_model import UserResponse
from datetime import datetime, timezone


class DashboardService:

    users: list[UserResponse]=[]

    @staticmethod
    async def new_users_today() -> int:
        users=await admin_service.get_users()
        today = datetime.now(timezone.utc).date
        new_today = sum(
            1 for user in users
            if user.user_created_date ==today()
        )
        return new_today

    @staticmethod
    async def new_users_this_week():

    @staticmethod
    async def new_users_this_month():