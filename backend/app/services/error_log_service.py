from app.database.models import ErrorLog
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import Any
from sqlmodel import select
from app.Models.error_log_models import GetErrorLogLists, ToggleReview
from datetime import datetime

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
            statement = statement.limit(limit).offset(offset)

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


    @staticmethod
    async def toggle_reviewd(error_id:int, session: AsyncSession, cognito_sub: str):
        try:
            statement: Any = select(ErrorLog).where(ErrorLog.id == error_id)
            result: Any = await session.execute(statement)
            error_log: ErrorLog | None = result.scalar_one_or_none()

            if error_log is None:
                raise HTTPException(status_code=400, detail="Invalid error id given")

            #allows to use to toggle both to true and false without having to specify it.
            reviewed = not error_log.reviewed
            error_log.reviewed= reviewed
            error_log.reviewed_by = cognito_sub
            error_log.reviewed_at = datetime.now()
            await session.commit()

            return ToggleReview(
                id=error_id, reviewed=reviewed
            )
        except HTTPException:
            raise HTTPException(status_code=500, detail="Internal server error")

    @staticmethod
    async def get_error_log(session: AsyncSession, error_id: int) -> Any:
        try:
            statement: Any = select(ErrorLog).where(ErrorLog.id == error_id)
            result: Any = await session.execute(statement)
            error_log: ErrorLog | None = result.scalar_one_or_none()

            if error_log is None:
                raise HTTPException(status_code=404, detail="Not found")
            
            return ErrorLog(
                id=error_log.id,
                occured_at=error_log.occured_at,
                error_code=error_log.error_code,
                service=error_log.service,
                endpoint=error_log.endpoint,
                error_type=error_log.error_type,
                message=error_log.message,
                stack_trace=error_log.stack_trace,
                severity=error_log.severity,
                reviewed_at=error_log.reviewed_at,
                reviewed=error_log.reviewed,
                reviewed_by=error_log.reviewed_by
            )

        except HTTPException:
            raise HTTPException(status_code=500, detail="Internal server error")