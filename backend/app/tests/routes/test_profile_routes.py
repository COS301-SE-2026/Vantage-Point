import pytest
from unittest.mock import patch, MagicMock
from fastapi import status
from datetime import datetime, timezone, timedelta
from app.main import app
from app.api.auth import get_current_user


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
    async def test_get_profile_success(self, mock_summary, mock_get_profile, client):
        """Test GET /api/profile returns 200 and profile data."""
        # Mock auth to return a fake user ID
        mock_auth_id = "test-uuid-123"

        # Mock service responses
        mock_profile = MagicMock()
        mock_profile.cognito_sub = mock_auth_id
        mock_profile.display_name = "TestSummoner"
        mock_get_profile.return_value = mock_profile

        # COMPLETE MOCK DATA FOR PLAYER SUMMARY
        mock_player_summary = {
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
        assert data["cognito_sub"] == mock_auth_id
        assert data["display_name"] == "TestSummoner"
        assert data["player_summary"]["most_played_character"] == "Thresh"

    @patch("app.services.profile_services.ProfileService.create_profile")
    @patch("app.services.profile_services.ProfileService.build_player_summary")
    async def test_create_profile_success(self, mock_summary, mock_create, client):
        """Test POST /api/profile success."""
        mock_profile = MagicMock()
        mock_profile.cognito_sub = "test-uuid-123"
        mock_profile.display_name = "NewUser"
        mock_create.return_value = mock_profile

        # COMPLETE MOCK DATA FOR PLAYER SUMMARY
        mock_player_summary = {
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
        assert response.json()["cognito_sub"] == "test-uuid-123"
        assert response.json()["display_name"] == "NewUser"

    @patch("app.services.profile_services.ProfileService.schedule_account_deletion")
    async def test_delete_profile_success(self, mock_schedule, client):
        """Test DELETE /api/profile success."""
        mock_schedule.return_value = datetime.now(timezone.utc) + timedelta(days=30)

        response = client.delete("/api/profile")

        assert response.status_code == status.HTTP_200_OK
        assert "marked for deletion" in response.json()["message"]

    @patch("app.services.profile_services.ProfileService.undo_account_deletion")
    async def test_undo_delete_success(self, mock_undo, client):
        """Test POST /api/profile/undo-delete success."""
        mock_undo.return_value = True

        response = client.post("/api/profile/undo-delete")

        assert response.status_code == status.HTTP_200_OK

    @patch("app.services.profile_services.ProfileService.undo_account_deletion")
    async def test_undo_delete_not_found(self, mock_undo, client):
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

    def test_get_matches_success(self, client):
        """Test GET /api/matches returns mock match list."""
        response = client.get("/api/matches")
        assert response.status_code == status.HTTP_200_OK

    def test_update_riot_key(self, client):
        """Test PUT /api/profile/riot-key."""
        payload = {"riot_api_key": "RGAPI-test-key-123"}
        response = client.put("/api/profile/riot-key", json=payload)
        assert response.status_code == status.HTTP_200_OK


# Below is Integration test using the real database
@pytest.mark.usefixtures("seeded_db_client")  # provides TestClient with seeded DB
class TestProfileIntegration:
    """Integration tests for /api/profile using a seeded test database."""

    def test_get_profile_returns_valid_schema(self, seeded_db_client):
        client = seeded_db_client
        # override auth to match the seeded user_id
        # the seeded user has cognito ssub = "00000000-0000-4000-8000-000000000099"
        user_id = "00000000-0000-4000-8000-000000000099"
        app.dependency_overrides[get_current_user] = lambda: user_id

        response = client.get("/api/profile")

        # Clean up the override so it doesn't affect other tests like the aboeve ones or the ones that come after
        app.dependency_overrides.clear()

        assert response.status_code == status.HTTP_200_OK
        # wouldve just made response.status_code == 200 but i am following previous tests' style
        data = response.json()

        # verify structure matches ProfileResponse
        assert "cognito_sub" in data
        assert data["cognito_sub"] == user_id
        assert "display_name" in data
        assert isinstance(data["display_name"], str) or data["display_name"] is None
        assert "total_matches" in data
        assert isinstance(data["total_matches"], int)
        assert "player_summary" in data

        summary = data["player_summary"]
        assert "most_played_character" in summary
        assert "common_mistakes" in summary
        assert isinstance(summary["common_mistakes"], list)
        assert "avg_kda" in summary
        assert "win_rate" in summary
