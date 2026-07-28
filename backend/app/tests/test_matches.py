# from typing import cast, Any

# from fastapi.testclient import TestClient

# from app.tests.constants import TEST_USER_PASSWORD
# import pytest


# def _login(client: TestClient, email: str) -> str:
#     response = client.post(
#         "/api/v1/auth/login",
#         json={"email": email, "password": TEST_USER_PASSWORD},
#     )
#     assert response.status_code == 200
#     return cast(str, response.json()["access_token"])


# @pytest.mark.requires_postgres
# def test_match_list_detail_and_profile(seeded_db_client: TestClient):
#     client = seeded_db_client
#     email = "match_test@vantagepoint.dev"
#     token = _login(client, email)
#     headers = {"Authorization": f"Bearer {token}"}

#     history = client.get("/api/v1/matches", headers=headers)
#     assert history.status_code == 200
#     items = history.json()
#     assert len(items) == 8
#     match_8 = next(i for i in items if i["match_id"] == "EUW1_700000008")
#     assert match_8["champion_name"] == "Thresh"

#     def viewer_from_detail(body: dict[str, Any]) -> dict[str, Any]:
#         for team in body["teams"]:
#             for participant in team["participants"]:
#                 if participant["is_viewer"]:
#                     return cast(dict[str, Any], participant)
#         raise AssertionError("viewer not found in match detail")

#     match_1_list = next(i for i in items if i["match_id"] == "EUW1_700000001")
#     detail_1 = client.get("/api/v1/matches/EUW1_700000001", headers=headers)
#     assert detail_1.status_code == 200
#     detail_1_body = detail_1.json()
#     red_team = next(t for t in detail_1_body["teams"] if t["team_id"] == 200)
#     assert len(red_team["bans"]) == 5
#     lee_sin_ban = next(b for b in red_team["bans"] if b["champion_id"] == 64)
#     assert lee_sin_ban["champion_name"] == "Lee Sin"
#     viewer_1 = viewer_from_detail(detail_1_body)
#     assert viewer_1["champion_id"] == 222
#     assert viewer_1["kills"] == match_1_list["kills"]
#     assert viewer_1["deaths"] == match_1_list["deaths"]
#     assert viewer_1["assists"] == match_1_list["assists"]
#     assert viewer_1["win"] is False

#     match_5_list = next(i for i in items if i["match_id"] == "EUW1_700000005")
#     detail_5 = client.get("/api/v1/matches/EUW1_700000005", headers=headers)
#     assert detail_5.status_code == 200
#     viewer_5 = viewer_from_detail(detail_5.json())
#     assert viewer_5["champion_id"] == 51
#     assert viewer_5["kills"] == 11
#     assert viewer_5["deaths"] == 2
#     assert viewer_5["assists"] == 5
#     assert viewer_5["win"] is True
#     assert match_5_list["outcome"] == "Victory"

#     detail_6_response = client.get(
#         "/api/v1/matches/EUW1_700000006", headers=headers
#     ).json()
#     assert detail_6_response.status_code == 200
#     detail_6 = detail_6_response.json()
#     viewer_6 = viewer_from_detail(detail_6)
#     assert viewer_5["gold_earned"] != viewer_6["gold_earned"]

#     profile = client.get("/api/v1/users/me/profile", headers=headers)
#     assert profile.status_code == 200
#     prof = profile.json()
#     assert prof["matches_sampled"] == 20
#     assert len(prof["achievements"]) == 7
#     assert prof["achievements"][0]["id"] == "damage"
#     assert len(prof["featured_games"]) == 2
#     assert prof["featured_games"][0]["efficiency_score"] == 115
#     assert prof["featured_games"][0]["win_rate_label"] == "65% (13W / 7L)"
#     assert len(prof["radar_metrics"]) == 6
#     assert len(prof["recent_champions"]) >= 1

#     missing = client.get("/api/v1/matches/EUW1_nonexistent", headers=headers)
#     assert missing.status_code == 404


# @pytest.mark.requires_postgres
# def test_matches_empty_without_linked_account(db_client: TestClient):
#     client = db_client
#     email = "nolink@vantagepoint.dev"
#     reg = client.post(
#         "/api/v1/auth/register",
#         json={
#             "email": email,
#             "display_name": "No Link",
#             "password": TEST_USER_PASSWORD,
#         },
#     )
#     assert reg.status_code == 200
#     token = reg.json()["access_token"]
#     headers = {"Authorization": f"Bearer {token}"}

#     history = client.get("/api/v1/matches", headers=headers)
#     assert history.status_code == 200
#     assert history.json() == []
