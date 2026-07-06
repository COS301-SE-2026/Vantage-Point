# Dev Quickstart — Seed, Backend, Login
test6    
Short runbook for getting a local dev environment with seeded test data and signing in as the demo user.

For full infrastructure setup (Dev Container, database schema, troubleshooting), see [Setup.md](./Setup.md).

---

## Prerequisites

- Project opened in the **Dev Container** (recommended), or local Postgres with `DATABASE_URL` pointing at `localhost:5432`
- **`backend/.env`** — copy from `backend/.env.example`
- **`frontend/.env`** — copy from `frontend/.env.example`

### Required `backend/.env` values

```env
DATABASE_URL=postgresql+asyncpg://riot_user:riot_password@db:5432/riot_db
JWT_SECRET=change-me-to-a-long-random-string
SEED_DEV_PASSWORD=your-team-dev-password
RIOT_API_KEY=your_key_here
```

Inside the dev container, the database host must be **`db`**, not `localhost`.

### Required `frontend/.env` values

```env
VITE_API_URL=http://localhost:8000
```

---

## Step 1 — Seed the database

From inside the dev container:

```bash
cd /workspaces/backend
python -m app.database.seed
```

Outside the container (with a local venv and Postgres on port 5432):

```bash
cd backend
python -m app.database.seed
```

**Success:** output ends with `--- Seed complete ---` and a line like:

```text
Dev login: testuser1@vantagepoint.dev (password from SEED_DEV_PASSWORD)
```

**Important:**

- `SEED_DEV_PASSWORD` must be set in `backend/.env` before running seed.
- Seed **drops and recreates all tables**. Re-run it whenever you need a clean dev dataset or after schema changes.

---

## Step 2 — Start the backend and frontend

**Option A — both services (one terminal):**

```bash
./scripts/start.sh
```

**Option B — separate terminals:**

```bash
./backend/start.sh
```

```bash
./frontend/start.sh
```

**Option C — manual commands:**

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
cd frontend
npm run dev
```

Inside the dev container, paths are `/workspaces/backend` and `/workspaces/frontend` instead of `./backend` and `./frontend`.

**Verify backend:** open [http://localhost:8000](http://localhost:8000). Expected response:

```json
{"message": "Vantage Point API running", "db_status": "Ready"}
```

**Verify frontend:** open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

---

## Step 3 — Log in

| Field | Value |
|--------|--------|
| **Email** | `testuser1@vantagepoint.dev` |
| **Password** | The value of `SEED_DEV_PASSWORD` in `backend/.env` |

Use **testuser1** for the full demo dataset (matches, profile, achievements).  
`testuser2@vantagepoint.dev` uses the same password but has a different, mostly empty game account.

---

## What seed provides

| Item | Details |
|------|---------|
| Dev users | `testuser1@vantagepoint.dev`, `testuser2@vantagepoint.dev` |
| Demo account (testuser1) | Riot ID **You#EUW**, PUUID `seed-viewer-puuid` |
| Match history | 8 seeded games with scoreboards |
| Profile extras | Achievements, featured-game banners, `profile_matches_sampled=20` |
| Champions | Static champion catalog populated |

Newly registered accounts without seeded rows will have empty match history until they link a Riot ID and data is ingested.

---

## Copy-paste checklist

```text
1. backend/.env + frontend/.env (from .env.example)
2. cd backend && python -m app.database.seed
3. ./scripts/start.sh   (or ./backend/start.sh + ./frontend/start.sh)
4. Login: testuser1@vantagepoint.dev / <SEED_DEV_PASSWORD>
```

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| Seed fails: `SEED_DEV_PASSWORD` | Add `SEED_DEV_PASSWORD=...` to `backend/.env`. |
| Seed / backend cannot connect to DB | Run inside the dev container; use host `db` in `DATABASE_URL`. |
| Login fails after re-seed | Password must match the **current** `SEED_DEV_PASSWORD`, not an old value. |
| Empty matches after login | Sign in as **testuser1**, not a new account without seeded data. |
| Frontend cannot reach API | Set `VITE_API_URL=http://localhost:8000` in `frontend/.env`. |
| Backend run outside container | Change `DATABASE_URL` host from `db` to `localhost`. |

---

## Related docs

- [Setup.md](./Setup.md) — Dev Container, database schema, verification
- [Backend-Development-Guide.md](./Backend-Development-Guide.md) — API and backend development
- [Frontend-Development-Guide.md](./Frontend-Development-Guide.md) — UI development
