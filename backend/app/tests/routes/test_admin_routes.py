from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, patch
import pytest

from app.Models.admin_model import Response, UserResponse, CreateGroupResponse
from app.Models.auth_model import User
from app.services.admin_service import admin_service
from app.api.router.admin_routes import get_users, get_user, add_user_to_group, remove_user_from_group

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

mock_response = Response(success=True, message="Success")
mock_group_response = CreateGroupResponse(
    group_name="SuperAdmin",
    user_pool_id="pool-123",
    descriptipn="PowerUsers",
    precedence=30,
    last_modified_date=mock_date,
    creation_date=mock_date
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
        mock_get_user.assert_called_once_with("user1")

    @staticmethod
    @patch.object(admin_service, "add_user_to_group")
    async def test_add_user_to_group(mock_add_user_to_group: Any) -> None:
        mock_add_user_to_group.return_value = mock_response

        response = await add_user_to_group(mock_admin, username="user1", group="SuperAdmin")

        assert response == mock_response
        mock_add_user_to_group.assert_called_once_with("user1", "SuperAdmin")

    @staticmethod
    @patch.object(admin_service, "add_user_to_group")
    async def test_add_user_to_group_default_value(mock_add_user_to_group: Any) -> None:
        mock_add_user_to_group.return_value = mock_response

        response = await add_user_to_group(mock_admin, username="user1")
        assert response == mock_response
        mock_add_user_to_group.assert_called_once_with("user1", "Users")

    
    @staticmethod
    @patch.object(admin_service, "remove_user_from_group")
    async def test_remove_user_from_group(mock_remove_user_from_group: Any) -> None:
        mock_remove_user_from_group.return_value = mock_response

        response = await remove_user_from_group(mock_admin, "user1", "Admin")

        assert response == mock_response
        mock_remove_user_from_group.assert_called_once_with("user1", "Admin")

    