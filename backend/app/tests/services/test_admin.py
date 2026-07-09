"""
Unit testing for admin page

Test all admin endpoints and Mocks AWS Cognito dependency
"""

import pytest
from typing import Any
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from fastapi.testclient import TestClient
from app.services.admin_service import admin_service
from app.Models.admin_model import UserResponse
from app.tests.constants import TEST_USER_PASSWORD
from datetime import datetime, timezone
from app.config import get_settings
from sqlalchemy.ext.asyncio import AsyncSession
settings = get_settings()

mock_session = AsyncMock(spec=AsyncSession)

@pytest.mark.anyio
class TestAdminGet:

    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user")
    async def test_get_user_success(mock_admin_get_user: MagicMock):      
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
    async def test_get_user_not_found_exception(mock_admin_get_user: MagicMock):
        mock_admin_get_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNotFoundException",
                    "Message": "User not found"
                }
            },
            "get_user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_user("shaun")

        assert exec.value.status_code == 404
        assert exec.value.detail == "User not found"

    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user")
    async def test_get_user_invalid_paramater(mock_admin_get_user: MagicMock):
        mock_admin_get_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidParamaterException",
                    "Message": "Invalid username"
                }
            },
            "get_user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_user("shaun")

        assert exec.value.status_code == 422
        assert exec.value.detail == "Invalid username"

    @staticmethod
    @patch("app.services.admin_service.client.admin_get_user")
    async def test_get_user_unknown_error(mock_admin_get_user: MagicMock):
        mock_admin_get_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "get_user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_user("shaun")

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

    #get users unit test

    @staticmethod
    @patch("app.services.admin_service.client.list_users")
    async def test_get_users_success(mock_admin_get_users: MagicMock):
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
    async def test_get_users_user_not_found(mock_admin_get_users: MagicMock):
        mock_admin_get_users.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNotFoundException",
                    "Message": "User not found"
                }
            },
            "get_users"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_users()

        assert exec.value.status_code == 404
        assert exec.value.detail == "User not found"

    @staticmethod
    @patch("app.services.admin_service.client.list_users")
    async def test_get_users_invalid_parameter(mock_admin_get_users: MagicMock):
        mock_admin_get_users.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidParamaterException",
                    "Message": "Invalid Username"
                }
            },
            "get_users"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_users()

        assert exec.value.status_code == 422
        assert exec.value.detail == "Invalid username"

    @staticmethod
    @patch("app.services.admin_service.client.list_users")
    async def test_get_users_unknown_error(mock_admin_get_users: MagicMock):
        mock_admin_get_users.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "get_users"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.get_users()

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

#implementing unit testing for all post requests in admin_service
@pytest.mark.anyio
class TestAdminServicePost:

    @staticmethod
    @patch("app.services.admin_service.client.admin_add_user_to_group")
    async def test_add_user_to_group_success(mock_admin_add_user_to_group: MagicMock):
        mock_admin_add_user_to_group.return_value = {}

        response = await admin_service.add_user_to_group("swdfcs")

        assert response.success is True
        assert response.message == "Added swdfcs to Users"

        mock_admin_add_user_to_group.assert_called_once_with(
            UserPoolId=settings.cognito_user_pool_id,
            Username="swdfcs",
            GroupName="Users",
        )

    @staticmethod
    @patch("app.services.admin_service.client.admin_add_user_to_group")
    async def test_add_user_to_group_user_not_found_exception(mock_admin_add_user_to_group: MagicMock):
        mock_admin_add_user_to_group.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNotFoundException",
                    "Message": "User not found"
                }
            },
            "add_user_to_group"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.add_user_to_group("shaun")

        assert exec.value.status_code == 404
        assert exec.value.detail == "User not found"

    @staticmethod
    @patch("app.services.admin_service.client.admin_add_user_to_group")
    async def test_add_user_to_group_resource_not_found_exception(mock_admin_add_user_to_group: MagicMock):
        mock_admin_add_user_to_group.side_effect = ClientError(
            {
                "Error": {
                    "Code": "ResourceNotFoundException",
                    "Message": "The specified group was not found."
                }
            },
            "add_user_to_group"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.add_user_to_group("shaun")

        assert exec.value.status_code == 400
        assert exec.value.detail == "The specified group was not found."

    @staticmethod
    @patch("app.services.admin_service.client.admin_add_user_to_group")
    async def test_add_user_to_group_unknow_error(mock_admin_add_user_to_group: MagicMock):
        mock_admin_add_user_to_group.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "add_user_to_group"
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.add_user_to_group("shaun")
        
        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

    #set_password

    @staticmethod
    @patch("app.services.admin_service.client.admin_set_user_password")
    async def test_set_user_password_success(mock_admin_set_password: MagicMock):
        mock_admin_set_password.return_value = {}

        response = await admin_service.set_password("swdfcs", "Test@Password123")

        assert response.success is True
        assert response.message == "Set swdfcs's passwpord"

        mock_admin_set_password.assert_called_once_with(
            UserPoolId=settings.cognito_user_pool_id,
            Username="swdfcs",
            Password="Test@Password123",
            Permanent=True
        )

    @staticmethod
    @patch("app.services.admin_service.client.admin_set_user_password")
    async def test_set_user_password_user_not_found(mock_admin_set_password: MagicMock):
        mock_admin_set_password.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNotFoundException",
                    "Message": "User not found."
                }
            },
            "set_password"
            )

        with pytest.raises(HTTPException) as exec:
            await admin_service.set_password("swdfcs", "Test@Password123")

        assert exec.value.status_code == 403
        assert exec.value.detail ==  "User not found."

    @staticmethod
    @patch("app.services.admin_service.client.admin_set_user_password")
    async def test_set_user_password_invalid_password(mock_admin_set_password: MagicMock):
        mock_admin_set_password.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidPasswordException",
                    "Message": "Password does not meet format"
                }
            },
            "set_password"
            )

        with pytest.raises(HTTPException) as exec:
            await admin_service.set_password("swdfcs", "Test@Password123")

        assert exec.value.status_code == 400
        assert exec.value.detail ==  "Password does not meet format"

    @staticmethod
    @patch("app.services.admin_service.client.admin_set_user_password")
    async def test_set_user_password_unknown_error(mock_admin_set_password: MagicMock):
        mock_admin_set_password.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "set_password"
            )

        with pytest.raises(HTTPException) as exec:
            await admin_service.set_password("swdfcs", "Test@Password123")

        assert exec.value.status_code == 400
        assert exec.value.detail ==  "InternalErrorException"

    #sign out
    @staticmethod
    @patch("app.services.admin_service.client.admin_user_global_sign_out")
    async def test_admin_user_global_sign_out_success(mock_admin_user_global_sign_out: MagicMock):
        mock_admin_user_global_sign_out.return_value = {}

        response = await admin_service.user_global_sign_out("swdfcs")

        assert response.success is True
        assert response.message == "Signed out swdfcs globally"

        mock_admin_user_global_sign_out.assert_called_once_with(
            UserPoolId=settings.cognito_user_pool_id,
            Username="swdfcs",
        )

    @staticmethod
    @patch("app.services.admin_service.client.admin_user_global_sign_out")
    async def test_admin_user_global_sign_out_unknown_error(mock_admin_user_global_sign_out: MagicMock):
        mock_admin_user_global_sign_out.side_effect =  ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "admin_user_global_sign_out"
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.user_global_sign_out("swdfcs")

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

    #create user

    @staticmethod
    @patch("app.services.admin_service.client.admin_create_user")
    async def admin_create_user_success(mock_admin_create_user: MagicMock):
        created = datetime(2026, 7, 8, 12, 0, tzinfo=timezone.utc)
        mock_admin_create_user.return_value = {
            "User": {
                "Username": "john123",
                "Attributes": [
                    {
                        "Name": "sub",
                        "Value": "12345"
                    },
                    {
                        "Name": "email",
                        "Value": "john@gmail.com"
                    }
                ],
                "UserCreateDate": created,
                "UserLastModifiedDate": created,
                "Enabled": True,
                "UserStatus": "FORCE_CHANGE_PASSWORD"
            }
        }
        
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None

        mock_session.execute.return_value = mock_result
        mock_session.commit.return_value = None
        mock_session.refresh.return_value = None
        mock_session.add.assert_called_once()
        mock_session.commit.assert_awaited_once()
        mock_session.refresh.assert_awaited_once()

        response = await admin_service.create_user(mock_session, "john123", "john@gmail.com")

        assert response.username == "john123"
        assert response.sub == "12345"
        assert response.email == "john@gmail.com"
        assert response.user_created_date == created
        assert response.user_last_modified_date == created
        assert response.enabled is True
        assert response.user_status == "FORCE_CHANGE_PASSWORD"

        mock_admin_create_user.assert_called_once_with(
            UserPoolId=settings.cognito_user_pool_id,
            Username="john123",
            UserAttributes=[
                {"Name": "email", "Value": "john@gmail.com"},
                {"Name": "email_verified", "Value": "true"},
            ],
            TemporaryPassword="TemPass@123",
            MessageAction="SUPPRESS",
        )

    @staticmethod
    @patch("app.services.admin_service.client.admin_create_user")
    async def admin_create_user_name_exist(mock_admin_create_user: MagicMock):
        mock_admin_create_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNameExistException",
                    "Message": "Username or email already exist."
                }
            },
            "admin_create_user"
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.create_user(mock_session, "john123", "john@gmail.com")

        assert exec.value.status_code == 400
        assert exec.value.detail == "Username or email already exist."

    @staticmethod
    @patch("app.services.admin_service.client.admin_create_user")
    async def admin_create_user_invalid_password(mock_admin_create_user: MagicMock):
        mock_admin_create_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidPasswordException",
                    "Message": "Password does not meet format"
                }
            },
            "admin_create_user"
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.create_user(mock_session, "john123", "john@gmail.com")

        assert exec.value.status_code == 400
        assert exec.value.detail == "Password does not meet format"

    @staticmethod
    @patch("app.services.admin_service.client.admin_create_user")
    async def admin_create_user_invalid_parameter(mock_admin_create_user: MagicMock):
        mock_admin_create_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidParameterException",
                    "Message": "Invalid username"
                }
            },
            "admin_create_user"
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.create_user(mock_session, "john123", "john@gmail.com")

        assert exec.value.status_code == 422
        assert exec.value.detail == "Invalid username"

    @staticmethod
    @patch("app.services.admin_service.client.admin_create_user")
    async def admin_create_user_unknown_error(mock_admin_create_user: MagicMock):
        mock_admin_create_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Invalid username"
                }
            },
            "admin_create_user"
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.create_user(mock_session, "john123", "john@gmail.com")

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

    #create_group
    @staticmethod
    @patch("app.services.admin_service.client.create_group")
    async def admin_create_group_success(mock_create_group: MagicMock):
        created = datetime(2026, 7, 8, 12, 0, tzinfo=timezone.utc)
        mock_create_group.return_value = {
             "Group": {
                "GroupName": "test",
                "UserPoolId": "test-12",
                "Description": "Test group User",
                "Precedence": 12,
                "LastModifiedDate": created,
                "CreationDate": created,
            }
        }

        response = await admin_service.create_group("Test", 12, "Test group User")

        assert response.group_name == "test"
        assert response.user_pool_id == "test-12"
        assert response.descriptipn == "Test group User"
        assert response.precedence == 12
        assert response.last_modified_date == created
        assert response.creation_date == created

        mock_create_group.assert_called_once_with(
            GroupName="test",
            UserPoolId="test-12",
            Description="Test group User",
            Precedence=12,
        )

    @staticmethod
    @patch("app.services.admin_service.client.create_group")
    async def admin_create_group_already_exist(mock_create_group: MagicMock):
        mock_create_group.side_effect = ClientError(
            {
                "Error": {
                    "Code": "GroupExistException",
                    "Message": "Group name already exist."
                }
            },
            "admin_create_group"
        )
         
        with pytest.raises(HTTPException) as exec:
            await admin_service.create_group("Test", 12, "Test group User")

        assert exec.value.status_code == 400
        assert exec.value.detail == "Group name already exist."

    @staticmethod
    @patch("app.services.admin_service.client.create_group")
    async def admin_create_group_unknown_error(mock_create_group: MagicMock):
        mock_create_group.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "admin_create_group"
        )
         
        with pytest.raises(HTTPException) as exec:
            await admin_service.create_group("Test", 12, "Test group User")

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

@pytest.mark.anyio
class testAdminDelete:
    
    @staticmethod
    @patch("app.services.admin_service.client.admin_remove_user_from_group")
    async def test_remove_user_from_group_success(mock_admin_remove_user_from_group: MagicMock):
        mock_admin_remove_user_from_group.return_value = {}

        response = await admin_service.remove_user_from_group("swdfcs")

        assert response.success is True
        assert response.message == "Removed swdfcs from Users"   
    
    @staticmethod
    @patch("app.services.admin_service.client.admin_remove_user_from_group")
    async def test_remove_user_from_group_unknown_error(mock_admin_remove_user_from_group: MagicMock):
        mock_admin_remove_user_from_group.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "delete_user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.remove_user_from_group("swdfcs")
        
        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

    #delete user
    @staticmethod
    @patch("app.services.admin_service.client.admin_delete_user")
    async def test_delete_user_success(mock_admin_delete_user: MagicMock):
        mock_admin_delete_user.return_value = {}

        mock_user = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_user

        mock_session.execute.return_value = mock_result
        mock_session.commit.return_value = None
        mock_session.delete.return_value = None

        response = await admin_service.delete_user(mock_session, "shaun", "12345")

        assert response.success is True
        assert response.message == "Deleted shaun permanently"

        mock_admin_delete_user.assert_called_once_with(
            UserPoolId=settings.cognito_user_pool_id,
            Username="shaun"
        )

        mock_session.execute.assert_awaited_once()
        mock_session.delete.assert_awaited_once_with(mock_user)
        mock_session.commit.assert_awaited_once()

    @staticmethod
    @patch("app.services.admin_service.client.admin_delete_user")
    async def test_delete_user_not_found_exception(mock_admin_delete_user: MagicMock):
        mock_admin_delete_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "UserNotFoundException",
                    "Message": "User not found"
                }
            },
            "delete_user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.delete_user(mock_session, "shaun", "12345")

        assert exec.value.status_code == 404
        assert exec.value.detail == "User not found"

    @staticmethod
    @patch("app.services.admin_service.client.admin_delete_user")
    async def test_delete_user_invalid_parameter(mock_admin_delete_user: MagicMock):
        mock_admin_delete_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InvalidParameterException",
                    "Message": "Invalid username"
                }
            },
            "delete_user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.delete_user(mock_session, "shaun", "12345")

        assert exec.value.status_code == 422
        assert exec.value.detail == "Invalid username"

    @staticmethod
    @patch("app.services.admin_service.client.admin_delete_user")
    async def test_delete_user_unknown_error(mock_admin_delete_user: MagicMock):
        mock_admin_delete_user.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "delete_user"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.delete_user(mock_session, "shaun", "12345")

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"

    #remove group
    @staticmethod
    @patch("app.services.admin_service.client.delete_group")
    async def test_delete_group_success(mock_delete_group: MagicMock):
        mock_delete_group.return_value = {}

        response = await admin_service.delete_group("users")

        assert response.success is True
        assert response.message == "Deleted users group"

        mock_delete_group.assert_called_once_with(
            GroupName="users",
            UserPoolId=settings.cognito_user_pool_id
        )

    @staticmethod
    @patch("app.services.admin_service.client.delete_group")
    async def test_delete_unknown_error(mock_delete_group: MagicMock):
        mock_delete_group.side_effect = ClientError(
            {
                "Error": {
                    "Code": "InternalErrorException",
                    "Message": "Internal server error"
                }
            },
            "delete_group"       
        )

        with pytest.raises(HTTPException) as exec:
            await admin_service.delete_group("users")

        assert exec.value.status_code == 400
        assert exec.value.detail == "InternalErrorException"