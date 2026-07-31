"""Smoke test: verify all core tables exist after schema creation."""

import pytest
from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import create_async_engine

from app.tests.db_url import get_pytest_database_url
from app.tests.postgres_fixtures import requires_postgres

# Use the db_client fixture that already drops & recreates all tables
pytestmark = [pytest.mark.usefixtures("db_client"), requires_postgres]

EXPECTED_TABLES = {
    "champions",
    "users",
    "game_accounts",
    "user_game_accounts",
    "matches",
    "participants",
    "achievement_definitions",
    "user_achievements",
    "user_featured_games",
}


@pytest.mark.asyncio
async def test_all_tables_exist():
    """Check that all 9 expected tables exist in the test database."""
    url = get_pytest_database_url()
    # URL is guaranteed non-null because requires_postgres already checked availability

    engine = create_async_engine(url)

    async with engine.begin() as conn:

        def get_table_names(sync_conn):
            inspector = inspect(sync_conn)
            return set(inspector.get_table_names())

        actual_tables = await conn.run_sync(get_table_names)

    missing_tables = EXPECTED_TABLES - actual_tables
    assert not missing_tables, f"Missing tables: {missing_tables}"
