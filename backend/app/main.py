import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from typing import List, Optional
from dotenv import load_dotenv
# (Make sure riot_api.py is in backend/app/services/)
# (make sure models.py is in backend/app/database/ )
from app.database.models import Summoners
from app.services.riot_api import get_puuid_by_riot_id



load_dotenv()


# DATABASE & APP SETUP
#(Neo: Database  models are now in a separate file to keep main.py cleaner. See models.py for details and comments on the database structure.)

app = FastAPI(title="Vantage Point Backend")

# Get the URL from the docker-compose environment variable
# points to the db service not localhost hopfully, this should only work inside the container.
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL)

# CORS for frontend
# 3000 = React default, 5173 = Vite default.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# STARTUP

@app.on_event("startup")
async def on_startup():
    # Creates any tables that don't exist yet. Safe to run on every boot
    # It won't touch tables that are already there.
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Tables are ready.")


# ROUTES

@app.get("/")
async def root():
    return {"message": "Vantage Point API running"}


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
    # 1. Get PUUID from Riot Service; Gets name + tag 
    puuid = await get_puuid_by_riot_id(game_name, tag_line)
    if not puuid:
        return {"error": "Could not find player on Riot servers."}

    # 2. Save to Database; should only do so if this player is not in the DB already
    async with AsyncSession(engine) as session:
        statement = select(Summoners).where(Summoners.puuid == puuid)
        result = await session.execute(statement)
        existing_summoner = result.scalar_one_or_none()

        #adding this check just to be safe and security even if no exist is already below it
        if existing_summoner:
            return {"message": "Summoner already in database."}


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
        
        # should not be reached as the check i added earlier should catch this but just in case, 
        return {"message": "Summoner already in database."}
