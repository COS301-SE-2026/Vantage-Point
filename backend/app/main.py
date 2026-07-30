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

# Modular router imports
from app.api.router import (
    admin_routes,
    analytics_router,
    auth_routes,
    profile_routes,
    riot_api_routes,
)
from app.database.models import GameAccounts
from app.database.session import DATABASE_URL, get_session, init_db
from app.services.riot_api import get_puuid_by_riot_id
from app.services.routers import matches, users
from app.api.routes import router as api_router

load_dotenv()
app = FastAPI(title="Vantage Point API")
app.include_router(api_router, prefix="/api/v1")
app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(profile_routes.router, prefix="/api/v1")

# Loguru setup & Uvicorn log interception
logger.remove()  # Clears default loguru handler safely
logger.add(
    sys.stdout,
    enqueue=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
)

logger.add(
    "logs/fastapi_logs",
    level="ERROR",
    rotation="100 MB",
    retention="30 days",
    compression="zip",
    enqueue=True,
    backtrace=True,
    diagnose=True,
)


def get_error_reason(status_code: int) -> str:
    reasons = {
        400: "Bad request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not found",
        405: "Method not allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too many Requests",
        500: "Internal server error",
        502: "Bad gateway",
        503: "Service unavailable",
        504: "Gateway timeout",
    }
    return reasons.get(status_code, "Unknown Error")


class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord):
        level: str | int
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame: FrameType | None = logging.currentframe()
        depth = 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
for name in ("uvicorn", "uvicorn.access", "uvicorn.error", "fastapi"):
    logging.getLogger(name).handlers = [InterceptHandler()]
    logging.getLogger(name).propagate = False


def should_skip_startup_db_init() -> bool:
    if os.getenv("PYTEST_VERSION") or os.getenv("PYTEST_CURRENT_TEST"):
        return True

    database_host = urlparse(DATABASE_URL or "").hostname
    return database_host == "db" and not Path("/.dockerenv").exists()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if should_skip_startup_db_init():
        print("Database initialization skipped: database host is unavailable here")
        yield
        return

    try:
        await asyncio.wait_for(init_db(), timeout=5)
    except TimeoutError:
        print("Database initialization skipped: connection timed out")
    except Exception as exc:
        print(f"Database initialization skipped: {exc}")
    yield


app = FastAPI(
    title="Vantage Point Backend",
    description=(
        "API for authentication, profile management, Riot match data, and spatial "
        "intelligence features."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)

# Router inclusions with prefix
app.include_router(api_router, prefix="/api/v1")


def error_response(status_code: int, detail: Any) -> dict[str, Any]:
    return {
        "status": "error",
        "error_number": status_code,
        "reason": get_error_reason(status_code),
        "detail": detail,
    }


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(exc.status_code, exc.detail),
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=error_response(400, exc.errors()),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error_response(500, "Unexpected server error"),
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
        },
    )


class RootResponse(BaseModel):
    status: str = Field(..., description="Current backend status")
    message: str = Field(..., description="API status message")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Current backend health status")


class TestResponse(BaseModel):
    received: Dict[str, Any]
    message: str


@app.get(
    "/",
    tags=["System"],
    summary="API root",
    description="Returns a simple message confirming that the backend is running.",
)
async def get_root() -> RootResponse:
    return RootResponse(status="success", message="Welcome to Vantage Point API")


@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Reports whether the backend service is healthy.",
)
async def health() -> HealthResponse:
    return HealthResponse(status="Vantage Point Backend running healthy")


@app.post(
    "/api/test",
    tags=["System"],
    summary="Echo test payload",
    description="Accepts any JSON object and echoes it back for quick API testing.",
    response_model=TestResponse,
)
async def test_endpoint(data: Dict[str, Any]):
    print(f"Test endpoint called with data: {data}")
    return TestResponse(received=data, message="Test successful")


@app.post("/summoners/register")
async def register_summoner(
    game_name: str,
    tag_line: str,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, str]:
    # 1. Fetch PUUID from Riot Service
    puuid = await get_puuid_by_riot_id(game_name, tag_line)
    if not puuid:
        return {"error": "Could not find player on Riot servers."}

    # 2. Check for existing account inside session scope
    statement = select(GameAccounts).where(GameAccounts.puuid == puuid)
    result = await session.execute(statement)
    existing_account = result.scalar_one_or_none()

    if existing_account:
        return {"message": "Summoner already in database."}

    new_account = GameAccounts(
        puuid=puuid,
        game="league_of_legends",
        game_name=game_name,
        tag_line=tag_line,
        account_level=1,
    )
    session.add(new_account)
    await session.commit()

    return {
        "message": f"Successfully registered {game_name}#{tag_line}",
        "puuid": puuid,
    }


@app.middleware("http")
async def log_errors_middleware(request: Request, call_next: RequestResponseEndpoint):
    try:
        return await call_next(request)
    except Exception as e:
        logger.bind(url=str(request.url), method=request.method).exception(
            f"Bug detected in {request.method} {request.url.path}"
        )
        raise e
