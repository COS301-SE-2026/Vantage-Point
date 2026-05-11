from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.routes import router

settings = get_settings()
app = FastAPI(title="Vantage Point Backend")


# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

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
