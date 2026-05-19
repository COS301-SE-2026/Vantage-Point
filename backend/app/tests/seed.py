import asyncio
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from app.database.models import (
    Champions, Users, GameAccounts, UserGameAccounts, Matches, Participants
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=False)


async def seed():
    print("--- Seeding database with fake data ---")

    async with engine.begin() as conn:
        print("Dropping and recreating tables...")
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:

        # --- Champions ---
        # Using real Riot champion IDs so data stays valid if mixed with real API responses later.
        champions = [
            Champions(champion_id=202, name="Jhin",  tags="Marksman"),
            Champions(champion_id=222, name="Jinx",  tags="Marksman"),
            Champions(champion_id=84,  name="Akali", tags="Assassin"),
            Champions(champion_id=103, name="Ahri",  tags="Mage"),
            Champions(champion_id=157, name="Yasuo", tags="Fighter"),
        ]
        session.add_all(champions)

        # --- Users ---
        # cognito_sub format mirrors what AWS Cognito actually returns (UUID v4).
        users = [
            Users(
                cognito_sub="fake-cognito-sub-0001",
                email="testuser1@vantagepoint.dev",
                created_at=datetime.now(timezone.utc)
            ),
            Users(
                cognito_sub="fake-cognito-sub-0002",
                email="testuser2@vantagepoint.dev",
                created_at=datetime.now(timezone.utc)
            ),
        ]
        session.add_all(users)

        # --- Game Accounts ---
        # PUUIDs are fake but follow the real format length (78 chars) so tests aren't brittle.
        game_accounts = [
            GameAccounts(
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001",
                game="league_of_legends",
                game_name="TheFast",
                tag_line="4444",
                account_level=100
            ),
            GameAccounts(
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002",
                game="league_of_legends",
                game_name="SilverBot",
                tag_line="EUW",
                account_level=42
            ),
        ]
        session.add_all(game_accounts)

        # --- User <-> Game Account links ---
        user_game_accounts = [
            UserGameAccounts(
                cognito_sub="fake-cognito-sub-0001",
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001"
            ),
            UserGameAccounts(
                cognito_sub="fake-cognito-sub-0002",
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002"
            ),
            # User 1 also tracks user 2's account — testing the many-to-many relationship
            UserGameAccounts(
                cognito_sub="fake-cognito-sub-0001",
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002"
            ),
        ]
        session.add_all(user_game_accounts)

        # --- Matches ---
        matches = [
            Matches(
                match_id="EUW1_FAKE001",
                game_version="14.10.123",
                game_duration=1820,  # ~30 minutes
                queue_id=420  # Ranked Solo/Duo
            ),
            Matches(
                match_id="EUW1_FAKE002",
                game_version="14.10.123",
                game_duration=2100,  # ~35 minutes
                queue_id=450  # ARAM
            ),
        ]
        session.add_all(matches)

        # --- Participants ---
        # Each row is one player's stats in one match.
        # FK constraints require match, game_account, and champion to all exist first.
        participants = [
            Participants(
                match_id="EUW1_FAKE001",
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001",
                champion_id=202,  # Jhin
                win=True,
                kills=12,
                deaths=2,
                assists=5,
                individual_position="BOTTOM"
            ),
            Participants(
                match_id="EUW1_FAKE001",
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000002",
                champion_id=84,  # Akali
                win=False,
                kills=4,
                deaths=7,
                assists=3,
                individual_position="MIDDLE"
            ),
            Participants(
                match_id="EUW1_FAKE002",
                puuid="FAKE-PUUID-LOL-00000000000000000000000000000000000000000000000001",
                champion_id=157,  # Yasuo
                win=False,
                kills=6,
                deaths=9,
                assists=4,
                individual_position="MIDDLE"
            ),
        ]
        session.add_all(participants)

        await session.commit()

    print("--- Seed complete ---")
    print("  Champions:        5")
    print("  Users:            2")
    print("  Game accounts:    2")
    print("  User-GA links:    3  (includes one user tracking two accounts)")
    print("  Matches:          2")
    print("  Participants:     3")


if __name__ == "__main__":
    asyncio.run(seed())