"""
Unit testing for profile_service page

Test all profile services defined in profile_servcie page, and player_profile
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from app.services.admin_service import admin_service
from datetime import datetime, timezone
from app.config import get_settings
from sqlalchemy.ext.asyncio import AsyncSession

settings = get_settings()

mock_session = AsyncMock(spec=AsyncSession)


@pytest.mark.anyio
class ProfileServiceTest():