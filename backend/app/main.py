from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vantage Point Backend")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
