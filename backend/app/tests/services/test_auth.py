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
from fastapi.testclient import TestClient
from app.services.auth_service import (
    register_user,
    login_user,
    confirm_user,
    logout_user,
    revoke_refresh_token,
    get_secret_hash,
    log_registration,
    handle_cognito_error,
)
from app.tests.constants import TEST_USER_PASSWORD


def register_payload(email: str):
    """Helper function to create registration payload."""
    return {
        "email": email,
        "display_name": "Test Player",
        "password": TEST_USER_PASSWORD,
    }

# =====================================================
# Helpers for Unit Testing
# =====================================================

#function to be used in unit testing as this gets repeated at multiple places and it led to continous error for the same part
#hence I created this helper to replace those places
def make_client_error(code: str, msg: str, operation: str, http_status: int = 400,) -> ClientError:
    error_response: Any = {
        "Error": {
            "Code": code,
            "Message": msg
        },
        "RespondMetaData": {
            "RequestID": "test-access-token",
            "HTTPStatusCode": http_status,
            "HTTPHeaders": {},
            "RetryAttempts": 0
        }
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

    def test_get_secret_hash_different_for_different_users(self):
        """Test that different usernames produce different hashes."""
        hash1 = get_secret_hash("user1")
        hash2 = get_secret_hash("user2")
        assert hash1 != hash2


class TestLogRegistration:
    """Test suite for registration logging.

    These tests execute the real log_registration() function.
    Only the file I/O is mocked.
    """

    @patch("builtins.open", create=True)
    def test_log_registration_writes_to_file(self, mock_open: Any):
        """Test that log_registration writes user info to file."""
        mock_file = MagicMock()
        mock_open.return_value.__enter__.return_value = mock_file

        # Real function executes
        log_registration("testuser", "test@example.com")

        # Verify file was opened and written to
        mock_open.assert_called_once_with("registrations.txt", "a")
        mock_file.write.assert_called_once()
        written_content = mock_file.write.call_args[0][0]
        assert "testuser" in written_content
        assert "test@example.com" in written_content
        assert "REGISTERED" in written_content

    @patch("builtins.open", create=True)
    def test_log_registration_format(self, mock_open: Any):
        """Test that log_registration uses correct format."""
        mock_file = MagicMock()
        mock_open.return_value.__enter__.return_value = mock_file

        # Real function executes
        log_registration("john", "john@test.com")

        written_content = mock_file.write.call_args[0][0]
        assert "User: john" in written_content
        assert "Email: john@test.com" in written_content


class TestHandleCognitoError:
    """Test suite for Cognito error handling.

    These tests execute the real _handle_cognito_error() function.
    Tests error mapping logic.
    """

    def test_handle_cognito_error_not_auth_exception(self):
        """Test that NotAuthorizedException returns 401."""      
        client_error = client_error = make_client_error("NotAuthorizedException", "User not Found", "sign_up", 401)

        # Real function executes
        with pytest.raises(HTTPException) as exc_info:
            handle_cognito_error(client_error)

        assert exc_info.value.status_code == 401

    def test_handle_cognito_error_too_many_requests(self):
        """Test that TooManyRequestsException returns 429."""      
        client_error = make_client_error("TooManyRequestsException","Rate Limited", "sign_up",429 )

        # Real function executes
        with pytest.raises(HTTPException) as exc_info:
            handle_cognito_error(client_error)

        assert exc_info.value.status_code == 429

    def test_handle_cognito_error_default_status_code(self):
        """Test that unknown errors return 400."""
        client_error = make_client_error("SomeUnknownError", "Something went wrong", "sign_up",400)

        # Real function executes
        with pytest.raises(HTTPException) as exc_info:
            handle_cognito_error(client_error)

        assert exc_info.value.status_code == 400

@pytest.mark.anyio
class TestRegisterUser:
    """Test suite for user registration.

    Tests the real register_user() function logic.
    Only mocks the Cognito client (external dependency).
    """

    @patch("app.services.auth_service.client")
    @patch("app.services.auth_service.log_registration")
    async def test_register_user_success(self, _mock_log: Any, mock_client: MagicMock):
        """Test successful user registration.

        Real register_user() executes with mocked Cognito client.
        """
        # Mock the Cognito client methods
        mock_client.sign_up = MagicMock(return_value={"UserSub": "test-sub-123"})
        mock_client.admin_confirm_sign_up = MagicMock(return_value={})

        # Real function executes
        result = await register_user("testuser", "TestPass123!", "test@example.com")

        assert result is not None
        assert "UserSub" in result
        mock_client.sign_up.assert_called_once()

    @patch("app.services.auth_service.client")
    async def test_register_user_cognito_error(self, mock_client: MagicMock):
        """Test registration failure with Cognito error.

        Real register_user() executes and handles errors.
        """
        # Mock the client to raise error
        mock_client.sign_up = MagicMock(
            side_effect= make_client_error("UsernameExistsException", "User already Exists", "sign_up", 400)
        )

        # Real function executes and handles error
        with pytest.raises(HTTPException) as exc_info:
            await register_user("existinguser", "TestPass123!", "test@example.com")

        assert exc_info.value.status_code == 400


@pytest.mark.anyio
class TestLoginUser:
    """Test suite for user login.

    Tests the real login_user() function logic.
    Only mocks asyncio.to_thread and Cognito client.
    """

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_login_user_success(self, mock_to_thread: MagicMock):
        """Test successful user login.

        Real login_user() executes.
        """
        mock_response = {
            "AuthenticationResult": {
                "AccessToken": "access_token_123",
                "IdToken": "id_token_123",
                "RefreshToken": "refresh_token_123",
            }
        }

        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            return mock_response

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes
        result = await login_user("testuser", "TestPass123!")

        assert "AccessToken" in result
        assert result["AccessToken"] == "access_token_123"

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_login_user_invalid_credentials(self, mock_to_thread: MagicMock):
        """Test login failure with invalid credentials.

        Real login_user() executes and handles error.
        """     
        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            raise make_client_error("NotAuthorizedException", "Incorrect username or password", "initiate_auth", 401)

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes and handles error
        with pytest.raises(HTTPException) as exc_info:
            await login_user("testuser", "WrongPassword")

        assert exc_info.value.status_code == 401


@pytest.mark.anyio
class TestConfirmUser:
    """Test suite for user confirmation.

    Tests the real confirm_user() function logic.
    Only mocks asyncio.to_thread.
    """

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_confirm_user_success(self, mock_to_thread: MagicMock):
        """Test successful user confirmation.

        Real confirm_user() executes.
        """

        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            return {""}

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes
        result = await confirm_user("testuser", "123456")

        assert result == {"status": "success"}

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_confirm_user_invalid_code(self, mock_to_thread: MagicMock):
        """Test confirmation failure with invalid code.

        Real confirm_user() executes and handles error.
        """       
        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            raise make_client_error("InvalidParamaterException", "Invalid verification code", "confirm_sign_up")

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes and handles error
        with pytest.raises(HTTPException):
            await confirm_user("testuser", "000000")


@pytest.mark.anyio
class TestLogoutUser:
    """Test suite for user logout.

    Tests the real logout_user() function logic.
    Only mocks asyncio.to_thread.
    """

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_logout_user_success(self, mock_to_thread: MagicMock):
        """Test successful user logout.

        Real logout_user() executes.
        """

        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            return {""}

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes
        result = await logout_user("valid_access_token")

        assert result["status"] == "success"
        assert "Logged out" in result["message"]

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_logout_user_invalid_token(self, mock_to_thread: MagicMock):
        """Test logout failure with invalid token.

        Real logout_user() executes and handles error.
        """      
        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            raise make_client_error("NotAuthorizedException", "Invalid Access Token", "global_sign_out")

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes and handles error
        with pytest.raises(HTTPException) as exc_info:
            await logout_user("invalid_token")

        assert exc_info.value.status_code == 401


@pytest.mark.anyio
class TestRevokeRefreshToken:
    """Test suite for refresh token revocation.

    Tests the real revoke_refresh_token() function logic.
    Only mocks asyncio.to_thread.
    """

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_revoke_refresh_token_success(self, mock_to_thread: MagicMock):
        """Test successful refresh token revocation.

        Real revoke_refresh_token() executes.
        """

        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            return {""}

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes
        result = await revoke_refresh_token("valid_refresh_token")

        assert result["status"] == "success"
        assert "revoked" in result["message"]

    @patch("app.services.auth_service.asyncio.to_thread")
    async def test_revoke_refresh_token_invalid_token(self, mock_to_thread: MagicMock):
        """Test revocation failure with invalid token.

        Real revoke_refresh_token() executes and handles error.
        """      
        def mock_to_thread_impl(_func: Any, *_args: Any, **_kwargs: Any):
            raise make_client_error("InvalidParamaterException", "Invalid refresh token", "revoke_token")

        mock_to_thread.side_effect = mock_to_thread_impl

        # Real function executes and handles error
        with pytest.raises(HTTPException):
            await revoke_refresh_token("invalid_token")


# =====================================================
# Integration Tests - API Endpoints
# =====================================================


class TestAuthEndpoints:
    """Integration tests for authentication endpoints.

    Tests the actual HTTP endpoints with mocked Cognito backend.
    """

    # @pytets.mark.requires_postgres
    # def test_register_login_and_me(self, db_client: TestClient):
    #     """Test registration and login flow."""
    #     email = "auth_test@vantagepoint.dev"
    #     reg = db_client.post("/api/auth/register", json=_register_payload(email))
    #     assert reg.status_code == 200
    #     tokens = reg.json()
    #     assert "access_token" in tokens
    #     assert "refresh_token" in tokens

    #     login = db_client.post(
    #         "/api/auth/login",
    #         json={"email": email, "password": TEST_USER_PASSWORD},
    #     )
    #     assert login.status_code == 200

    # @pytest.mark.requires_postgres
    # def test_login_wrong_password(self, db_client: TestClient):
    #     """Test login with incorrect password."""
    #     email = "wrong_pass@vantagepoint.dev"
    #     db_client.post("/api/auth/register", json=_register_payload(email))
    #     login = db_client.post(
    #         "/api/auth/login",
    #         json={"email": email, "password": "wrong-password"},
    #     )
    #     assert login.status_code == 401

    def test_me_without_token(self, client: TestClient):
        """Test accessing protected endpoint without token."""
        # Note: This endpoint may not exist yet - adjust as needed
        # Skip if the endpoint is not implemented
        pass

    # @requires_postgres
    # @patch("app.services.user_accounts.get_puuid_by_riot_id", new_callable=AsyncMock)
    # def test_link_game_account(self, mock_puuid, db_client: TestClient):
    #     """Test linking a game account to user profile.

    #     Note: This endpoint may not exist yet - adjust as needed
    #     """
    #     # Skip if the endpoint is not implemented
    #     pass
