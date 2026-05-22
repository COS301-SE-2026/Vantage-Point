from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.middleware import ProcessTimeMiddleware
from app.database.session import init_db
from app.routers import auth, matches, users
from app.schemas.generic_schemas import get_error_reason
from app.services.avatar_storage import UPLOADS_DIR, ensure_avatar_dir

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_avatar_dir()
    try:
        await init_db()
        print("Tables are ready.")
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

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)
app.add_middleware(ProcessTimeMiddleware)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(matches.router)


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
    )


@app.get("/")
async def root():
    return {"message": "Vantage Point API running"}


@app.get("/health")
async def health():
    return {"status": "Vantage Point Backend running healthy"}


@app.post("/api/test")
async def test_endpoint(data: dict):
    print(f"Test endpoint called with data: {data}")
    return {"received": data, "message": "Test successful"}
