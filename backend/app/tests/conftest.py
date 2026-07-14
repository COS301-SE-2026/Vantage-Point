import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock
from app.main import app
from typing import Any

"""
Test configuration and fixtures for Vantage Point Backend.

This setup uses simple mocks instead of database connections,
allowing tests to run while the database is still being set up.
"""

# pytest_plugins = ["app.tests.postgres_fixtures"]


from app.tests.constants import TEST_JWT_SECRET, TEST_USER_PASSWORD  # noqa: E402

os.environ.setdefault("JWT_SECRET", TEST_JWT_SECRET)


@pytest.fixture(scope="function")
def client():
    """
    Provide a FastAPI TestClient for testing endpoints.

    Scope: function (new instance for each test)
    """
    return TestClient(app)


@pytest.fixture
def test_user_data():
    """
    Provide sample user data for testing user-related endpoints.

    Returns:
        dict: User data with display_name, email, password
    """
    return {
        "display_name": "testuser",
        "email": "test@example.com",
        "password": TEST_USER_PASSWORD,
    }


@pytest.fixture
def test_user_response() -> dict[str, Any]:
    """
    Provide sample user response data (as returned from the API).

    Returns:
        dict: User profile fields from GET /api/v1/users/me
    """
    return {
        "id": "00000000-0000-4000-8000-000000000099",
        "email": "test@example.com",
        "display_name": "testuser",
        "riot_id_tag": None,
        "has_linked_riot": False,
    }


@pytest.fixture
def test_match_data() -> dict[str, Any]:
    """
    Provide sample match data for testing match-related endpoints.

    Returns:
        dict: Match data with match_id and coordinates
    """
    return {
        "match_id": "NA1_123456789",
        "summoner_name": "TestPlayer",
        "coordinates": [[500, 600], [550, 650], [600, 700]],
    }


@pytest.fixture
def test_match_response() -> dict[str, Any]:
    """
    Provide sample match response data (as returned from the API).

    Returns:
        dict: Match response with id, match_id, user_id, and timestamp
    """
    return {
        "id": 1,
        "match_id": "NA1_123456789",
        "user_id": 1,
        "created_at": "2024-01-15T10:30:00Z",
    }


@pytest.fixture
def mock_db_session():
    """
    Provide a mock database session for testing services.

    Returns:
        MagicMock: Mock session object with common database methods
    """
    mock_session = MagicMock()
    return mock_session


@pytest.fixture
def mock_riot_api():
    """
    Provide a mock Riot API client for testing external API integration.

    Returns:
        AsyncMock: Mock async client for Riot API
    """
    mock_api = AsyncMock()
    mock_api.fetch_matches = AsyncMock(return_value=[])
    mock_api.fetch_match_timeline = AsyncMock(return_value={})
    return mock_api


@pytest.fixture
def mock_logger():
    """
    Provide a mock logger for testing logging behavior.

    Returns:
        MagicMock: Mock logger object
    """
    return MagicMock()
