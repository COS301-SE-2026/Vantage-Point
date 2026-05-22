"""Shared values for pytest only (not used in production)."""

import os

TEST_JWT_SECRET = os.getenv("JWT_SECRET", "pytest-jwt-secret")
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD", "pytest-user-password")
