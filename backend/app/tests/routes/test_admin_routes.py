import pytest
from datetime import datetime, timezone
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.api.router.admin_routes import router
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
    passwrod="Test@123",
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
    async def test_get_users(mock_get_users: Any, client: object) -> None:
        mock_users = [
            mock_user1.model_dump(mode="json"),
            mock_user2.model_dump(mode="json")
        ]
        client = cast(TestClient, client)
        mock_get_users.return_value = mock_users
        response = cast(httpx.Response, client.get("/admin/users?limit=10"))

        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data[0]["username"]) == 2
        assert response_data[0]["username"] == "user1"
        assert response_data[0]["groups"] == ["Users", "Admin"]
        mock_get_users.assert_called_once_with(10)

    @staticmethod
    @patch.object(admin_service, "get_users")
    async def test_get_users_default_limit(mock_get_users: Any, client: TestClient):
        mock_users = [mock_user1, mock_user2]
        mock_get_users.return_value = mock_users
        response = client.get("/admin/users")

        assert response.status_code == 200
        mock_get_users.assert_called_once_with(10)