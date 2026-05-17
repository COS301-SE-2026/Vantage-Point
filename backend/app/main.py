import os
from fastapi import FastAPI
from typing import Any, Dict
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# from typing import List, Optional
# above commit commited out as import not used but will be used later

# (Make sure riot_api.py is in backend/app/services/)
# (make sure models.py is in backend/app/database/ )
from app.config import get_settings
from app.api.routes import router
from app.api.middleware import ProcessTimeMiddleware

load_dotenv()

# DATABASE & APP SETUP
# (Neo: Database  models are now in a separate file to keep main.py cleaner. See models.py for details and comments on the database structure.)

# from slowapi import _rate_limit_exceeded_handler
# from slowapi.errors import RateLimitExceeded
# from slowapi.middleware import SlowAPIMiddleware

# limiter = Limiter(key_func=get_remote_address)

settings = get_settings()
app = FastAPI(title="Vantage Point Backend")

# Get the URL from the docker-compose environment variable
# points to the db service not localhost hopfully, this should only work inside the container.
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print(
        "DATABASE_URL not set. Using default local Postgres URL for development/ Testing."
    )
    DATABASE_URL = (
        "postgresql+asyncpg://postgres:password@localhost:5432/vantage_point_db"
    )
engine = create_async_engine(DATABASE_URL)

# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]
# app.add_middleware(SlowAPIMiddleware)
# CORS for frontend
# 3000 = React default, 5173 = Vite default.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)

app.add_middleware(ProcessTimeMiddleware)

app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Vantage Point API running"}


@app.get("/health")
async def health():
    return {"status": "Vantage Point Backend running healthy"}


@app.post("/api/test")
async def test_endpoint(data: Dict[str, Any]) -> Dict[str, Any]:
    print(f"Test endpoint called with data: {data}")
    return {"received": data, "message": "Test successful"}
