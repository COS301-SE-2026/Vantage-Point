"""Resolve DATABASE_URL for integration tests without embedding credentials."""

import os


def get_pytest_database_url() -> str | None:
    return os.getenv("DATABASE_URL")
