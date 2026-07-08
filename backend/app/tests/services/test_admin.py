"""
Unit testing for admin page

Test all admin endpoints and Mocks AWS Cognito dependency
"""

import pytest
from typing import Any
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from fastapi.testclient import TestClient
from app.services.admin_service import admin_service
from app.Models.admin_model import UserResponse
from app.tests.constants import TEST_USER_PASSWORD
from datetime import datetime, timezone
from app.config import get_settings

settings = get_settings()

@pytest.mark.anyio
class TestAdminGet:
    
    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user",)
    async def get_user_success(mock_admin_get_user: MagicMock):      
        mock_admin_get_user.return_value = {
            "Username": "shaun",
            "UserAttributes": [
                {
                    "Name": "email",
                    "Value": "shaun@gmail.com"
                },
                {
                    "Name": "sub",
                    "Value": "12345"
                }
            ],
            "UserCreateDate": datetime(
                2026, 7, 1, 20, 8, 52, 115000,
                tzinfo=timezone.utc
            ),
            "UserLastModifiedDate": datetime(
                2026, 7, 1, 20, 9, 42, 94000,
                tzinfo=timezone.utc
            ),
            "Enabled": True,
            "UserStatus": "CONFIRMED"
            }    

        response = await admin_service.get_user("shaun")
        
        assert response.username == "shaun"
        assert response.email == "shaun@gmail.com"
        assert response.sub == "12345"
        assert response.user_created_date == datetime.fromisoformat("2026-07-01T20:08:52.115000+02:00")
        assert response.user_last_modified_date == datetime.fromisoformat("2026-07-01T20:09:42.094000+02:00")
        assert response.enabled == True
        assert response.user_status == "CONFIRMED"

        mock_admin_get_user.assert_called_once_with(
            UserPoolId=settings.cognito_user_pool_id,
            Username="shaun"
        )

    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user")
    async def get_user_not_found_exception(mock_admin_get_user: MagicMock):
        mock_admin_get_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNotFoundException",
                    "Message": "User not found"
                }
            },
            "user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_user("shaun")

        assert exec.value.status_code == 404
        assert exec.value.detail == "User not found"

    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user")
    async def get_user_invalid_paramater(mock_admin_get_user: MagicMock):
        mock_admin_get_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidParamaterException",
                    "Message": "Invalid username"
                }
            },
            "user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_user("shaun")

        assert exec.value.status_code == 422
        assert exec.value.detail == "Invalid username"

    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user")
    async def get_user_unknown_error(mock_admin_get_user: MagicMock):
        mock_admin_get_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_user("shaun")

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

    #get users unit test

    @staticmethod
    @patch("app.services.admin_service.client.list_users")
    async def get_users_success(mock_admin_get_users: MagicMock):
        mock_admin_get_users.return_value = {
            "Users": [
                {
                    "Username": "shaun",
                    "Attributes": [
                        {"Name": "email", "Value": "shaun@gmail.com"},
                        {"Name": "sub", "Value": "12345"},
                    ],
                    "UserCreateDate": datetime.now(timezone.utc),
                    "UserLastModifiedDate": datetime.now(timezone.utc),
                    "Enabled": True,
                    "UserStatus": "CONFIRMED",
                },
                {
                    "Username": "john",
                    "Attributes": [
                        {"Name": "email", "Value": "john@gmail.com"},
                        {"Name": "sub", "Value": "67890"},
                    ],
                    "UserCreateDate": datetime.now(timezone.utc),
                    "UserLastModifiedDate": datetime.now(timezone.utc),
                    "Enabled": False,
                    "UserStatus": "FORCE_CHANGE_PASSWORD",
                },
            ]
        }

        users = await admin_service.get_users()

        assert len(users) == 2

        assert users[0].username == "shaun"
        assert users[0].email == "shaun@gmail.com"
        assert users[0].sub == "12345"
        assert users[0].enabled is True
        assert users[0].user_status == "CONFIRMED"

        assert users[1].username == "john"
        assert users[1].email == "john@gmail.com"
        assert users[1].sub == "67890"
        assert users[1].enabled is False
        assert users[1].user_status == "FORCE_CHANGE_PASSWORD"

    @staticmethod
    @patch("app.services.admin_service.client.list_users")
    async def get_users_user_not_found(mock_admin_get_users: MagicMock):
        mock_admin_get_users.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNotFoundException",
                    "Message": "User not found"
                }
            },
            "user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_users()

        assert exec.value.status_code == 404
        assert exec.value.detail == "User not found"