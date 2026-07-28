"""
Main test suite aggregator.

This file serves as the entry point for all tests.
"""

# Import system endpoint tests
# from app.tests.routes.test_system import (
#     TestRootEndpoint,
#     TestHealthEndpoint,
#     TestTestEndpoint,
# )

# Import service tests
from app.tests.services.test_auth import (
    TestGetSecretHash,
    TestLogRegistration,
    TestHandleCognitoError,
    TestRegisterUser,
    TestLoginUser,
    TestConfirmUser,
    TestLogoutUser,
    TestRevokeRefreshToken,
)

__all__ = [
    # System endpoints
    # "TestRootEndpoint",
    # "TestHealthEndpoint",
    # "TestTestEndpoint",
    # Auth service
    "TestGetSecretHash",
    "TestLogRegistration",
    "TestHandleCognitoError",
    "TestRegisterUser",
    "TestLoginUser",
    "TestConfirmUser",
    "TestLogoutUser",
    "TestRevokeRefreshToken",
]
