import os
import socket

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-pytest-only")

from app.database.session import get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.tests.seed_fixtures import seed_test_user_with_matches  # noqa: E402


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


def _make_client(*, seed_matches: bool) -> tuple[TestClient, object]:
    import asyncio

    engine = create_async_engine(DATABASE_URL, poolclass=NullPool)

    async def _setup():
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.drop_all)
            await conn.run_sync(SQLModel.metadata.create_all)
        if seed_matches:
            async with AsyncSession(engine) as session:
                await seed_test_user_with_matches(session)

    asyncio.run(_setup())

    async def override_get_session():
        async with AsyncSession(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session
    return TestClient(app), engine


@pytest.fixture
def db_client():
    client, engine = _make_client(seed_matches=False)
    yield client
    client.close()
    app.dependency_overrides.clear()

    import asyncio

    asyncio.run(engine.dispose())


@pytest.fixture
def seeded_db_client():
    client, engine = _make_client(seed_matches=True)
    yield client
    client.close()
    app.dependency_overrides.clear()

    import asyncio

    asyncio.run(engine.dispose())


def _login(client: TestClient, email: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@requires_postgres
def test_match_list_detail_and_profile(seeded_db_client: TestClient):
    client = seeded_db_client
    email = "match_test@vantagepoint.dev"
    token = _login(client, email)
    headers = {"Authorization": f"Bearer {token}"}

    history = client.get("/api/v1/matches", headers=headers)
    assert history.status_code == 200
    items = history.json()
    assert len(items) == 8
    match_8 = next(i for i in items if i["match_id"] == "EUW1_700000008")
    assert match_8["champion_name"] == "Thresh"

    def viewer_from_detail(body: dict) -> dict:
        for team in body["teams"]:
            for participant in team["participants"]:
                if participant["is_viewer"]:
                    return participant
        raise AssertionError("viewer not found in match detail")

    match_1_list = next(i for i in items if i["match_id"] == "EUW1_700000001")
    detail_1 = client.get("/api/v1/matches/EUW1_700000001", headers=headers)
    assert detail_1.status_code == 200
    detail_1_body = detail_1.json()
    red_team = next(t for t in detail_1_body["teams"] if t["team_id"] == 200)
    assert len(red_team["bans"]) == 5
    lee_sin_ban = next(b for b in red_team["bans"] if b["champion_id"] == 64)
    assert lee_sin_ban["champion_name"] == "Lee Sin"
    viewer_1 = viewer_from_detail(detail_1_body)
    assert viewer_1["champion_id"] == 222
    assert viewer_1["kills"] == match_1_list["kills"]
    assert viewer_1["deaths"] == match_1_list["deaths"]
    assert viewer_1["assists"] == match_1_list["assists"]
    assert viewer_1["win"] is False

    match_5_list = next(i for i in items if i["match_id"] == "EUW1_700000005")
    detail_5 = client.get("/api/v1/matches/EUW1_700000005", headers=headers)
    assert detail_5.status_code == 200
    viewer_5 = viewer_from_detail(detail_5.json())
    assert viewer_5["champion_id"] == 51
    assert viewer_5["kills"] == 11
    assert viewer_5["deaths"] == 2
    assert viewer_5["assists"] == 5
    assert viewer_5["win"] is True
    assert match_5_list["outcome"] == "Victory"

    detail_6 = client.get("/api/v1/matches/EUW1_700000006", headers=headers).json()
    viewer_6 = viewer_from_detail(detail_6)
    assert viewer_5["gold_earned"] != viewer_6["gold_earned"]

    profile = client.get("/api/v1/users/me/profile", headers=headers)
    assert profile.status_code == 200
    prof = profile.json()
    assert prof["matches_sampled"] == 20
    assert len(prof["achievements"]) == 7
    assert prof["achievements"][0]["id"] == "damage"
    assert len(prof["featured_games"]) == 2
    assert prof["featured_games"][0]["efficiency_score"] == 115
    assert prof["featured_games"][0]["win_rate_label"] == "65% (13W / 7L)"
    assert len(prof["radar_metrics"]) == 6
    assert len(prof["recent_champions"]) >= 1

    missing = client.get("/api/v1/matches/EUW1_nonexistent", headers=headers)
    assert missing.status_code == 404


@requires_postgres
def test_matches_empty_without_linked_account(db_client: TestClient):
    client = db_client
    email = "nolink@vantagepoint.dev"
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "display_name": "No Link",
            "password": "password123",
        },
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    history = client.get("/api/v1/matches", headers=headers)
    assert history.status_code == 200
    assert history.json() == []
