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
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS platform_id VARCHAR",
    "ALTER TABLE game_accounts ADD COLUMN IF NOT EXISTS profile_matches_sampled INTEGER",
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
