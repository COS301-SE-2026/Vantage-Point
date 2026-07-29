from app.database.models import ErrorLog
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import Any
from sqlmodel import select

class ErrorLOg():
    
    @staticmethod
    async def get_errors_for_dashboard(session: AsyncSession, severity: str|None, service: str|None, reviewed: bool|None, session:AsyncSession,limit:int=30, offset:int=0)->None:
        try:
            statement:Any = select(ErrorLog)

            if severity:
                statement= statement.where(ErrorLog.severity==severity)
            if service:
                statement= statement.where(ErrorLog.service==service)
            if reviewed is not None:
                statement = statement.where(ErrorLog.reviewed==reviewed)
            statement = statement.limit(limit).offset(statement)

            result: Any = await session.execute(statement)
            logs = result.scalars().all()
            return [
                {

                }
                for e in logs
            ]
            
