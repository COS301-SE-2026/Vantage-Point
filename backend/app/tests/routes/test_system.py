"""
Unit tests for system endpoints.

Tests basic FastAPI application functionality and response schemas.
No database or external API calls required.
"""

from fastapi import status
from unittest.mock import patch, AsyncMock, MagicMock
import pytest


class TestRootEndpoint:
    """Test suite for the root endpoint."""

    def test_root_endpoint_returns_success(self, client):
        """Test that GET / returns a successful response."""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK

    def test_root_endpoint_returns_correct_message(self, client):
        """Test that GET / returns the correct message."""
        response = client.get("/")
        data = response.json()
        assert "message" in data

    def test_root_endpoint_response_format(self, client):
        """Test that GET / returns properly formatted JSON."""
        response = client.get("/")
        data = response.json()
        assert isinstance(data, dict)
        assert len(data) > 0


class TestHealthEndpoint:
    """Test suite for the health check endpoint."""

    def test_health_endpoint_returns_success(self, client):
        """Test that GET /health returns a successful response."""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK

    def test_health_endpoint_returns_status(self, client):
        """Test that GET /health returns status field."""
        response = client.get("/health")
        data = response.json()
        assert "status" in data

    def test_health_endpoint_response_structure(self, client):
        """Test that GET /health returns properly structured JSON."""
        response = client.get("/health")
        data = response.json()
        assert isinstance(data, dict)
        assert "status" in data

    def test_health_endpoint_content_type(self, client):
        """Test that GET /health returns JSON content type."""
        response = client.get("/health")
        assert response.headers["content-type"] == "application/json"


class TestTestEndpoint:
    """Test suite for the test endpoint."""

    def test_test_endpoint_returns_success(self, client):
        """Test that POST /api/test returns a successful response."""
        payload = {"test_key": "test_value"}
        response = client.post("/api/test", json=payload)
        assert response.status_code == status.HTTP_200_OK

    def test_test_endpoint_echoes_received_data(self, client):
        """Test that POST /api/test echoes back the received data."""
        payload = {"test_key": "test_value", "another_key": "another_value"}
        response = client.post("/api/test", json=payload)
        data = response.json()
        assert "received" in data
        assert data["received"] == payload

    def test_test_endpoint_returns_success_message(self, client):
        """Test that POST /api/test includes a success message."""
        payload = {"test_key": "test_value"}
        response = client.post("/api/test", json=payload)
        data = response.json()
        assert "message" in data

    def test_test_endpoint_with_empty_dict(self, client):
        """Test that POST /api/test handles empty dictionary."""
        response = client.post("/api/test", json={})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] == {}

    def test_test_endpoint_with_complex_data(self, client):
        """Test that POST /api/test handles complex nested data."""
        payload = {"nested": {"key": "value"}, "array": [1, 2, 3], "string": "test"}
        response = client.post("/api/test", json=payload)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] == payload


class TestErrorHandling:
    """Test suite for error handling in main.py."""

    def test_validation_error_response(self, client):
        """Test that validation errors return proper error format."""
        # Send invalid JSON to /api/test (string instead of dict)
        response = client.post("/api/test", json="not a dict")

        # The validation_exception_handler returns 400, not 422
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        # Error responses should have detail field
        assert "detail" in data

    def test_not_found_error(self, client):
        """Test that 404 returns proper error format."""
        # Request non-existent endpoint
        response = client.get("/api/nonexistent-route")

        # Should return 404 Not Found
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_error_response_structure(self, client):
        """Test that error responses have proper error structure."""
        # Request non-existent endpoint
        response = client.get("/api/nonexistent")

        # Verify error response format
        if response.status_code == 404:
            data = response.json()
            # Error responses should contain detail field or have content
            assert "detail" in data or len(data) > 0

    def test_http_exception_handler(self, client):
        """Test HTTPException error handler."""
        # Request endpoint that doesn't exist (triggers HTTPException)
        response = client.get("/api/does-not-exist")

        # Verify proper error status code
        assert response.status_code in [404, 405]
        # Verify error response has proper structure
        assert response.headers.get("content-type") == "application/json"


class TestValidationErrorHandler:
    """Test suite for RequestValidationError exception handler.

    Tests that validation errors are properly formatted and caught.
    """

    def test_validation_error_returns_400(self, client):
        """Test that invalid request body returns 400 with error format.

        The validation_exception_handler should format errors properly.
        """
        # Send POST to /api/test with invalid data type
        # (should be dict, sending string)
        response = client.post("/api/test", json="invalid string")

        # Validation error should return 400
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        # Should have error response format from error_response()
        assert "detail" in data or "status" in data

    def test_validation_error_format(self, client):
        """Test that validation errors follow error_response format.

        Errors should include proper structure and content type.
        """
        # Send request with wrong data type
        response = client.post("/api/test", json="not a dict")

        # Check response format
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.headers.get("content-type") == "application/json"


class TestRegisterSummonerRoute:
    """Test suite for POST /summoners/register endpoint.

    Tests the summoner registration endpoint that integrates with Riot API.
    """

    @patch("app.main.get_puuid_by_riot_id")
    @patch("app.main.async_session_maker")
    async def test_register_summoner_success(self, mock_session_maker, mock_get_puuid, client):
        """Test successful summoner registration.

        Mocks Riot API call and database session.
        """
        # Mock Riot API to return a PUUID
        mock_get_puuid.return_value = "test-puuid-123"

        # Mock database session
        mock_session = AsyncMock()
        mock_session_maker.return_value.__aenter__.return_value = mock_session

        # Mock database query result (no existing account)
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute = AsyncMock(return_value=mock_result)
        mock_session.commit = AsyncMock()

        # Call endpoint
        response = client.post(
            "/summoners/register",
            params={"game_name": "TestPlayer", "tag_line": "NA1"}
        )

        # Verify success
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "Successfully registered" in data["message"]
        assert data["puuid"] == "test-puuid-123"

    @patch("app.main.get_puuid_by_riot_id")
    async def test_register_summoner_not_found(self, mock_get_puuid, client):
        """Test registration when player not found on Riot servers.

        Tests error handling when Riot API returns no PUUID.
        """
        # Mock Riot API to return None (player not found)
        mock_get_puuid.return_value = None

        # Call endpoint
        response = client.post(
            "/summoners/register",
            params={"game_name": "NonExistent", "tag_line": "NA1"}
        )

        # Verify error response
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "error" in data
        assert "Could not find" in data["error"]

    @patch("app.main.get_puuid_by_riot_id")
    @patch("app.main.async_session_maker")
    async def test_register_summoner_already_exists(self, mock_session_maker, mock_get_puuid, client):
        """Test registration when summoner already in database.

        Tests handling of duplicate registrations.
        """
        # Mock Riot API to return a PUUID
        mock_get_puuid.return_value = "existing-puuid-123"

        # Mock database session
        mock_session = AsyncMock()
        mock_session_maker.return_value.__aenter__.return_value = mock_session

        # Mock database query result (account already exists)
        mock_result = MagicMock()
        mock_existing_account = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_existing_account
        mock_session.execute = AsyncMock(return_value=mock_result)

        # Call endpoint
        response = client.post(
            "/summoners/register",
            params={"game_name": "ExistingPlayer", "tag_line": "NA1"}
        )

        # Verify response
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "already in database" in data["message"]
