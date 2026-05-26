import pytest
from unittest.mock import MagicMock, patch
from botocore.exceptions import ClientError
from fastapi import HTTPException

from app.services import auth_service

@pytest.fixture
def mock_settings():
    with patch.object(auth_service, "settings") as settings:
        settings.cognito_client_id = "test-client-id"
        settings.cognito_client_secret = "test-client-secret"
        settings.cognito_user_pool_id = "test-user-pool-id"
        settings.aws_region = "us-east-1"
        settings.debug = False
        yield settings

@pytest.fixture()
def mock_client():
    with patch.object(auth_service, "client") as client:
        yield client

def mak_client_error(code: str, message: str = "Cognito Erorr"):
    return ClientError(
        error_response={
            "Error": {
                "Code": code,
                "Message": message,
            }
        },
        operation_name="TestOperation",
    )

def test_get_secret_hash(mock_settings):
    result = auth_service.get_secret_hash("testuser")

    assert isinstance(result, str)
    assert len(result) > 0


