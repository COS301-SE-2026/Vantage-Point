# Vantage point -Infrastructure & Setup
This will cover the technical setup for the database, backend and frontend environments.

# With Dev Container (VS Code)
1. Install "Dev Containers" extension
2. Click "Reopen in Container" (bottom-left)
3. VS Code opens terminal **inside container**
4. Run same commands above

# Database Infrastructure
### Schema and ER Diagram
Using SQLModel (SQLAlchemy + Pydantic) to manage the schema
* **Automatic sync**: On startup, backend checks for table existence and creats them if missing
* **Visualization**: to see the ER Diagram, Use the VS COde PostgreSQL extension connected to host db.

### Verification of Uptime
to verify the databaase is healthy from inside the container:
```bash
export PGPASSWORD=riot_password
pg_isready -h db -U riot_user -d riot_db
```

## Manual Setup
# Backend
```sh
cd backend
python3.11 -m venv venv
source venv/bin/activate # macOS/Linux
venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

# Frontend
```sh
cd frontend
npm run dev
```

## Issues you may encounter
- If `pip install -r requirements.txt` does not complete fully and throws an error, then run:
  1. `pip cache purge`
  2. `pip install --upgrade pip`
  3. `pip install -r requirements.txt`
- Port `5432` already in use, db contianer fails to start likely due to a local Postgres instance running:
  - **Linux**: `sudo systemctl stop postgresql`
