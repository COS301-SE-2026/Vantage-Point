from typing import cast, Any
import pytest
from io import BytesIO
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.tests.constants import TEST_USER_PASSWORD


def _register_and_token(client: TestClient, email: str) -> str:
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "display_name": "Test Player",
            "password": TEST_USER_PASSWORD,
        },
    )
    assert reg.status_code == 200
    return cast(str, reg.json()["access_token"])


@pytest.mark.requires_postgres
def test_patch_me_updates_display_name(db_client: TestClient):
    client = db_client
    token = _register_and_token(client, "patch_me@vantagepoint.dev")
    headers = {"Authorization": f"Bearer {token}"}

    patch = client.patch(
        "/api/v1/users/me",
        json={"display_name": "Renamed Player"},
        headers=headers,
    )
    assert patch.status_code == 200
    assert patch.json()["display_name"] == "Renamed Player"

    me = client.get("/api/v1/users/me", headers=headers)
    assert me.json()["display_name"] == "Renamed Player"


@pytest.mark.requires_postgres
def test_upload_and_delete_avatar(db_client: TestClient):
    client = db_client
    token = _register_and_token(client, "avatar_me@vantagepoint.dev")
    headers = {"Authorization": f"Bearer {token}"}

    png_bytes = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    )

    files: dict[str, Any]={"file": ("avatar.png", BytesIO(png_bytes), "image/png")}

    upload = client.post(
        "/api/v1/users/me/avatar",
        headers=headers,
        files=files,
    )
    assert upload.status_code == 200
    avatar_url = upload.json()["avatar_url"]
    assert avatar_url.startswith("/uploads/avatars/")

    static = client.get(avatar_url)
    assert static.status_code == 200

    me = client.get("/api/v1/users/me", headers=headers)
    assert me.json()["avatar_url"] == avatar_url

    delete = client.delete("/api/v1/users/me/avatar", headers=headers)
    assert delete.status_code == 204

    me_after = client.get("/api/v1/users/me", headers=headers)
    assert me_after.json()["avatar_url"] is None


@pytest.mark.requires_postgres
@patch(
    "app.services.user_accounts.get_puuid_by_riot_id",
    new_callable=AsyncMock,
)
def test_relink_refreshes_game_account_names(mock_puuid: Any, db_client: TestClient):
    client = db_client
    mock_puuid.return_value = "stable-puuid-relink"
    token = _register_and_token(client, "relink_me@vantagepoint.dev")
    headers = {"Authorization": f"Bearer {token}"}

    link = client.post(
        "/api/v1/users/me/game-accounts",
        json={"riot_id": "OldName#EUW"},
        headers=headers,
    )
    assert link.status_code == 200
    assert link.json()["riot_id_tag"] == "OldName#EUW"

    relink = client.put(
        "/api/v1/users/me/game-accounts",
        json={"riot_id": "NewName#EUW"},
        headers=headers,
    )
    assert relink.status_code == 200
    assert relink.json()["riot_id_tag"] == "NewName#EUW"

    me = client.get("/api/v1/users/me", headers=headers)
    assert me.json()["riot_id_tag"] == "NewName#EUW"

    profile = client.get("/api/v1/users/me/profile", headers=headers)
    assert profile.status_code == 200
    assert profile.json()["riot_id_tag"] == "NewName#EUW"
