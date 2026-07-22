"""
Unit testing for profile_service page

Test all profile services defined in profile_servcie page, and player_profile
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from app.services.profile_services import ProfileService
from app.database.models import Users
from datetime import datetime, timezone, timedelta
from app.config import get_settings
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

settings = get_settings()

mock_session = AsyncMock(spec=AsyncSession)

def make_cognito_response(sub: str="sub-123", email:str="test@test.com", username:str="testuser") -> Any:
    return {
        "Username": username,
        "UserAttributes": [
            {"Name": "sub", "Value": sub},
            {"Name": "sub", "Value": email}
        ],
    }

def make_mock_session(scalar_return: Any=None) -> AsyncMock:
    session = AsyncMock(spec=AsyncSession)
    result = MagicMock()
    result.scalar_one_or_none.return_value = scalar_return
    session.execute.return_value = result
    return session

@pytest.mark.anyio
class ProfileServiceTest():

    @staticmethod
    async def test_get_or_create_profile_empty_token():
        session = make_mock_session()
        with pytest.raises(HTTPException) as exc:
            await ProfileService.get_or_create_profile(session, "")
        assert exc.value.status_code == 500

    @staticmethod
    @patch("app.services.profile_services.client")
    async def test_get_or_create_profile_existing_user(mock_client: Any):
        mock_client.get_user = MagicMock(return_value=make_cognito_response())
        created_at = datetime(2026, 7, 22, 10, 30, 0, tzinfo=timezone.utc)
        updated_at = datetime(2026, 7, 22, 10, 30, 0, tzinfo=timezone.utc)
        existing_user: Any = Users(cognito_sub="sub-123", email="test@test.com", display_name="testuser", created_at=created_at, updated_at=updated_at)
        session = make_mock_session(existing_user)

        result = await ProfileService.get_or_create_profile(session, "valid-token")
        assert result is existing_user
        session.execute.assert_called_once()

    @staticmethod
    @patch("app.services.profile_services.client")
    async def test_get_or_create_profile_creates_new_user(mock_client: Any):
        mock_client.get_user = MagicMock(return_value=make_cognito_response())
        session = make_mock_session(None)

        with patch.object(ProfileService, "create_profile", new=AsyncMock(return_value="new_profile")) as mock_create:
            result = await ProfileService.get_or_create_profile(session, "valid-token")
        assert result == "new_profile"
        mock_create.assert_called_once()

    @staticmethod
    async def test_create_profile_none_user():
        session = AsyncMock()
        with pytest.raises(HTTPException) as exc:
            await ProfileService.create_profile(session,None)
        assert exc.value.status_code == 400

    @staticmethod
    async def test_create_profile_missing_username():
        session = AsyncMock()
        user = MagicMock(sub="sub-123", email="test@test.com", username=None)
        with pytest.raises(HTTPException) as exc:
            await ProfileService.create_profile(session, user)
        assert exc.value.status_code == 400

    @staticmethod
    @patch("app.services.profile_services.client")
    async def test_schedule_account_deletion_success(mock_client: Any):
        mock_client.get_user = MagicMock(return_value=make_cognito_response)
        created_at = datetime(2026, 7, 22, 10, 30, 0, tzinfo=timezone.utc)
        updated_at = datetime(2026, 7, 22, 10, 30, 0, tzinfo=timezone.utc)
        profile: Any = Users(cognito_sub="sub-123", email="test@test.com", display_name="testuser", created_at=created_at, updated_at=updated_at)
        session = make_mock_session(profile)

        result = await ProfileService.schedule_account_deletion(session, "valid_token")

        assert isinstance(result, datetime)
        assert (result - datetime.now()).days in (29, 30)
        session.commit.assert_called_once()

    @staticmethod
    @patch("app.services.profile_services.client")
    async def test_schedule_account_deletion_user_not_found(mock_client: Any):
        mock_client.get_user = MagicMock(make_cognito_response)
        session = make_mock_session(None)

        with pytest.raises(HTTPException) as exc:
            await ProfileService.schedule_account_deletion(session, "valid_token")
        assert exc.value.status_code == 404


    @staticmethod
    @patch("app.services.profile_services.client")
    async def test_undo_account_deletion_success(mock_client: Any):
        mock_client.get_user = MagicMock(make_cognito_response)
        created_at = datetime(2026, 7, 22, 10, 30, 0, tzinfo=timezone.utc)
        deletion = created_at + timedelta(30)
        profile = Users(
            cognito_sub="sub-123", email="test@test.com", display_name="testuser",
            deletion_scheduled_at=deletion, created_at=created_at, updated_at=created_at
        )

        session = make_mock_session(profile)
        result = await ProfileService.undo_account_deletion(session, "valid-token")

        assert result == "testuser"
        assert profile.deletion_scheduled_at == datetime(1999, 12, 31)

    @staticmethod
    @patch("app.services.profile_services.client")
    async def test_undo_account_deletion_not_found(mock_client: Any):
        mock_client.get_user = MagicMock(make_cognito_response)
        session = make_mock_session(None)
        with pytest.raises(HTTPException) as exc:
            await ProfileService.undo_account_deletion(session, "valid-token")
        assert exc.value.status_code == 404

    @staticmethod
    @patch("app.services.profile_services.boto3.client")
    async def test_update_email_success(mock_client: Any):
        mock_cognito = MagicMock()
        mock_client.return_value = mock_cognito
        created_at = datetime(2026, 7, 22, 10, 30, 0, tzinfo=timezone.utc)
        profile = Users(cognito_sub="sub-123", email="old@test.com", display_name="testuser", created_at=created_at, updated_at=created_at)
        session = make_mock_session(profile)

        result = await ProfileService.update_email(session, "new@test.com", "valid-token")

        assert result.email == "new@test.com"
        mock_cognito.update_user_attributes.assert_called_once()

    @staticmethod
    @patch("app.services.profile_services.boto3.client")
    async def test_update_email_no_email():
        session = AsyncMock()
        with pytest.raises(HTTPException) as exc:
            await ProfileService.update_email(session, None, "valid-token")
        assert exc.value.status_code == 400

    @staticmethod
    @patch("app.services.profile_services.boto3.client")
    async def test_update_email_user_not_found():
        session = make_mock_session(None)
        with pytest.raises(HTTPException) as exc:
            await ProfileService.update_email(session, "new@test.com", "valid-token")
        assert exc.value.status_code == 400
