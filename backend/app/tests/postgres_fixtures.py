"""Shared PostgreSQL integration-test fixtures (used by multiple test modules)."""

import asyncio
import socket

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel

from app.database.session import get_session
from app.main import app
from app.tests.db_url import get_pytest_database_url
from app.tests.seed_fixtures import seed_test_user_with_matches


def postgres_available() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 5432), timeout=0.5):
            return True
    except OSError:
        return False


DATABASE_URL = get_pytest_database_url()

requires_postgres = pytest.mark.skipif(
    not DATABASE_URL or not postgres_available(),
    reason="DATABASE_URL must be set and PostgreSQL available on localhost:5432",
)


def _make_db_client(*, seed_matches: bool) -> tuple[TestClient, object]:
    assert DATABASE_URL is not None
    engine = create_async_engine(DATABASE_URL, poolclass=NullPool)

    async def _setup() -> None:
        from sqlalchemy import text  # add this import at the top of the file

        async with engine.begin() as conn:
            # Drop orphan tables that aren't tracked by SQLModel metadata
            await conn.run_sync(
                lambda conn: conn.execute(
                    text("DROP TABLE IF EXISTS userprofile CASCADE")
                )
            )
            await conn.run_sync(SQLModel.metadata.drop_all)
            await conn.run_sync(SQLModel.metadata.create_all)
        if seed_matches:
            async with AsyncSession(engine) as session:
                await seed_test_user_with_matches(session)

    asyncio.run(_setup())

    async def override_get_session():
        async with AsyncSession(engine) as session:
            yield session

    app.router.on_startup.clear()
    app.dependency_overrides[get_session] = override_get_session
    return TestClient(app), engine


@pytest.fixture
def db_client():
    client, engine = _make_db_client(seed_matches=False)
    yield client
    client.close()
    app.dependency_overrides.clear()
    asyncio.run(engine.dispose())


@pytest.fixture
def seeded_db_client():
    client, engine = _make_db_client(seed_matches=True)
    yield client
    client.close()
    app.dependency_overrides.clear()
    asyncio.run(engine.dispose())
