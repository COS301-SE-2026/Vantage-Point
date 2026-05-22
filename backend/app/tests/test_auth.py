import os
import socket
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-pytest-only")

from app.database.session import get_session  # noqa: E402
from app.main import app  # noqa: E402


def _postgres_available() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", 5432), timeout=0.5):
            return True
    except OSError:
        return False


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://riot_user:riot_password@localhost:5432/riot_db",
)
requires_postgres = pytest.mark.skipif(
    not _postgres_available(),
    reason="PostgreSQL is not available on localhost:5432",
)


@pytest.fixture
def db_client():
    import asyncio

    engine = create_async_engine(DATABASE_URL, poolclass=NullPool)

    async def _setup():
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.drop_all)
            await conn.run_sync(SQLModel.metadata.create_all)

    asyncio.run(_setup())

    async def override_get_session():
        async with AsyncSession(engine) as session:
            yield session

    app.router.on_startup.clear()

    app.dependency_overrides[get_session] = override_get_session
    test_client = TestClient(app)
    yield test_client
    test_client.close()
    app.dependency_overrides.clear()
    asyncio.run(engine.dispose())


def _register_payload(email: str):
    return {
        "email": email,
        "display_name": "Test Player",
        "password": "password123",
    }


@requires_postgres
def test_register_login_and_me(db_client: TestClient):
    client = db_client
    email = "auth_test@vantagepoint.dev"
    reg = client.post("/api/v1/auth/register", json=_register_payload(email))
    assert reg.status_code == 200
    tokens = reg.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    me = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == email
    assert body["display_name"] == "Test Player"
    assert body["has_linked_riot"] is False

    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    assert login.status_code == 200


@requires_postgres
def test_login_wrong_password(db_client: TestClient):
    client = db_client
    email = "wrong_pass@vantagepoint.dev"
    client.post("/api/v1/auth/register", json=_register_payload(email))
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "wrong-password"},
    )
    assert login.status_code == 401


def test_me_without_token(client: TestClient):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


@requires_postgres
@patch("app.services.user_accounts.get_puuid_by_riot_id", new_callable=AsyncMock)
def test_link_game_account(mock_puuid, db_client: TestClient):
    client = db_client
    mock_puuid.return_value = "test-puuid-auth-flow"
    email = "link_riot@vantagepoint.dev"
    reg = client.post("/api/v1/auth/register", json=_register_payload(email))
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    link = client.post(
        "/api/v1/users/me/game-accounts",
        json={"riot_id": "TestPlayer#EUW"},
        headers=headers,
    )
    assert link.status_code == 200
    assert link.json()["riot_id_tag"] == "TestPlayer#EUW"

    me = client.get("/api/v1/users/me", headers=headers)
    assert me.json()["has_linked_riot"] is True
    assert me.json()["riot_id_tag"] == "TestPlayer#EUW"
