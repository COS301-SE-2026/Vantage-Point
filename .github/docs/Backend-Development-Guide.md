# Backend Development Guide

##  Introduction

This guide provides the neccessary information required to work in on the Vantage Point Backend
Intended for Backend Developers and covers:
```sh
- Manual Setup
- ENV setup
- Running Backend Locally
- API Docs
- Adding new Features
- Testing
- Platform Notes
- Code quality
- Debugging and Logging
- Performance Guidelines
- Git Workflow
```
Backend is built using Riot Games v5 match API, PostgreSQL, FastAPI and Python that integrates with AWS services.

## Git Workflow
```sh
# 1. Create feature branch
git checkout -b backend/feature-name

# 2. Make changes and test locally
black app && ruff check app --fix && mypy app && pytest

# 3. Commit with descriptive message
git add .
git commit -m "feat: Add new endpoint for spatial analysis"

# 4. Push branch
git push origin backend/feature-name

# 5. Create PR on GitHub
# Link related issues and add test coverage info
```

# Dev enviroment setup
```sh
Required:
- Python
- PostgreSQL
- Git
- Docker
- Access to required AWS
- Riot Games API Credential
```
## Manual Setup
```sh
cd backend

# 1. Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
py -3.11 -m venv venv
venv\Scripts\activate     # Windows

# 2. Install dependencies
pip install -r requirements-dev.txt

# 3. Create .env file
cp .env.example .env
```

### Install Depenedencies
```sh
pip install -r requirements.txt
```

###
```sh
macOS/Linux:
cp .env.example .env

Windows:
copy .env.example .env
```

Configure the ```env``` with the required fields before rungging

## ENV Configuration
```sh
# Environment Identifier
APP_ENV=staging

# PostgreSQL Database Configuration
POSTGRES_DB=xxxx
POSTGRES_USER=xxxx
POSTGRES_PASSWORD=xxxx
DATABASE_URL=xxxx

# Required for linking Riot IDs
RIOT_API_KEY=xxxx
JWT_SECRET=xxxx
SEED_DEV_PASSWORD=xxxx
TEST_USER_PASSWORD=xxxx
JWT_ACCESS_EXPIRE_MINUTES=30
JWT_REFRESH_EXPIRE_DAYS=7

# AWS Credentials
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_REGION=xxxx

# S3 Bucket
bucket_name=xxxx

# Cognito variables
COGNITO_USER_POOL_ID=xxxx
COGNITO_CLIENT_ID=xxxx
COGNITO_CLIENT_SECRET=xxxx
DEBUG=True
VITE_API_URL=http://localhost:8000/
```

# Accessing ENV:
```sh
settings = get_settings()
settings.x
```


## Running Locally

### Quick start

From the repo root or the `backend/` directory:

```sh
./backend/start.sh
```

The script activates `.venv` or `venv` if present, then runs uvicorn with reload on port 8000.

### Manual alternative

```sh
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

To run backend and frontend together, use `./scripts/start.sh` from the repo root.

# Containers

Open Command Palette(Ctrl + Shift + p)

# First Time Setup
Select:
```sh
Dev Container: Rebuild Without Cache and Reopein in Container
```
Use this when building the development container for the first time or when a clean build is needed

# Existing Container
Select:
```sh
Dev Container: Rebuild and Reopein in Container
```
Rebuilds the existing container and reopens project inside

### API Documentation:
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

- Swagger UI:
Provides interactive interface for endpoint testing. 

- ReDoc:
Provides more documentation-focused presentation of the API


# Adding new Feature

1. Create service logic in `app/services/`
2. Define models in `app/models/`
3. Create endpoints in `app/api/v1/`
4. Write tests in `app/tests/`
5. Include router in `app/main.py`
6. Run quality checks and tests locally
7. Open PR with test coverage info

## Testing

```sh
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run with coverage and generate JSON report
pytest --cov=app --cov-report=json --cov-report=term

# Run with coverage and generate HTML report
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_main.py

# Run specific test
pytest app/tests/test_main.py::TestTestEndpoint

# Run with verbose output
pytest -v

# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run only slow tests
pytest -m slow

# Run only async tests
pytest -m asyncio

# Run and show Missing and Covered Files
pytest --cov=app --cov-report=term-missing
```sh
#Run tests and hides files that are 100% covered
pytest --cov=app --cov-report=term-missing:skip-covered
```

### Combined Coverage Summary

The repo has a script that runs both backend and frontend coverage and merges
them into a single dated report, so anyone can check test coverage without
running both suites separately.

```sh
# from repo root
node scripts/generate-coverage-summary.js
```

This runs `pytest --cov=app --cov-report=json` here in `backend/`, runs the
frontend's Vitest coverage, and writes the combined result to
`.github/docs/coverage-summary.md`, including a table of any file below 90%
coverage (`## Files below 90%` under each side). Lower or raise that bar for a
single run with:

```sh
THRESHOLD=80 node scripts/generate-coverage-summary.js
```

Check `.github/docs/coverage-summary.md` before opening a PR if your change
touches an area that was already under 90%. It is the fastest way to see
which files still need tests. See
[Dev-Quickstart.md](./Dev-Quickstart.md) for the full script setup.

### Platform Notes

- **Inside the dev container**: use the `.env` file as is (the database host is `db`).
- **On the Windows host (outside Docker)**: the database is published to `127.0.0.1`.
  1. Create a `.env.windows` file from the example and fill in your local credentials:
     ```powershell
     copy backend\.env.windows.example backend\.env.windows
     # edit backend\.env.windows with your actual values

## Code Quality & Formatting
```bash
# Format check
black --check app

# Format code
black app

# Lint check
ruff check app

# Fix lint issues
ruff check app --fix

# Type checking
mypy app

# Security & bug scan (replicates SonarQube security checks)
bandit -r app -ll

# Dead code, TODO comments, commented-out code (replicates SonarQube style checks)
pylint app --disable=all --enable=W0511,W0105,W0611
```

## Debugging
Enable logging in your code:

```python
import logging
logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

Configure in `app/utils/logger.py`:
```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## Performance Tips
- Use `async`/`await` for I/O operations
- Cache Riot API responses to minimize external requests
- Paginate large result sets with limit/offset
- Add database indexes on frequently queried columns
- Use connection pooling for database connections

## Adding New Features
1. Create service logic in `app/services/`
2. Define models in `app/models/`
3. Create endpoints in `app/api/v1/`
4. Write tests in `app/tests/`
5. Include router in `app/main.py`
6. Run quality checks and tests locally
7. Open PR with test coverage info

## Git Workflow
```sh
# 1. Create feature branch
git checkout -b backend/feature-name

# 2. Make changes and test locally
black app && ruff check app --fix && mypy app && pytest

# 3. Commit with descriptive message
git add .
git commit -m "feat: Add new endpoint for spatial analysis"

# 4. Push branch
git push origin backend/feature-name

# 5. Create PR on GitHub
# Link related issues and add test coverage info
```
