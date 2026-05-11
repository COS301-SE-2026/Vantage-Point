"""
Test configuration and fixtures for Vantage Point Backend.

This setup uses simple mocks instead of database connections,
allowing tests to run while the database is still being set up.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock
from app.main import app


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
        dict: User data with username, email
    """
    return {
        "username": "testuser",
        "email": "test@example.com",
    }


@pytest.fixture
def test_user_response():
    """
    Provide sample user response data (as returned from the API).

    Returns:
        dict: User response with id, username, email, and timestamp
    """
    return {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "created_at": "2024-01-15T10:30:00Z",
    }


@pytest.fixture
def test_match_data():
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
def test_match_response():
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
