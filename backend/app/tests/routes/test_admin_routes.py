import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.api.router.admin_routes import router
from app.services.admin_service import admin_service
from app.main import app
from app.Models.auth_model import UserTest
from typing import Any, cast, reveal_type
import httpx

app.include_router(router)


mock_user1 = UserTest(
    sub="sub1",
    password="Test@123",
    username="user1",
    email="user1@test.com",
    groups=["Users","Admin"],
)

mock_user2 = UserTest(
    sub="sub2",
    password="Test@123",
    username="user2",
    email="user2@test.com",
    groups=["Users", "Admin"],
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