"""Transform tests for the Riot -> local match import.

The network side needs a live Riot key, so these cover the part that has to be right
for the dashboard to render: that a Match-V5 payload becomes exactly the `detail_json`
shape `app.services.match_detail` reads back.
"""

from typing import Any

from app.services.match_ingest import (
    _achievement_counts,
    _efficiency_score,
    _game_duration_seconds,
    build_detail_payload,
)

VIEWER_PUUID = "viewer-puuid"


def _participant(
    puuid: str,
    team_id: int,
    *,
    champion_id: int = 222,
    champion_name: str = "Jinx",
    position: str = "BOTTOM",
    win: bool = True,
    vision: int = 22,
    damage: int = 16_000,
    challenges: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "puuid": puuid,
        "riotIdGameName": "Player",
        "riotIdTagline": "EUW",
        "championId": champion_id,
        "championName": champion_name,
        "teamPosition": position,
        "teamId": team_id,
        "win": win,
        "kills": 8,
        "deaths": 3,
        "assists": 6,
        "totalMinionsKilled": 150,
        "neutralMinionsKilled": 15,
        "goldEarned": 12_000,
        "totalDamageDealtToChampions": damage,
        "visionScore": vision,
        "item0": 3031,
        "item1": 3006,
        "item2": 0,
        "item3": 0,
        "item4": 0,
        "item5": 0,
        "item6": 3363,
        "summoner1Id": 4,
        "summoner2Id": 14,
        "tripleKills": 1,
        "firstBloodKill": True,
        "challenges": challenges
        or {
            "killParticipation": 0.75,
            "killingSprees": 2,
            "turretTakedowns": 3,
        },
    }


def _match(**info_overrides: Any) -> dict[str, Any]:
    info: dict[str, Any] = {
        "gameCreation": 1_745_107_200_000,
        "gameDuration": 1_800,
        "gameEndTimestamp": 1_745_109_000_000,
        "gameVersion": "14.24.1.1234",
        "queueId": 420,
        "mapId": 11,
        "participants": [
            _participant(VIEWER_PUUID, 100),
            _participant(
                "ally-1",
                100,
                champion_id=103,
                champion_name="Ahri",
                position="MIDDLE",
                vision=30,
                damage=20_000,
            ),
            _participant("enemy-1", 200, win=False),
        ],
        "teams": [
            {
                "teamId": 100,
                "win": True,
                "bans": [{"championId": 51, "pickTurn": 1}, {"championId": -1}],
                "objectives": {
                    "baron": {"kills": 1},
                    "dragon": {"kills": 3},
                    "riftHerald": {"kills": 1},
                    "tower": {"kills": 9},
                    "inhibitor": {"kills": 2},
                },
            },
            {
                "teamId": 200,
                "win": False,
                "bans": [],
                "objectives": {"tower": {"kills": 4}},
            },
        ],
    }
    info.update(info_overrides)
    return {"metadata": {"matchId": "EUW1_1234567890"}, "info": info}


def test_detail_payload_splits_participants_by_team():
    payload = build_detail_payload(_match(), VIEWER_PUUID)

    assert payload["match_id"] == "EUW1_1234567890"
    assert [team["team_id"] for team in payload["teams"]] == [100, 200]
    assert len(payload["teams"][0]["participants"]) == 2
    assert len(payload["teams"][1]["participants"]) == 1


def test_detail_payload_marks_only_the_viewer():
    payload = build_detail_payload(_match(), VIEWER_PUUID)
    flagged = [
        p["puuid"]
        for team in payload["teams"]
        for p in team["participants"]
        if p["is_viewer"]
    ]
    assert flagged == [VIEWER_PUUID]


def test_detail_payload_participant_fields_match_the_read_side():
    payload = build_detail_payload(_match(), VIEWER_PUUID)
    viewer = payload["teams"][0]["participants"][0]

    # These are exactly the keys ParticipantDetailResponse is built from.
    assert viewer["champion_name"] == "Jinx"
    assert viewer["position"] == "BOTTOM"
    assert viewer["riot_id"] == "Player#EUW"
    assert viewer["cs"] == 165  # lane minions + jungle camps
    assert viewer["items"] == [3031, 3006, 0, 0, 0, 0, 3363]
    assert viewer["summoner_spells"] == [4, 14]
    assert viewer["vision_score"] == 22


def test_detail_payload_objectives_and_bans():
    payload = build_detail_payload(_match(), VIEWER_PUUID)
    blue, red = payload["teams"]

    assert blue["objectives"] == {
        "baron": 1,
        "dragon": 3,
        "rift_herald": 1,
        "tower": 9,
        "inhibitor": 2,
    }
    # -1 is Riot's "no ban was used" sentinel and must not reach the scoreboard.
    assert blue["bans"] == [51]
    assert red["objectives"]["tower"] == 4
    assert red["objectives"]["baron"] == 0


def test_game_duration_handles_both_riot_units():
    assert _game_duration_seconds({"gameDuration": 1800, "gameEndTimestamp": 1}) == 1800
    # Pre-11.20 matches report milliseconds and carry no gameEndTimestamp.
    assert _game_duration_seconds({"gameDuration": 1_800_000}) == 1800


def test_achievement_counts_read_the_challenges_block():
    counts = _achievement_counts([_match(), _match()], VIEWER_PUUID)

    assert counts["triple-kill"] == 2
    assert counts["first-blood"] == 2
    assert counts["killing-spree"] == 4
    assert counts["turrets"] == 6
    assert counts["high-kp"] == 2  # 0.75 clears the 0.7 threshold
    # The ally out-visions and out-damages the viewer in both matches.
    assert counts["vision"] == 0
    assert counts["damage"] == 0


def test_achievement_counts_credit_the_team_leader():
    match = _match()
    match["info"]["participants"][1]["visionScore"] = 5
    match["info"]["participants"][1]["totalDamageDealtToChampions"] = 100

    counts = _achievement_counts([match], VIEWER_PUUID)
    assert counts["vision"] == 1
    assert counts["damage"] == 1


def test_efficiency_score_is_monotonic_in_each_input():
    baseline = _efficiency_score(3.8, 60.0, 7.0)
    assert _efficiency_score(4.8, 60.0, 7.0) > baseline
    assert _efficiency_score(3.8, 80.0, 7.0) > baseline
    assert _efficiency_score(3.8, 60.0, 9.0) > baseline
