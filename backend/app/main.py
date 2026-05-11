from fastapi import FastAPI
from typing import Any, Dict
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.routes import router
from app.api.middleware import ProcessTimeMiddleware

#from slowapi import _rate_limit_exceeded_handler
#from slowapi.errors import RateLimitExceeded
#from slowapi.middleware import SlowAPIMiddleware

#limiter = Limiter(key_func=get_remote_address)

settings = get_settings()
app = FastAPI(title="Vantage Point Backend")

#app.state.limiter = limiter
#app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

#app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]
#app.add_middleware(SlowAPIMiddleware)
# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"]
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
