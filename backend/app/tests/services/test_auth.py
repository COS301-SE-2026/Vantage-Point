"""
Unit tests for authentication service.

Tests user registration, login, confirmation, and token management.
Uses mocks to avoid actual AWS Cognito calls.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from app.services.auth_service import (
    register_user,
    login_user,
    confirm_user,
    logout_user,
    revoke_refresh_token,
    get_secret_hash,
    log_registration,
    _handle_cognito_error,
)


class TestGetSecretHash:
    """Test suite for secret hash generation."""

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
    """Test suite for registration logging."""

    @patch("builtins.open", create=True)
    def test_log_registration_writes_to_file(self, mock_open):
        """Test that log_registration writes user info to file."""
        mock_file = MagicMock()
        mock_open.return_value.__enter__.return_value = mock_file

        log_registration("testuser", "test@example.com")

        mock_open.assert_called_once_with("registrations.txt", "a")
        mock_file.write.assert_called_once()
        written_content = mock_file.write.call_args[0][0]
        assert "testuser" in written_content
        assert "test@example.com" in written_content
        assert "REGISTERED" in written_content

    @patch("builtins.open", create=True)
    def test_log_registration_format(self, mock_open):
        """Test that log_registration uses correct format."""
        mock_file = MagicMock()
        mock_open.return_value.__enter__.return_value = mock_file

        log_registration("john", "john@test.com")

        written_content = mock_file.write.call_args[0][0]
        assert "User: john" in written_content
        assert "Email: john@test.com" in written_content


class TestHandleCognitoError:
    """Test suite for Cognito error handling."""

    def test_handle_cognito_error_not_auth_exception(self):
        """Test that NotAuthorizedException returns 401."""
        error_response = {
            "Error": {"Code": "NotAuthorizedException", "Message": "User not found"}
        }
        client_error = ClientError(error_response, "sign_up")

        with pytest.raises(HTTPException) as exc_info:
            _handle_cognito_error(client_error)

        assert exc_info.value.status_code == 401

    def test_handle_cognito_error_too_many_requests(self):
        """Test that TooManyRequestsException returns 429."""
        error_response = {
            "Error": {"Code": "TooManyRequestsException", "Message": "Rate limited"}
        }
        client_error = ClientError(error_response, "sign_up")

        with pytest.raises(HTTPException) as exc_info:
            _handle_cognito_error(client_error)

        assert exc_info.value.status_code == 429

    def test_handle_cognito_error_default_status_code(self):
        """Test that unknown errors return 400."""
        error_response = {
            "Error": {"Code": "SomeUnknownError", "Message": "Something went wrong"}
        }
        client_error = ClientError(error_response, "sign_up")

        with pytest.raises(HTTPException) as exc_info:
            _handle_cognito_error(client_error)

        assert exc_info.value.status_code == 400


class TestRegisterUser:
    """Test suite for user registration."""

    @patch("app.services.auth_service.client")
    @patch("app.services.auth_service.log_registration")
    async def test_register_user_success(self, mock_log, mock_client):
        """Test successful user registration."""
        mock_client.sign_up = MagicMock(return_value={"UserSub": "test-sub-123"})
        mock_client.admin_confirm_sign_up = MagicMock()

        result = await register_user("testuser", "TestPass123!", "test@example.com")

        assert result is not None
        mock_client.sign_up.assert_called_once()
        mock_log.assert_called_once()

    @patch("app.services.auth_service.client")
    async def test_register_user_cognito_error(self, mock_client):
        """Test registration failure with Cognito error."""
        error_response = {
            "Error": {
                "Code": "UsernameExistsException",
                "Message": "User already exists",
            }
        }
        mock_client.sign_up = MagicMock(
            side_effect=ClientError(error_response, "sign_up")
        )

        with pytest.raises(HTTPException) as exc_info:
            await register_user("existinguser", "TestPass123!", "test@example.com")

        assert exc_info.value.status_code == 400


class TestLoginUser:
    """Test suite for user login."""

    @patch("app.services.auth_service.client")
    async def test_login_user_success(self, mock_client):
        """Test successful user login."""
        mock_response = {
            "AuthenticationResult": {
                "AccessToken": "access_token_123",
                "IdToken": "id_token_123",
                "RefreshToken": "refresh_token_123",
            }
        }
        mock_client.initiate_auth = MagicMock(return_value=mock_response)

        result = await login_user("testuser", "TestPass123!")

        assert "AccessToken" in result
        assert result["AccessToken"] == "access_token_123"
        mock_client.initiate_auth.assert_called_once()

    @patch("app.services.auth_service.client")
    async def test_login_user_invalid_credentials(self, mock_client):
        """Test login failure with invalid credentials."""
        error_response = {
            "Error": {
                "Code": "NotAuthorizedException",
                "Message": "Incorrect username or password",
            }
        }
        mock_client.initiate_auth = MagicMock(
            side_effect=ClientError(error_response, "initiate_auth")
        )

        with pytest.raises(HTTPException) as exc_info:
            await login_user("testuser", "WrongPassword")

        assert exc_info.value.status_code == 401


class TestConfirmUser:
    """Test suite for user confirmation."""

    @patch("app.services.auth_service.client")
    async def test_confirm_user_success(self, mock_client):
        """Test successful user confirmation."""
        mock_client.confirm_sign_up = MagicMock()

        result = await confirm_user("testuser", "123456")

        assert result == {"status": "success"}
        mock_client.confirm_sign_up.assert_called_once()

    @patch("app.services.auth_service.client")
    async def test_confirm_user_invalid_code(self, mock_client):
        """Test confirmation failure with invalid code."""
        error_response = {
            "Error": {
                "Code": "InvalidParameterException",
                "Message": "Invalid verification code",
            }
        }
        mock_client.confirm_sign_up = MagicMock(
            side_effect=ClientError(error_response, "confirm_sign_up")
        )

        with pytest.raises(HTTPException):
            await confirm_user("testuser", "000000")


class TestLogoutUser:
    """Test suite for user logout."""

    @patch("app.services.auth_service.client")
    async def test_logout_user_success(self, mock_client):
        """Test successful user logout."""
        mock_client.global_sign_out = MagicMock()

        result = await logout_user("valid_access_token")

        assert result["status"] == "success"
        assert "Logged out" in result["message"]
        mock_client.global_sign_out.assert_called_once()

    @patch("app.services.auth_service.client")
    async def test_logout_user_invalid_token(self, mock_client):
        """Test logout failure with invalid token."""
        error_response = {
            "Error": {
                "Code": "NotAuthorizedException",
                "Message": "Invalid access token",
            }
        }
        mock_client.global_sign_out = MagicMock(
            side_effect=ClientError(error_response, "global_sign_out")
        )

        with pytest.raises(HTTPException) as exc_info:
            await logout_user("invalid_token")

        assert exc_info.value.status_code == 401


class TestRevokeRefreshToken:
    """Test suite for refresh token revocation."""

    @patch("app.services.auth_service.client")
    async def test_revoke_refresh_token_success(self, mock_client):
        """Test successful refresh token revocation."""
        mock_client.revoke_token = MagicMock()

        result = await revoke_refresh_token("valid_refresh_token")

        assert result["status"] == "success"
        assert "revoked" in result["message"]
        mock_client.revoke_token.assert_called_once()

    @patch("app.services.auth_service.client")
    async def test_revoke_refresh_token_invalid_token(self, mock_client):
        """Test revocation failure with invalid token."""
        error_response = {
            "Error": {
                "Code": "InvalidParameterException",
                "Message": "Invalid refresh token",
            }
        }
        mock_client.revoke_token = MagicMock(
            side_effect=ClientError(error_response, "revoke_token")
        )

        with pytest.raises(HTTPException):
            await revoke_refresh_token("invalid_token")
