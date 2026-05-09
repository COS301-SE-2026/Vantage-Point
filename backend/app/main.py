from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware # <-- Added this

from app.config import get_settings 
from app.api.routes import router

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="League of Legends Spatial Analytics API",
    version="1.0.0"
)

# --- Rate Limiting Setup ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware) # <-- Added this

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes (Included only ONCE) ---
app.include_router(router, prefix="/api")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "region": settings.riot_region}