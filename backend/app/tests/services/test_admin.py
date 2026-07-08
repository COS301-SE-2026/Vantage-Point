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
class admin_test_get:
    
    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user",)
    async def get_user_success(mock_admin_get_user: MagicMock):      
        mock_admin_get_user.return_value = {
            "Username": "shaun",
            "UserAttributes": [
                {
                    "Name": "email",
                    "Value": "shaunmarx05@gmail.com"
                },
                {
                    "Name": "sub",
                    "Value": "005cf93c-6031-70fe-58ea-11c03431ba8d"
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
        assert response.email == "shaunmarx05@gmail.com"
        assert response.sub == "005cf93c-6031-70fe-58ea-11c03431ba8d"
        assert response.user_created_date == datetime.fromisoformat("2026-07-01T20:08:52.115000+02:00")
        assert response.user_last_modified_date == datetime.fromisoformat("2026-07-01T20:09:42.094000+02:00")
        assert response.enabled == True
        assert response.user_status == "CONFIRMED"

        mock_admin_get_user.assert_called_once_with(
            UserPoolId=settings.cognito_user_pool_id,
            Username="shaun"
        )

    @patch("app.services.admin_service.client.admin_get_user")
    async def get_user_not_found_exception(mock_admin_get_user):
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