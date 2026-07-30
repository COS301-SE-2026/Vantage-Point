"""
Unit testing for admin page

Test all admin endpoints and Mocks AWS Cognito dependency
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
