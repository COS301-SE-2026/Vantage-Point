import asyncio
import os
from socket import socket
import pytest
from sqlmodel import (
    SQLModel,
    select,
)  # removed create_engine and Session because we are using the async versions now
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# Models now live in database/models.py — import from there, not from main.
from app.database.models import (
    Champions,
    GameAccounts,
    # Below are not yet used in this test but will be needed for future tests as we add more complex relationships and logic.
    # Matches,
    # Participants,
    # UserGameAccounts,
    # Users,
)

# TODO: add more models to this import as we add them to the database. We will need them for testing relationships and constraints.


def get_database_url():
    """Return DATABASE_URL that works both inside container and on host."""
    original = os.getenv("DATABASE_URL")
    if original:
        return original

    # Default: try to connect to 'db' (Docker), fallback to localhost
    try:
        socket.gethostbyname("db")
        host = "db"
    except socket.gaierror:
        host = "localhost"

    user = os.getenv("POSTGRES_USER", "riot_user")
    password = os.getenv("POSTGRES_PASSWORD", "")
    db = os.getenv("POSTGRES_DB", "riot_db")
    return f"postgresql+asyncpg://{user}:{password}@{host}:5432/{db}"


<<<<<<< HEAD
# Setup Connection
# DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://riot_user:riot_password@localhost:5432/riot_db",
)
# engine = create_async_engine(DATABASE_URL, echo=True)  # echo=True shows the raw SQL
=======
DATABASE_URL = os.getenv("DATABASE_URL") or get_database_url()
engine = create_async_engine(DATABASE_URL, echo=True)  # echo=True shows the raw SQL
>>>>>>> 4c1b02f3e7028644b29977fac2646e523176d011


@pytest.fixture
async def engine():
    """Create async engine fixture for database tests.

    echo=True shows the raw SQL for debugging.
    Only creates engine when test runs, not at import time.
    """
    _engine = create_async_engine(DATABASE_URL, echo=True)
    yield _engine
    await _engine.dispose()


# @pytest.mark.skip(reason="Database not available")
@pytest.mark.integration
@pytest.mark.asyncio
async def test_database_logic(engine):
    """Test database connection and basic CRUD operations.

    This is such basic testing and needs to be updated once we have more refined database logic and models,
    but it verifies that we can connect to the DB and perform basic operations.
    """
    print("Starting Database Lab (lets hope this works)")

    async with engine.begin() as conn:
        # This wipes the DB can test the creation logic
        print("Emptying Database...")
        await conn.run_sync(SQLModel.metadata.drop_all)
        print("Creating Tables...")
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:
        # Inserts a Mock Data
        print("Inserting Mock Data...")
        # Jhin's actual Riot champion_id is 202 — using a real value here
        # means this mock data would be valid if imported alongside real API data.
        # @NeoMachabaUP : There is no Jhin that we know of
        test_champ = Champions(champion_id=202, name="Jhin", tags="Marksman")
        test_game_account = GameAccounts(
            puuid="test_puuid_123",
            game="league_of_legends",
            game_name="TheFast",
            tag_line="4444",
            account_level=30,
        )

        session.add(test_champ)
        session.add(test_game_account)
        await session.commit()

        # Tests Retrieval
        print("Testing Retrieval...")
        statement = select(GameAccounts).where(GameAccounts.game_name == "TheFast")
        result = await session.execute(statement)
        game_account = result.scalar_one()

        print(
            f"Found Game Account: {game_account.game_name}#{game_account.tag_line} (PUUID: {game_account.puuid})"
        )

        # Verify the data was retrieved correctly
        assert game_account.game_name == "TheFast"
        assert game_account.puuid == "test_puuid_123"

        print("--- Test complete ---")
        # TODO: add FK constraint tests (Participants referencing Matches/Summoners/Champions)
        # once the match history fetching logic is in place.


if __name__ == "__main__":
    asyncio.run(test_database_logic())

# This is such basic testing and needs to be updated once we have more refinded database logic and models,
# but I just wanted to get something in here to test the connection and make sure we can write to the DB.
