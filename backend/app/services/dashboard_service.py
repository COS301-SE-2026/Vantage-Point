from app.config import get_settings
from app.database.models import Users, Matches
from typing import Any
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from fastapi import HTTPException
class DashBoardService:
    """
    This is the class where you will get all dashboard related data. Service to extract the required data.
    """
    #might be paired with get user of admin, but I'll hvae to wait and see if that will hold truth
    @staticmethod
    async def get_user_status()-> None:
        #start to implement need more detail before I can complete.

    @staticmethod
    async def get_total_matches(session: AsyncSession) -> Any:
        try: 
            statement = select(Matches)#select all matches, don't know yet if only want a single value or not 
            result: Any = await session.execute(statement)
            matches = result.scalars().all()

            return matches
 
        except HTTPException as e:
            raise HTTPException(status_code=500, detail=f"Could not retrieve matches. Internal server error {str(e)}")

    #get db table usage, will have to wait for neo to respond before seeing fully what he want for now this should suffice
    @staticmethod
    async def get_table_storage(session: AsyncSession, table_name: str = "mathces") -> int:
        statement: Any = (
            text("Select pg_total_relation_size(:table)"),
            {"table": table_name}
        )
        result: Any = await session.execute(statement)
        return result.scalar_one()