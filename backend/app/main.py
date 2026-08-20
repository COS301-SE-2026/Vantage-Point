import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict
from urllib.parse import urlparse
from types import FrameType
from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from starlette.exceptions import HTTPException as StarletteHTTPException
from dotenv import load_dotenv

from app.api.router import (
    admin_routes,
    profile_routes,
    auth_routes,
    analytics_router,
    riot_api_routes,
    dashboard_routes,
)
from app.routers import matches, users
from app.Models.auth_model import User
from app.api.auth import require_group
from app.database.models import GameAccounts
from app.database.session import DATABASE_URL, get_session, init_db
from app.services.avatar_storage import UPLOADS_DIR, ensure_avatar_dir
from app.services.riot_api import get_puuid_by_riot_id

from loguru import logger
import logging
from starlette.middleware.base import RequestResponseEndpoint

# from typing import List, Optional
# above commit commited out as import not used but will be used later

# (Make sure riot_api.py is in backend/app/services/)
# (make sure models.py is in backend/app/database/ )

load_dotenv()

# DATABASE & APP SETUP
# (Neo: Database  models are now in a separate file to keep main.py cleaner. See models.py for details and comments on the database structure.)


logger.remove()

logger.add(
    sink=lambda message: print(message, end=""),
    level="INFO",
    enqueue=True,
    backtrace=True,
    diagnose=False,
)

# only to be used in development. Remove when going to production. Writing to a txt is unsafe behaviour
# and can expose sensitive information
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

# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]
# app.add_middleware(SlowAPIMiddleware)


# Registered BEFORE the CORS middleware on purpose, and the order is load-bearing.
# `add_middleware` inserts at the front of the stack, so whatever is added last ends up
# outermost — this has to be added first to sit *inside* CORS.
#
# Why it exists at all: an unhandled exception would otherwise be caught by Starlette's
# ServerErrorMiddleware, which wraps the whole stack including CORS. Its 500 never passes
# back through the CORS layer, so it carries no Access-Control-Allow-Origin header, and a
# browser reports "CORS header missing" instead of the error that actually occurred. The
# same goes for the `@app.exception_handler(Exception)` below, which is installed *as*
# that outermost handler. Turning the exception into a response here, inside CORS, means
# the client sees a real 500 with a readable body and the true cause is one log away.
@app.middleware("http")
async def log_errors_middleware(request: Request, call_next: RequestResponseEndpoint):
    try:
        return await call_next(request)
    except Exception:
        logger.bind(url=str(request.url), method=request.method).exception(
            f"Bug detected in {request.method}{request.url.path}"
        )
        # The detail stays generic: the traceback above is for us, not for the caller.
        return JSONResponse(
            status_code=500,
            content=error_response(500, "Unexpected server error"),
        )


# CORS for frontend
# 3000 = React default, 5173 = Vite default.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)


# app.include_router(router, prefix="/api")
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(admin_routes.router)
app.include_router(analytics_router.router)
app.include_router(riot_api_routes.router)
app.include_router(matches.router)
app.include_router(dashboard_routes.router)
# This router declares only "/users"; the frontend calls the versioned path.
app.include_router(users.router, prefix="/api/v1")

# Avatar uploads are written to backend/uploads/avatars and referenced by the profile as
# "/uploads/avatars/<sub>.png", so that directory has to be reachable over HTTP.
ensure_avatar_dir()
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


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


# A backstop only. `log_errors_middleware` turns almost everything into a response before
# it reaches here; this catches the rest — anything raised outside the middleware stack.
# Starlette installs it on ServerErrorMiddleware, above CORS, so a response it produces
# reaches the browser without CORS headers.
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content=error_response(500, "Unexpected server error"),
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
    # Explicitly call your schema class
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


# below is not really so self explanatory so i just added comments to the code to explain the steps.
# let me know if you want me to add more comments or if you have any questions about the code!
# Neo
@app.post("/summoners/register")
async def register_summoner(
    game_name: str,
    tag_line: str,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(require_group(20))],
) -> dict[str, str]:
    # 1. Get PUUID from Riot Service; Gets name + tag
    puuid = await get_puuid_by_riot_id(
        game_name, tag_line, session=session, cognito_sub=current_user.sub
    )
    if not puuid:
        return {"error": "Could not find player on Riot servers."}

    # 2. Save to Database; should only do so if this player is not in the DB already
    statement = select(GameAccounts).where(GameAccounts.puuid == puuid)
    result = await session.execute(statement)
    existing_account = result.scalar_one_or_none()

    # adding this check just to be safe and security even if no exist is already below it
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

