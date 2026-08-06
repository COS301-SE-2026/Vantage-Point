"""
Test configuration and fixtures for Vantage Point Backend.

This setup uses simple mocks instead of database connections,
allowing tests to run while the database is still being set up.
"""

import os
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user, oauth2_scheme
from app.main import app
from app.Models.auth_model import (
    UserTest,
)
from app.tests.constants import TEST_JWT_SECRET, TEST_USER_PASSWORD

os.environ.setdefault("JWT_SECRET", TEST_JWT_SECRET)

pytest_plugins = ["app.tests.postgres_fixtures"]

fake_user = UserTest(
    sub="123456",
    username="testuser",
    password="TestPass123",
    email="test@example.com",
    groups=["Admin", "User"],
)


@pytest.fixture(scope="function")
def client():
    """Provide a FastAPI TestClient for testing endpoints."""
    app.dependency_overrides[get_current_user] = lambda: fake_user
    app.dependency_overrides[oauth2_scheme] = lambda: HTTPAuthorizationCredentials(
        scheme="Bearer", credentials="fake-access-token"
    )

    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    return {
        "display_name": "testuser",
        "email": "test@example.com",
        "password": TEST_USER_PASSWORD,
    }


@pytest.fixture
def test_user_response() -> dict[str, Any]:
    return {
        "id": "00000000-0000-4000-8000-000000000099",
        "email": "test@example.com",
        "display_name": "testuser",
        "riot_id_tag": None,
        "has_linked_riot": False,
    }


@pytest.fixture
def test_match_data() -> dict[str, Any]:
    return {
        "match_id": "NA1_123456789",
        "summoner_name": "TestPlayer",
        "coordinates": [[500, 600], [550, 650], [600, 700]],
    }


@pytest.fixture
def test_match_response() -> dict[str, Any]:
    return {
        "id": 1,
        "match_id": "NA1_123456789",
        "user_id": 1,
        "created_at": "2024-01-15T10:30:00Z",
    }


@pytest.fixture
def mock_db_session():
    return MagicMock()


@pytest.fixture
def mock_riot_api():
    mock_api = AsyncMock()
    mock_api.fetch_matches = AsyncMock(return_value=[])
    mock_api.fetch_match_timeline = AsyncMock(return_value={})
    return mock_api


@pytest.fixture
def mock_logger():
    return MagicMock()


@pytest.fixture
def mock_session():
    return AsyncMock(spec=AsyncSession)
