import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.api.router.admin_routes import router
from app.services.admin_service import admin_service
from app.main import app
from app.Models.auth_model import UserTest
from typing import Any

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
    async def test_get_users(mock_get_users: Any, client: TestClient):
        mock_users = [
            mock_user1,
            mock_user2
        ]
        mock_get_users.return_value = mock_users
        response: Any = client.get("/admin/users?limit=10")

        assert response.status_code == 200
        assert len(response.username) == 2
        assert response[0].username == "user1"
        mock_get_users.assert_called_once_with(10)

