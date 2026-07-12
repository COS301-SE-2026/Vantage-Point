# Test Coverage Map (as of 2025-06-25)

## Backend (`pytest --cov=app`)
- **74 tests, 53% line coverage** (2290 statements, 1083 missed)
- **Strong spots**: `models.py` 100%, `auth_service.py` 100%, `schemas` 100%
- **Gaps**:
  - Routers (`routers/auth.py`, `routers/users.py`, `routers/matches.py`): 0%
  - `seed.py`: 0% (no smoke test for DB seeding — **now added**)
  - `riot_service.py`: 21%, `analytics.py`: 24%
  - `profile_services.py`: 19%
- **Duplicate tests** in `test_main.py` / `test_system.py` (cleanup opportunity)

## Frontend (`npm run test:coverage`)
- **14 tests, 17.5% line coverage**
- **Covered**: utility functions (`riotId.test.ts`, `matchListQuery.test.ts`), basic App smoke
- **Not covered**: all page components, API client, auth context, match detail
- **No E2E tests** (Cypress/Playwright) yet

## How to Run
```bash
# Backend
cd backend
source venv/bin/activate   # or .\venv\Scripts\activate on Windows
pytest --cov=app

# Frontend
cd frontend
npm run test:coverage