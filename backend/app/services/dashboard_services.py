from app.services.admin_service import admin_service
from app.Models.admin_model import UserResponse
from app.Models.dashboard_service import ActivityResponse
from datetime import datetime, timezone, timedelta
from sqlmodel import select, func
from app.database.models import Matches
from typing import Annotated, Any
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
import boto3
from botocore.exceptions import ClientError
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from app.config import get_settings
import asyncio
import json

settings = get_settings()


class DashboardService:

    @staticmethod
    async def new_users_today() -> int:
        try:
            users: list[UserResponse] = await admin_service.get_users()
            today = datetime.now(timezone.utc).date()
            new_today = sum(
                1 for user in users if user.user_created_date.date() == today
            )
            return new_today
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def new_users_this_week() -> int:
        try:
            users: list[UserResponse] = await admin_service.get_users()

            week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).date()
            new_week = sum(
                1 for user in users if user.user_created_date.date() >= week_ago
            )
            return new_week
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def new_users_this_month() -> int:
        try:
            users: list[UserResponse] = await admin_service.get_users()

            month_ago = (datetime.now(timezone.utc) - timedelta(days=30)).date()
            new_month = sum(
                1 for user in users if user.user_created_date.date() >= month_ago
            )
            return new_month
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def confirmed_users() -> int:
        try:
            users = await admin_service.get_users('cognito:user_status = "CONFIRMED"')
            return len(users)
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def unconfirmed_users() -> int:
        try:
            users = await admin_service.get_users('cognito:user_status = "UNCONFIRMED"')
            return len(users)
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def weekly_growth() -> int:
        try:
            this_week_start = datetime.now(timezone.utc) - timedelta(7)
            last_week_start = datetime.now(timezone.utc) - timedelta(14)
            last_week_end = this_week_start

            users = await admin_service.get_users()

            this_week = sum(
                1 for user in users if user.user_created_date >= this_week_start
            )
            last_week = sum(
                1
                for user in users
                if last_week_start <= user.user_created_date < last_week_end
            )
            return this_week - last_week
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def monthly_growth() -> int:
        try:
            this_month_start = datetime.now(timezone.utc) - timedelta(30)
            last_month_start = datetime.now(timezone.utc) - timedelta(60)
            last_month_end = this_month_start

            users = await admin_service.get_users()
            this_month = sum(
                1 for user in users if user.user_created_date >= this_month_start
            )
            last_month = sum(
                1
                for user in users
                if last_month_start <= user.user_created_date < last_month_end
            )
            return this_month - last_month
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod
    async def get_total_matches(
        session: Annotated[AsyncSession, Depends(get_session)],
    ) -> int:
        try:
            statement = select(func.count()).select_from(Matches)
            result = await session.execute(statement)
            match_count = result.scalar_one()

            return match_count
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve match count",
            ) from e

    @staticmethod
    async def get_s3_storage_used() -> int:
        try:
            cloudwatch = boto3.client("cloudwatch", region_name=settings.aws_region)  # type: ignore

            now = datetime.now(timezone.utc)
            start_time = now - timedelta(days=2)

            response = await asyncio.to_thread(
                cloudwatch.get_metric_data,
                MetricDataQueries=[
                    {
                        "Id": "s3Storage",
                        "MetricStat": {
                            "Metric": {
                                "Namespace": "AWS",
                                "MetricName": "BucketSize",
                                "Dimensions": [
                                    {
                                        "Name": "BucketName",
                                        "Value": settings.bucket_name,
                                    },
                                    {"Name": "StorageType", "Value": "StandardStorage"},
                                ],
                            },
                            "Period": 86400,
                            "Stat": "Average",
                        },
                        "ReturnData": True,
                    },
                ],
                StartTime=start_time,
                EndTime=now,
                ScanBy="TimestampDescending",
            )

            results: Any = response["MetricDataResults"]

            if not results:
                return 0

            values: Any = results[0]["Values"]

            if not values:
                return 0

            return int(values[0])
        except ClientError as e:
            error = e.response.get("Error", {})
            error_code = error.get("Code", "ClientError")
            raise HTTPException(status_code=400, detail=error_code)

    @staticmethod  # lifetime of 30 days on cloudwatch config
    async def get_current_activities(limit: int = 50) -> list[ActivityResponse]:
        try:
            logs = boto3.client("logs", region_name=settings.aws_region)  # type: ignore

            response = logs.filter_log_events(
                logGroupName=settings.aws_log_group, limit=limit
            )

            activities: list[ActivityResponse] = []

            for event in response.get("events", []):
                message = event.get("message")
                timestamp = event.get("timestamp")

                if message is None or timestamp is None:
                    continue

                try:
                    data = json.loads(message)
                except (TypeError, json.JSONDecodeError):
                    continue

                activities.append(
                    ActivityResponse(
                        timestamp=timestamp,
                        event_type=data.get("event_type"),
                        message=data.get("message"),
                    )
                )

            activities.sort(key=lambda activity: int(activity.timestamp), reverse=True)
            return activities[:limit]
        except HTTPException as e:
            raise HTTPException(status_code=500, detail=str(e))
        except ClientError as e:
            raise HTTPException(status_code=500, detail=str(e))
