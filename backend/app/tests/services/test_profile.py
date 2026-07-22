"""
Unit testing for profile_service page

Test all profile services defined in profile_servcie page, and player_profile
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from app.services.profile_services import ProfileService
from app.database.models import Users
from datetime import datetime, timezone
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

def make_mock_session(scalar_return: Any=None) -> Any:
    session = AsyncSession()
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