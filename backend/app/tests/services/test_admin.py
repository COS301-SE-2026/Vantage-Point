"""
Unit testing for admin page

Test all admin endpoints and Mocks AWS Cognito dependency
"""

import pytest
from typing import Any
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from botocore.exceptions import ClientError
from fastapi.testclient import TestClient
from app.services.admin_service import admin_service
from app.tests.constants import TEST_USER_PASSWORD

@pytest.mark.anyio
def get_user_success():
    admin_service.get_user()

def get_user():