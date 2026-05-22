from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.tests.constants import TEST_USER_PASSWORD
from app.tests.postgres_fixtures import requires_postgres


def _register_payload(email: str):
    return {
        "email": email,
        "display_name": "Test Player",
        "password": TEST_USER_PASSWORD,
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
        json={"email": email, "password": TEST_USER_PASSWORD},
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
