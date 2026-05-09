# Vantage point -Infrastructure & Setup
This will cover the the dev container environment, the database setup how to verify everything is working.

# Dev Container Setup (VS Code)
Vantage Point uses VS Code Dev Containers backed by Docker Compose. There are two containers:
- `app` — Python 3.11 environment where the FastAPI backend runs
- `db` — PostgreSQL 15, persistent via a named Docker volume

1. Install "Dev Containers" extension
2. Open the project folder
3. Click "Reopen in Container" (bottom-left) or via the Command Palette
4. VS Code will build the containers and run post-create.sh, which installs Python and Node dependencies automatically
>The .devcontainer/ folder must be at the root of the project. VS Code will not find it if it's named .devcontainers (plural).

# Database Infrastructure

### How it works 
The schema is defined in `backend/app/database/models.py` using SQLModel (SQLAlchemy + Pydantic). 
On startup, FastAPI calls `SQLModel.metadata.create_all`, which creates any missing tables without touching ones that already exist.

The connection string is passed in as an environment variable by Docker Compose:
```bash
DATABASE_URL=postgresql+asyncpg://riot_user:riot_password@db:5432/riot_db
```
Note the host is `db`, not `localhost` — that's the service name from `docker-compose.yml`. This only resolves correctly from inside the container.


### Schema and ER Diagram
| Table | Primary Key | Notes |
|---|---|---|
| `champions` | `champion_id` (int) | Matches Riot's own champion ID |
| `summoners` | `puuid` (str) | Riot's global player identifier, stable across name changes |
| `matches` | `match_id` (str) | Format: `EUW1_XXXXXXXXX` |
| `participants` | `internal_id` (int, auto) | Join table — links a summoner, match, and champion together |
 
`participants` holds foreign keys to all three other tables, so all three must have a matching row before a participant can be inserted.

### Verification of Uptime
to verify the databaase is healthy from inside the container:
```bash
export PGPASSWORD=riot_password
pg_isready -h db -U riot_user -d riot_db
```
expected output is : `db:5432 - accepting connections`

To connect interactively:
 
```bash
psql -h db -U riot_user -d riot_db
```
 
Then list tables:
 
```sql
\dt
```
## Visualising the Schema
 
### VS Code PostgreSQL Extension (inside the container)
 
The `ms-ossdata.vscode-postgresql` extension is installed automatically when you open the dev container.
 
1. Open the **PostgreSQL** tab in the VS Code sidebar
2. Add a new connection with these details:
   - Host: `localhost` (port 5432 is forwarded from the container)
   - User: `riot_user`
   - Password: `riot_password`
   - Database: `riot_db`
3. Once connected you can browse tables and run queries directly in VS Code


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

- VS Code doesn't find the dev contianer
  - check that the folder is named `.devcontainer` (no "s" or additions or removals). THe spec does not recognise `.devcontainers`

- `DATABASE_URL` is None / connection refused
  - you are likely rrunning the backend outside the container. THe `db` hostname only resolves insde Docker's network. Either run from inside the container or point `DATABASE_URL` at `localhost:5432` temporarily 

  
