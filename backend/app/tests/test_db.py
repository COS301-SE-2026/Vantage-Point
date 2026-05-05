import asyncio
import os
from sqlmodel import SQLModel, create_engine, Session, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from main import Summoners, Champions, Participants, Matches  # Import models

#Setup Connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=True) # echo=True shows the raw SQL

async def test_database_logic():
    print("Starting Database Lab (lets hope this works)")

    async with engine.begin() as conn:
        #This wipes the DB can test the creation logic
        print("Emptying Database...")
        await conn.run_sync(SQLModel.metadata.drop_all)
        print("Creating Tables...")
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:
        #Inserts a Mock Data
        print("Inserting Mock Data...")
        test_champ = Champions(champion_id=202, name="Jhin", tags="Marksman")
        test_summoner = Summoners(
            puuid="test_puuid_123", 
            game_name="TheFast", 
            tag_line="4444", 
            summoner_level=100
        )
        
        session.add(test_champ)
        session.add(test_summoner)
        await session.commit()

        #Tests Retrieval
        print("Testing Retrieval...")
        statement = select(Summoners).where(Summoners.game_name == "TheFast")
        result = await session.execute(statement)
        summoner = result.scalar_one()
        
        print(f"Found Summoner: {summoner.game_name}#{summoner.tag_line} (PUUID: {summoner.puuid})")

if __name__ == "__main__":
    asyncio.run(test_database_logic())

# This is such basic testing and needs to be updated once we have more refinded database logic and models, 
# but I just wanted to get something in here to test the connection and make sure we can write to the DB.