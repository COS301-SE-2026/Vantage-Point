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
| `users`              | `cognito_sub` (str)   | Cognito `sub` claim; stores email, no password |
| `game_accounts`      | `puuid` (str)         | Riot's global player ID, stable across name changes |
| `user_game_accounts` | `id` (int, auto)      | Join table allowing a user to link multiple game accounts |
| `matches`            | `match_id` (str)      | Riot match ID, e.g. `EUW1_1234567890` |
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

  
