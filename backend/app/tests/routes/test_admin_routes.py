import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from app.api.router.admin_routes import router
from app.services.admin_service import admin_service


