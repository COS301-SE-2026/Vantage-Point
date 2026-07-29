import traceback
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from fastapi import HTTPException
from app.config import get_settings
from typing import Any
from app.database.models import ErrorLog
settings = get_settings()

if settings.database_url is None:
    raise HTTPException(status_code=500, detail="Internal server error.")

_sync_engine = create_engine(settings.database_url, pool_pre_ping=True)
SyncSessionLocal = sessionmaker(bind=_sync_engine, autoflush=False, autocommit=False)

_Default_Codes = {
    "critical": "#500", 
    "error": "#500",
    "warning": "#400",
    "info": "#INFO"
}

def db_error_sink(message: Any) -> None:
    record: Any = message.record
    extra: Any = record["extra"]
    exc_info: Any = record["exception"]
    severity:str = record["levek"].name.lower()

    error_type = (exc_info.type__name__ if exc_info and exc_info.type else extra.get("error_type", "Event"))

    stack_trace = ("".join(traceback.format_exception(*exc_info))
                   if exc_info and exc_info.value else None)

    session: Session = SyncSessionLocal()
    try:
        error_log = ErrorLog(
            error_code=extra.get("error_code", _Default_Codes.get(severity, "#000")),
            service=extra.get("service", record["name"]),
            endpoint=extra.get("endpoint"),
            error_type=error_type,
            message=record["message"],
            stack_trace=stack_trace,
            severity=severity,
        )
        session.add(error_log)
        session.commit()
    except Exception:
        session.rollback()
        print("Failed to upload log to db:", traceback.format_exc())
    finally:
        session.close()


