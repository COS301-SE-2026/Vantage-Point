from app.database.models import ErrorLog
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import Any
from sqlmodel import select
from app.Models.error_log_models import GetErrorLogLists

class ErrorLOg():
    
    @staticmethod
    async def get_errors_for_dashboard(session: AsyncSession, severity: str|None, service: str|None, reviewed: bool|None,limit:int=30, offset:int=0)->Any:
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
                GetErrorLogLists(
                    id=e.id,
                    error_code=e.error_code,
                    service=e.service,
                    severity=e.severity,
                    message=e.message,
                    occuret_at=e.occuret_at,
                    reviewed=e.reviewed,
                )
                for e in logs
            ]
        except HTTPException:
            raise HTTPException(status_code=500, detail="Internal server error")


        
