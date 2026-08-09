import os
from collections.abc import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

Base = SQLModel

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable must be set (see backend/.env.example)"
    )

engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


# create_all only ever creates missing *tables*, so columns added to an existing
# model need a nudge. Keeping these here means a dev database that predates the
# column survives a restart without a full drop-and-reseed.
ADDITIVE_MIGRATIONS: tuple[str, ...] = (
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR",
    "ALTER TABLE game_accounts ADD COLUMN IF NOT EXISTS profile_matches_sampled INTEGER",
    "ALTER TABLE matches ADD COLUMN IF NOT EXISTS deletion_status VARCHAR NOT NULL DEFAULT 'active'",
    "ALTER TABLE matches ADD COLUMN IF NOT EXISTS deletion_flagged_at TIMESTAMP",
    "ALTER TABLE champions ADD COLUMN IF NOT EXISTS image_path VARCHAR",

    # Seed map_assets (it's now the FK target for Matches/MatchTimelines.map_id)
    # before adding the constraints below: this runs top to bottom in one transaction.
    "INSERT INTO map_assets (map_id, name) VALUES (11, 'Summoner''s Rift') ON CONFLICT (map_id) DO NOTHING",
    "INSERT INTO map_assets (map_id, name) VALUES (12, 'Howling Abyss') ON CONFLICT (map_id) DO NOTHING",
    # Postgres has no "ADD CONSTRAINT IF NOT EXISTS", so will manually guard
    # these migrations re-run on every startup.
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_matches_map_id' AND table_name = 'matches'
        ) THEN
            ALTER TABLE matches ADD CONSTRAINT fk_matches_map_id
                FOREIGN KEY (map_id) REFERENCES map_assets(map_id);
        END IF;
    END $$;
    """,
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_match_timelines_map_id' AND table_name = 'match_timelines'
        ) THEN
            ALTER TABLE match_timelines ADD CONSTRAINT fk_match_timelines_map_id
                FOREIGN KEY (map_id) REFERENCES map_assets(map_id);
        END IF;
    END $$;
    """,
)


async def init_db() -> None:
    from app.database import models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        if engine.dialect.name == "postgresql":
            for statement in ADDITIVE_MIGRATIONS:
                await conn.execute(text(statement))


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
