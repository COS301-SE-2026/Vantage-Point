from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, Relationship, SQLModel, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from typing import List, Optional
from dotenv import load_dotenv
# (Make sure riot_api.py is in backend/app/services/)
from app.services.riot_api import get_puuid_by_riot_id

import os

load_dotenv()


# --- 1. MODEL DEFINITIONS (The DB Schema) ---

class Champions(SQLModel, table=True):
    champion_id: int = Field(primary_key=True)
    name: str
    tags: str
    participants: List["Participants"] = Relationship(back_populates="champion")

class Summoners(SQLModel, table=True):
    puuid: str = Field(primary_key=True)
    game_name: str
    tag_line: str
    summoner_level: int
    participations: List["Participants"] = Relationship(back_populates="summoner")

class Matches(SQLModel, table=True):
    match_id: str = Field(primary_key=True)
    game_version: str
    game_duration: int
    queue_id: int
    participants: List["Participants"] = Relationship(back_populates="match")

class Participants(SQLModel, table=True):
    internal_id: Optional[int] = Field(default=None, primary_key=True)
    match_id: str = Field(foreign_key="matches.match_id")
    puuid: str = Field(foreign_key="summoners.puuid")
    champion_id: int = Field(foreign_key="champions.champion_id")
    win: bool
    kills: int
    deaths: int
    assists: int
    individual_position: str

    match: "Matches" = Relationship(back_populates="participants")
    summoner: "Summoners" = Relationship(back_populates="participations")
    champion: "Champions" = Relationship(back_populates="participants")

# --- 2. DATABASE & APP SETUP ---
#(Neo: added the database setup above and this heading to help separate of below code.)

app = FastAPI(title="Vantage Point Backend")

# Get the URL from the docker-compose environment variable
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    # This automatically creates the tables in Postgres when the container starts
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Database is synced and tables are ready!")

@app.get("/")
async def root():
    return {"message": "Vantage Point API running", "db_status": "Ready"}

@app.get("/health")
async def health():
    return {"status": "Vantage Point Backend running healthy"}

@app.post("/api/test")
async def test_endpoint(data: dict):
    print(f"Test endpoint called with data: {data}")
    return {"received": data, "message": "Test successful"}

# below is not really so self explanatory so i just added comments to the code to explain the steps. 
# let me know if you want me to add more comments or if you have any questions about the code!
#Neo
@app.post("/summoners/register")
async def register_summoner(game_name: str, tag_line: str):
    # 1. Get PUUID from Riot Service
    puuid = await get_puuid_by_riot_id(game_name, tag_line)
    if not puuid:
        return {"error": "Could not find player on Riot servers."}

    # 2. Save to Database
    async with AsyncSession(engine) as session:
        statement = select(Summoners).where(Summoners.puuid == puuid)
        result = await session.execute(statement)
        existing_summoner = result.scalar_one_or_none()

        if not existing_summoner:
            new_summoner = Summoners(
                puuid=puuid,
                game_name=game_name,
                tag_line=tag_line,
                summoner_level=0 
            )
            session.add(new_summoner)
            await session.commit()
            return {"message": f"Successfully registered {game_name}#{tag_line}", "puuid": puuid}
        
        return {"message": "Summoner already in database."}
