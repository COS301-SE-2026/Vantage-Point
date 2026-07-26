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
    async def test_get_users(client: TestClient):
        mock_users = [
            mock_user1,

        ]