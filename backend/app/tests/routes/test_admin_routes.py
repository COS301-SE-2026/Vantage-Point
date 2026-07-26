import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.api.router.admin_routes import router
from app.services.admin_service import admin_service
from app.main import app
from app.Models.auth_model import UserTest
from typing import Any

app.include_router(router)


mock_user = UserTest(
    sub="test-sub-123",
    password="Test@123",
    username="admin_user",
    email="admin@test.com",
    groups=["Admin"],
)