"""
Unit tests for authentication service.

Tests user registration, login, confirmation, and token management.
Mocks only the external AWS Cognito dependency, allowing real service code to execute.
This increases code coverage by executing actual service logic.

Also includes integration tests for authentication endpoints.
"""

import pytest
from typing import Any
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from app.services.auth_service import (
    register_user,
    login_user,
    confirm_user,
    logout_user,
    get_secret_hash,
    _handle_cognito_error,
)
from app.tests.constants import TEST_USER_PASSWORD


# =====================================================
# Helpers for Unit Testing
# =====================================================


# function to be used in unit testing as this gets repeated at multiple places and it led to continous error for the same part
# hence I created this helper to replace those places
def make_client_error(
    code: str,
    msg: str,
    operation: str,
    http_status: int = 400,
) -> ClientError:
    error_response: Any = {
        "Error": {"Code": code, "Message": msg},
        "ResponseMetadata": {
            "RequestID": "test-request-id",
            "HTTPStatusCode": http_status,
            "HTTPHeaders": {},
            "RetryAttempts": 0,
        },
    }
    return ClientError(error_response, operation)


# =====================================================
# Unit Tests - Service Layer
# =====================================================


class TestGetSecretHash:
    """Test suite for secret hash generation.

    These tests execute the real get_secret_hash() function.
    No external dependencies, real coverage increase.
    """

    def test_get_secret_hash_returns_string(self):
        """Test that get_secret_hash returns a base64 encoded string."""
        result = get_secret_hash("testuser")
        assert isinstance(result, str)
        assert len(result) > 0

    def test_get_secret_hash_deterministic(self):
        """Test that same username produces same hash."""
        hash1 = get_secret_hash("testuser")
        hash2 = get_secret_hash("testuser")
        assert hash1 == hash2


class TestHandleCognitoError:
    """Test suite for Cognito error handling.

    These tests execute the real _handle_cognito_error() function.
    Tests error mapping logic.
    """

    def test_handle_cognito_error_not_auth_exception(self):
        """Test that NotAuthorizedException returns 401."""
        client_error = client_error = make_client_error(
            "NotAuthorizedException", "User not Found", "sign_up", 401
        )

        # Real function executes
        with pytest.raises(HTTPException) as exc_info:
            _handle_cognito_error(client_error)
        assert exc_info.value.status_code == 401

    def test_handle_cognito_error_too_many_requests(self):
        """Test that TooManyRequestsException returns 429."""
        client_error = make_client_error(
            "TooManyRequestsException", "Rate Limited", "sign_up", 429
        )

        # Real function executes
        with pytest.raises(HTTPException) as exc_info:
            _handle_cognito_error(client_error)
        assert exc_info.value.status_code == 429


@pytest.mark.anyio
class TestRegisterUser:
    """Test suite for user registration.

    Tests the real register_user() function logic.
    Only mocks the Cognito client (external dependency).
    """

    @patch("app.services.auth_service.client")
    async def test_register_user_success(self, mock_client: MagicMock) -> Any:
        # Mock Cognito behavior
        mock_client.sign_up.return_value = {"UserSub": "test-sub-123", "UserConfirmed": False}
        mock_client.admin_confirm_sign_up.return_value = {}
        mock_client.admin_update_user_attributes.return_value = {}

        # Service now takes only email and password
        result = await register_user("test@example.com", TEST_USER_PASSWORD)

        assert result["user_sub"] == "test-sub-123"
        assert result["user_confirmed"] is True
        mock_client.sign_up.assert_called_once()

    @patch("app.services.auth_service.client")
    async def test_register_user_cognito_error(self, mock_client: MagicMock):
        mock_client.sign_up.side_effect = make_client_error(
            "UsernameExistsException", "User already Exists", "sign_up", 409
        )

        # Real function executes and handles error
        with pytest.raises(HTTPException) as exc_info:
            await register_user("existing@example.com", TEST_USER_PASSWORD)

        assert exc_info.value.status_code == 409


@pytest.mark.anyio
class TestLoginUser:
    """Test suite for user login.

    Tests the real login_user() function logic.
    Only mocks asyncio.to_thread and Cognito client.
    """

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_login_user_success(self, mock_to_thread: MagicMock):
        # Cognito returns PascalCase keys
        mock_response = {
            "AuthenticationResult": {
                "AccessToken": "access_token_123",
                "IdToken": "id_token_123",
                "RefreshToken": "refresh_token_123",
            }
        }
        mock_to_thread.return_value = mock_response

        result = await login_user("test@example.com", TEST_USER_PASSWORD)

        assert "AccessToken" in result
        assert result["AccessToken"] == "access_token_123"

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_login_user_invalid_credentials(self, mock_to_thread: MagicMock):
        mock_to_thread.side_effect = make_client_error(
            "NotAuthorizedException", "Incorrect username or password", "initiate_auth", 401
        )

        with pytest.raises(HTTPException) as exc_info:
            await login_user("test@example.com", "WrongPassword")
        assert exc_info.value.status_code == 401


@pytest.mark.anyio
class TestConfirmUser:
    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_confirm_user_success(self, mock_to_thread: MagicMock):
        mock_to_thread.return_value = {}
        result = await confirm_user("test@example.com", "123456")
        assert result["status"] == "success"

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_confirm_user_invalid_code(self, mock_to_thread: MagicMock):
        mock_to_thread.side_effect = make_client_error(
            "CodeMismatchException", "Invalid verification code", "confirm_sign_up"
        )
        with pytest.raises(HTTPException):
            await confirm_user("test@example.com", "000000")


@pytest.mark.anyio
class TestLogoutUser:
    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_logout_user_success(self, mock_to_thread: MagicMock):
        mock_to_thread.return_value = {}
        result = await logout_user("valid_access_token")
        assert result["status"] == "success"
        assert "Logged out" in result["message"]

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_logout_user_invalid_token(self, mock_to_thread: MagicMock):
        mock_to_thread.side_effect = make_client_error(
            "NotAuthorizedException", "Invalid Access Token", "global_sign_out", 401
        )
        with pytest.raises(HTTPException) as exc_info:
            await logout_user("invalid_token")

        assert exc_info.value.status_code == 401
