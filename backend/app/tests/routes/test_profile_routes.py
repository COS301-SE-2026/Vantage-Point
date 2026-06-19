import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import status
from datetime import datetime, timezone, timedelta
from app.main import app
from typing import Any
from app.api.auth import get_current_user


@pytest.mark.anyio
class TestProfileRoutes:
    """Test suite for /api/profile endpoints."""

    @pytest.fixture(autouse=True)
    def setup_auth_override(self):
        """Override the get_current_user dependency for all tests in this class."""
        # This is the "FastAPI way" to mock dependencies
        app.dependency_overrides[get_current_user] = lambda: "test-uuid-123"
        yield
        # Clean up after the tests are done
        app.dependency_overrides.clear()

    @patch("app.services.profile_services.ProfileService.get_or_create_profile")
    @patch("app.services.profile_services.ProfileService.build_player_summary")
    async def test_get_profile_success(
        self, mock_summary: MagicMock, mock_get_profile: MagicMock, client: TestClient
    ):
        """Test GET /api/profile returns 200 and profile data."""
        # Mock auth to return a fake user ID
        mock_auth_id = "test-uuid-123"

        # Mock service responses
        mock_profile = MagicMock()
        mock_profile.user_id = mock_auth_id
        mock_profile.username = "TestSummoner"
        mock_get_profile.return_value = mock_profile

        # COMPLETE MOCK DATA FOR PLAYER SUMMARY
        mock_player_summary: Any = {
            "most_played_character": "Thresh",
            "common_mistakes": ["Poor positioning"],
            "avg_kda": "3.5 / 2.0 / 12.0",
            "win_rate": "65%",
            "top_champions": ["Thresh"],
            "recent_performance": "Excellent",
        }
        mock_summary.return_value = (10, mock_player_summary)

        response = client.get("/api/profile")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["uuid"] == mock_auth_id
        assert data["player_summary"]["most_played_character"] == "Thresh"

    @patch("app.services.profile_services.ProfileService.create_profile")
    @patch("app.services.profile_services.ProfileService.build_player_summary")
    async def test_create_profile_success(
        self, mock_summary: MagicMock, mock_create: MagicMock, client: TestClient
    ):
        """Test POST /api/profile success."""
        mock_profile = MagicMock()
        mock_profile.user_id = "test-uuid-123"
        mock_profile.username = "NewUser"
        mock_create.return_value = mock_profile

        # COMPLETE MOCK DATA FOR PLAYER SUMMARY
        mock_player_summary: Any = {
            "most_played_character": "N/A",
            "common_mistakes": [],
            "avg_kda": "0.0 / 0.0 / 0.0",
            "win_rate": "0%",
            "top_champions": [],
            "recent_performance": "New Player",
        }
        mock_summary.return_value = (0, mock_player_summary)

        payload = {"username": "NewUser", "game_name": "RiotName", "tag_line": "1234"}
        response = client.post("/api/profile", json=payload)

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["username"] == "NewUser"

    @patch("app.services.profile_services.ProfileService.schedule_account_deletion")
    async def test_delete_profile_success(
        self, mock_schedule: MagicMock, client: TestClient
    ):
        """Test DELETE /api/profile success."""
        mock_schedule.return_value = datetime.now(timezone.utc) + timedelta(days=30)

        response = client.delete("/api/profile")

        assert response.status_code == status.HTTP_200_OK
        assert "marked for deletion" in response.json()["message"]

    @patch("app.services.profile_services.ProfileService.undo_account_deletion")
    async def test_undo_delete_success(self, mock_undo: MagicMock, client: TestClient):
        """Test POST /api/profile/undo-delete success."""
        mock_undo.return_value = True

        response = client.post("/api/profile/undo-delete")

        assert response.status_code == status.HTTP_200_OK

    @patch("app.services.profile_services.ProfileService.undo_account_deletion")
    async def test_undo_delete_not_found(
        self, mock_undo: MagicMock, client: TestClient
    ):
        """Test POST /api/profile/undo-delete failure when not marked."""
        mock_undo.return_value = False

        response = client.post("/api/profile/undo-delete")

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestMiscRoutes:
    """Test suite for Matches and Riot Key endpoints."""

    @pytest.fixture(autouse=True)
    def setup_auth_override(self):
        app.dependency_overrides[get_current_user] = lambda: "test-uuid-123"
        yield
        app.dependency_overrides.clear()

    def test_get_matches_success(self, client: TestClient):
        """Test GET /api/matches returns mock match list."""
        response = client.get("/api/matches")
        assert response.status_code == status.HTTP_200_OK

    def test_update_riot_key(self, client: TestClient):
        """Test PUT /api/profile/riot-key."""
        payload = {"riot_api_key": "RGAPI-test-key-123"}
        response = client.put("/api/profile/riot-key", json=payload)
        assert response.status_code == status.HTTP_200_OK
