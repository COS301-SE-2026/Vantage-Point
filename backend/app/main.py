from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel

load_dotenv()

from app.database.session import engine
from app.routers import auth, matches, users
from app.services.avatar_storage import UPLOADS_DIR, ensure_avatar_dir

app = FastAPI(title="Vantage Point Backend")

ensure_avatar_dir()
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
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(matches.router)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Tables are ready.")


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
