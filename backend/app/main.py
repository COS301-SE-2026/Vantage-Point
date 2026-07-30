import asyncio
import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from types import FrameType
from typing import Annotated, Any, Dict
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import RequestResponseEndpoint

from app.api.router import (
    auth_routes,
    profile_routes,
)
from app.database.models import GameAccounts
from app.database.session import DATABASE_URL, get_session, init_db
from app.services.riot_api import get_puuid_by_riot_id
from app.api.routes import router as api_router

load_dotenv()

API_V1_STR = "/api/v1"

@asynccontextmanager
async def lifespan(app: FastAPI):
    def should_skip_startup_db_init() -> bool:
        if os.getenv("PYTEST_VERSION") or os.getenv("PYTEST_CURRENT_TEST"):
            return True
        database_host = urlparse(DATABASE_URL or "").hostname
        return database_host == "db" and not Path("/.dockerenv").exists()

    if should_skip_startup_db_init():
        print("Database initialization skipped")
        yield
        return

    try:
        await asyncio.wait_for(init_db(), timeout=5)
    except Exception as exc:
        print(f"Database initialization skipped: {exc}")
    yield

app = FastAPI(
    title="Vantage Point Backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)

# Include routes once with the correct prefix
app.include_router(api_router, prefix=API_V1_STR)

@app.get("/")
async def get_root():
    return {"status": "success", "message": "Welcome to Vantage Point API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.middleware("http")
async def log_errors_middleware(request: Request, call_next: RequestResponseEndpoint):
    try:
        return await call_next(request)
    except Exception as e:
        logger.bind(url=str(request.url), method=request.method).exception(
            f"Bug detected in {request.method} {request.url.path}"
        )
        raise e
