import traceback
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from fastapi import HTTPException
from app.config import get_settings

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




