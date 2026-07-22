"""
Unit testing for profile_service page

Test all profile services defined in profile_servcie page, and player_profile
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from app.services.profile_services import ProfileService
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
