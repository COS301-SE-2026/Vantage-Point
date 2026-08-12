# Backend Development Guide

##  1. Introduction

This guide provides the neccessary information required to work in on the Vantage Point Backend

Intended for Backend Developers and covers:
- Technology Stack
- File Structure
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

Backend is built using Riot Games v5 match API, PostgreSQL, FastAPI and Python that integrates with AWS services.

# 2. Technology Stack

- Python
- FastAPI                                   RestApi Framework
- Uvicorn                                   Application Server
- PostgreSQL                                Database
- SQLModel                                  ORM
- AWS Cognito                               Authentication and Authorization
- AWS S3                                    Object Storage
- Riot Games API v5 and v1                  League of legends data
- Pytest                                    Testing
- Black                                     Code Formatting
- Ruff                                      Linting
- Mypy                                      Type Checking



## 3. File Structure
```
backend/
├── app/
│   ├── api/              # API routes (v1)
│   ├── auth/             # Auth dependancy AWS
│   ├── database/         # SQLModel schemas
│   ├── services/         # Business logic
│   ├── models/           # Req/Res schemas
│   ├── pred_engine/      # AI Logic
│   ├── tests/            # Unit & integration tests
│   ├── utils/            # Logging, helpers
│   └── main.py           # App entry point
├── requirements-dev.txt
└── README.md
```

# 4. Dev enviroment setup

### Required:
- Python
- PostgreSQL
- Git
- Docker
- Access to required AWS
- Riot Games API Credential


## 5. Manual Setup
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

## 6. ENV Configuration

# Environment Identifier
APP_ENV=staging

# PostgreSQL Database Configuration
POSTGRES_DB=xxxx
POSTGRES_USER=xxxx
POSTGRES_PASSWORD=xxxx
DATABASE_URL=xxxx

# Required for linking Riot IDs — create at https://developer.riotgames.com/
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

# Accessing ENV:

settings = get_settings()
settings.x


## 7. Running Locally

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

# Run devcontainer
ctrl + shift + P

# First Build Choose
Dev Container: Rebuild Without Cache and Reopein in Container

# If built before
Dev Container: Rebuild and Reopein in Container

### 9. API Documentation:
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

- Swagger UI:
Provides interactive interface for endpoint testing. 

- ReDoc:
Provides more documentation-focused presentation of the API


# 10. Adding new Feature

1. Create service logic in `app/services/`
2. Define models in `app/models/`
3. Create endpoints in `app/api/v1/`
4. Write tests in `app/tests/`
5. Include router in `app/main.py`
6. Run quality checks and tests locally
7. Open PR with test coverage info

## 11. Testing

```sh
# Run all tests
pytest

# Run with coverage
pytest --cov=app

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
```
### 12. Platform Notes

- **Inside the dev container** – use the `.env` file as is (the database host is `db`).
- **On the Windows host (outside Docker)** – the database is published to `127.0.0.1`.
  1. Create a `.env.windows` file from the example and fill in your local credentials:
     ```powershell
     copy backend\.env.windows.example backend\.env.windows
     # edit backend\.env.windows with your actual values

## 13. Code Quality & Formatting
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

## 14. Debugging
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

## 15. Performance Tips
- Use `async`/`await` for I/O operations
- Cache Riot API responses to minimize external requests
- Paginate large result sets with limit/offset
- Add database indexes on frequently queried columns
- Use connection pooling for database connections


## 16. Git Workflow
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
