"""Minimal DB seed for match endpoint tests."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.passwords import hash_password
from app.tests.constants import TEST_USER_PASSWORD
from app.database.models import (
    Champions,
    GameAccounts,
    Matches,
    Participants,
    UserGameAccounts,
    Users,
)
from app.database.seed_data import (
    PROFILE_MATCHES_SAMPLED,
    SEED_MATCHES,
    SEED_VIEWER_PARTICIPANTS,
    VIEWER_PUUID,
)
from app.database.seed_profile import seed_profile_for_puuid
from app.database.seed_data.matches import (
    GAME_VERSION,
    MAP_ID,
    QUEUE_ID,
    build_detail_json,
    game_creation_for,
)


async def seed_test_user_with_matches(session: AsyncSession) -> tuple[str, str]:
    """Returns (user_id, access_token-ready email). Password: TEST_USER_PASSWORD."""
    user_id = "00000000-0000-4000-8000-000000000099"
    email = "match_test@vantagepoint.dev"

    champion_names = {
        222: "Jinx",
        103: "Ahri",
        86: "Garen",
        64: "Lee Sin",
        51: "Caitlyn",
        122: "Darius",
        134: "Syndra",
        412: "Thresh",
    }
    for cid, name in champion_names.items():
        session.add(Champions(champion_id=cid, name=name, tags="Fighter"))

    session.add(
        Users(
            id=user_id,
            email=email,
            password_hash=hash_password(TEST_USER_PASSWORD),
            display_name="MatchTest",
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
    )
    session.add(
        GameAccounts(
            puuid=VIEWER_PUUID,
            game="league_of_legends",
            game_name="You",
            tag_line="EUW",
            account_level=100,
            profile_matches_sampled=PROFILE_MATCHES_SAMPLED,
        )
    )
    session.add(UserGameAccounts(user_id=user_id, puuid=VIEWER_PUUID))

    for row in SEED_MATCHES:
        session.add(
            Matches(
                match_id=row.match_id,
                game_version=GAME_VERSION,
                game_duration=row.game_duration,
                queue_id=QUEUE_ID,
                game_creation=game_creation_for(row.played_on, row.match_id),
                map_id=MAP_ID,
                played_on=row.played_on,
                detail_json=build_detail_json(row.match_id),
            )
        )

    for vp in SEED_VIEWER_PARTICIPANTS:
        session.add(
            Participants(
                match_id=vp.match_id,
                puuid=VIEWER_PUUID,
                champion_id=vp.champion_id,
                win=vp.win,
                kills=vp.kills,
                deaths=vp.deaths,
                assists=vp.assists,
                individual_position=vp.individual_position,
                team_id=vp.team_id,
                cs=vp.cs,
                gold_earned=vp.gold_earned,
                damage_to_champions=vp.damage_to_champions,
                vision_score=vp.vision_score,
                kill_participation=vp.kill_participation,
                riot_id_display="You#EUW",
            )
        )

    await seed_profile_for_puuid(session, VIEWER_PUUID, set_matches_sampled=False)

    await session.commit()
    return user_id, email
