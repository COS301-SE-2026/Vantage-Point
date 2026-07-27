import pytest
from datetime import datetime, timezone
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.api.router.admin_routes import get_users, get_user
from app.services.admin_service import admin_service
from app.main import app
from app.Models.auth_model import User
from app.Models.admin_model import UserResponse
from typing import Any, cast, reveal_type
import httpx

app.include_router(router)

mock_date = datetime(2026,1,1,tzinfo=timezone.utc)
mock_admin = User(
    sub="admin-sub",
    password="Test@123",
    username="admin",
    email="admin@test.com"
)

mock_user1 = UserResponse(
    sub="sub1",
    username="user1",
    email="user1@test.com",
    user_created_date=mock_date,
    user_last_modified_date=mock_date,
    enabled=True,
    user_status="CONFIRMED"
)

mock_user2 = UserResponse(
    sub="sub2",
    username="user2",
    email="user2@test.com",
    user_created_date=mock_date,
    user_last_modified_date=mock_date,
    enabled=True,
    user_status="CONFIRMED"
)

@pytest.mark.asyncio
class TestAdminRouter():

    @staticmethod
    @patch.object(admin_service, "get_users")
    async def test_get_users(mock_get_users: Any) -> None:
        mock_users = [
            mock_user1,
            mock_user2
        ]
        mock_get_users.return_value = mock_users
        response = await get_users(mock_admin, limit=10)

        assert len(response) == 2
        assert response[0].username == "user1"
        assert response[0].email == "user1@test.com"
        mock_get_users.assert_called_once_with(10)

    @staticmethod
    @patch.object(admin_service, "get_users")
    async def test_get_users_default_limit(mock_get_users: Any):
        mock_users = [mock_user1, mock_user2]
        mock_get_users.return_value = mock_users
        response = await get_users(mock_admin)

        assert response == mock_users
        mock_get_users.assert_called_once_with(10)

    @staticmethod
    @patch.object(admin_service, "get_user")
    async def test_get_user(mock_get_user: Any) -> None:
        mock_get_user.return_value = mock_user1
        response = await get_user(mock_admin, username=mock_user1.username)

        assert response == mock_user1
        assert response.username == mock_user1.username
        assert response.email == mock_user1.email