# Vantage point -Infrastructure & Setup
This will cover the the dev container environment, the database setup how to verify everything is working.

# Dev Container Setup (VS Code)
Vantage Point uses VS Code Dev Containers backed by Docker Compose. There are two containers:
- `app` — Python 3.11 environment where the FastAPI backend runs
- `db` — PostgreSQL 15, persistent via a named Docker volume

1. Install Docker Desktop and make sure it is running
2. Install "Dev Containers" extension
3. Open the project folder
4. Click "Reopen in Container" (bottom-left) or via the Command Palette
5. VS Code will build the containers and run post-create.sh, which installs Python and Node dependencies automatically
>The .devcontainer/ folder must be at the root of the project. VS Code will not find it if it's named .devcontainers (plural).

`post-create.sh` installs all Python dependencies (`requirements.txt`) and Node dependencies (`npm install`) automatically. Watch the build log for any errors — click **Show Log** in the bottom-right notification while it builds.

### Important notes
 
- The `.devcontainer` folder must be named exactly that — singular, no 's'. VS Code will not find it otherwise.
- Your project files are mounted into the container at `/workspaces`. There is no subfolder — `backend` and `frontend` sit directly at `/workspaces/backend` and `/workspaces/frontend`.
- The `db` hostname only resolves inside the container. If you try to run the backend outside the container, point `DATABASE_URL` at `localhost:5432` instead.
- `post-create.sh` must have LF line endings, not CRLF. If you edit it on Windows or whatever OS you use, change the line ending to LF in VS Code (click the `CRLF` indicator in the bottom-right status bar before saving). CRLF causes exit code 127 on rebuild.

## Environment Variables
 
Have a `backend/.env` before running the backend. This file is gitignored so not on the repo. (For obvious reasons the  below example is not using the real values that will be in the env so fill in your details and use the below as a template of what to add) :
 
```env
DATABASE_URL=postgresql+asyncpg://riot_user:riot_password@db:5432/riot_db
RIOT_API_KEY=your_key_here
JWT_SECRET=change-me-to-a-long-random-string
SEED_DEV_PASSWORD=choose-a-dev-only-password
JWT_ACCESS_EXPIRE_MINUTES=30
JWT_REFRESH_EXPIRE_DAYS=7
```

For the frontend, copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_URL=http://localhost:8000
```

### Dev Container environment variables (`.devcontainer/.env`)

To avoid hardcoding database credentials in the Docker Compose file (required for SonarQube security compliance), create a `.env` file inside the `.devcontainer/` folder:

```bash
# .devcontainer/.env
POSTGRES_USER=riot_user
POSTGRES_PASSWORD=riot_password
POSTGRES_DB=riot_db
```
 
`DATABASE_URL` is also injected by Docker Compose so the app starts correctly even without `.env` inside the container. The `.env` file is needed for running scripts like `test_db.py` directly.
 
---

# Database Infrastructure

### How it works 
The schema is defined in `backend/app/database/models.py` using SQLModel (SQLAlchemy + Pydantic). 
On startup, FastAPI calls `SQLModel.metadata.create_all`, which creates any missing tables without touching ones that already exist.

The connection string is passed in as an environment variable by Docker Compose ( `riot_password` is the placeholder for your password and `riot_db` is also a placeholder; i hope these comments dont sound ai because i took time and effort to make sure i am understood and things work, hope you like this easter egg comment :) ):
```bash
DATABASE_URL=postgresql+asyncpg://riot_user:riot_password@db:5432/riot_db
```
Note the host is `db`, not `localhost` — that's the service name from `docker-compose.yml`. This only resolves correctly from inside the container.


### Schema and ER Diagram
| Table                | Primary Key           | Notes |
|----------------------|-----------------------|-------|
| `users`              | `id` (UUID str)       | Email/password auth; `display_name` for profile header |
| `game_accounts`      | `puuid` (str)         | Riot player ID; `profile_matches_sampled` drives "Last N matches" label |
| `user_game_accounts` | `id` (int, auto)      | Join table allowing a user to link multiple game accounts |
| `achievement_definitions` | `id` (str)       | Achievement catalog (label, description, source field) |
| `user_achievements`  | `id` (int, auto)      | Per-PUUID achievement counts for profile |
| `user_featured_games`| `id` (int, auto)      | Featured-game banner slides per PUUID |
| `matches`            | `match_id` (str)      | Riot match ID; includes `game_creation`, `map_id`, `played_on`, `detail_json` (scoreboard) |
| `champions`          | `champion_id` (int)   | Matches Riot's own champion ID |
| `participants`       | `internal_id` (int, auto) | Links a game account, match, and champion; stores per‑match stats |
 
`participants` holds foreign keys to `matches`, `game_accounts`, and `champions`. All three must have a matching row before a participant can be inserted. A player's in‑game stats (kills, deaths, etc.) are stored directly in this table, while the user's real‑world identity is linked indirectly via `game_accounts` → `user_game_accounts` → `users`.
### Starting the backend (creates tables on first run)
 
```bash
cd /workspaces/backend
uvicorn app.main:app --reload
```
 
On startup you should see:
 
```
Tables are ready.
INFO: Application startup complete.
```
 
Hit `http://localhost:8000` to confirm the API is running. Expected response:
 
```json
{"message": "Vantage Point API running", "db_status": "Ready"}
```

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
Expected output:
 
```
 Schema |        Name        | Type  |   Owner   
--------+--------------------+-------+-----------
 public | champions          | table | riot_user
 public | game_accounts      | table | riot_user
 public | matches            | table | riot_user
 public | participants       | table | riot_user
 public | user_game_accounts | table | riot_user
 public | users              | table | riot_user
```
## Seeding the Database with Champion Data

The database starts empty. To populate the `champions` table with real Riot IDs and static stats from the dataset, run the seed script **manually**:

```bash
cd backend
python3 -m venv .venv   # first time only
.venv/bin/pip install -r requirements.txt   # first time only
.venv/bin/python -m app.database.seed
```

### Auth API (email/password + JWT)

After changing the `users` schema, reset the database (seed drops and recreates tables):

```bash
cd /workspaces/backend
python -m app.database.seed
```

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/auth/register` | POST | No | Create account; returns access + refresh tokens |
| `/api/v1/auth/login` | POST | No | Sign in |
| `/api/v1/auth/refresh` | POST | No | Refresh access token |
| `/api/v1/users/me` | GET | Bearer | Profile identity + linked Riot ID |
| `/api/v1/users/me/profile` | GET | Bearer | Profile aggregates (radar, champions, achievements) |
| `/api/v1/users/me/game-accounts` | POST | Bearer | Link Riot ID (`Name#TAG`) via Riot API |
| `/api/v1/matches` | GET | Bearer | Match history for linked account |
| `/api/v1/matches/{match_id}` | GET | Bearer | Full match detail (scoreboard) |

Seed users: `testuser1@vantagepoint.dev` / `testuser2@vantagepoint.dev` with password from `SEED_DEV_PASSWORD` in `backend/.env`. See [Dev-Quickstart.md](./Dev-Quickstart.md) for the full seed → run → login flow.

**Seeded dev data (viewer `You#EUW`, PUUID `seed-viewer-puuid`):** 8 matches, 7 achievements, 2 featured-game banners, `profile_matches_sampled=20`. Match list rows come from `participants`; each match’s scoreboard in `matches.detail_json` is built per `match_id` and aligned with the viewer’s list stats (champion, KDA, win/loss). Radar and recent champions are computed from `participants`; achievements and banner stats are read from `user_achievements` / `user_featured_games` (not from Match-v5 yet). Sign in as `testuser1` after seeding. Real Riot-linked accounts without seeded rows get empty achievements/banners until ingestion is added.

## Visualising the Schema
 
### VS Code PostgreSQL Extension (inside the container)
 
The `ckolkman.vscode-postgres` extension is installed automatically when you open the dev container.
 
1. Open the **PostgreSQL** tab in the VS Code sidebar
2. Add a new connection:
   - Host: `localhost`
   - Port: `5432`
   - User: `riot_user`
   - Password: `riot_password`
   - Database: `riot_db`
3. Browse tables and run queries directly in VS Code


## Manual Setup

### First-time setup

**Backend** — from the repo root:

```sh
cd backend
python3.11 -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env       # then edit values
```

**Frontend**:

```sh
cd frontend
npm install
cp .env.example .env       # set VITE_API_URL=http://localhost:8000
```

Seed the database once `backend/.env` is configured (see [Dev-Quickstart.md](./Dev-Quickstart.md)):

```sh
cd backend
python -m app.database.seed
```

### Quick start — run dev servers

Start scripts live in each package and at the repo root. They activate the backend venv and load nvm when available.

From the **repo root**:

```sh
# Backend + frontend (one terminal; Ctrl+C stops both)
./scripts/start.sh
```

Or run each service in its own terminal:

```sh
./backend/start.sh    # http://localhost:8000
./frontend/start.sh   # http://localhost:5173 (URL printed by Vite)
```

**Manual alternative** (same result without the scripts):

```sh
# Terminal 1 — backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev
```

## Issues you may encounter
- If `pip install -r requirements.txt` does not complete fully and throws an error, then run:
  1. `pip cache purge`
  2. `pip install --upgrade pip`
  3. `pip install -r requirements.txt`

- `post-create.sh` fails with exit code 127 on rebuild
  The script has Windows line endings (CRLF). Open it in VS Code, click `CRLF` in the bottom-right status bar, switch to `LF`, and save. Then rebuild.
  
  Alternatively, fix it from inside the container without rebuilding:
  ```bash
  sed -i 's/\r//' /workspaces/.devcontainer/post-create.sh
  bash /workspaces/.devcontainer/post-create.sh
  ```
  
- `pg_isready` or `psql` not found
  ```bash
  sudo apt-get update -qq && sudo apt-get install -y postgresql-client
  ```
- Port `5432` already in use, db contianer fails to start likely due to a local Postgres instance running:
  - **Linux**: `sudo systemctl stop postgresql`

- VS Code doesn't find the dev contianer
  - check that the folder is named `.devcontainer` (no "s" or additions or removals). THe spec does not recognise `.devcontainers`

- `DATABASE_URL` is None / connection refused
  - You are running the backend outside the container. The `db` hostname only resolves inside Docker's network. Run from inside the container, or temporarily change `DATABASE_URL` in `.env` to use `localhost:5432`.
 
**`npm: command not found` in post-create.sh**
The Node feature is missing from `devcontainer.json`. Make sure this block is present:
```json
"features": {
    "ghcr.io/devcontainers/features/node:1": {
        "version": "18"
    }
}

  
