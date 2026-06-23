# Backend Development Guide

## File Structure
```
backend/
├── app/
│   ├── api/              # API routes (v1)
│   ├── services/         # Business logic
│   ├── models/           # SQLModel schemas
│   ├── tests/            # Unit & integration tests
│   ├── utils/            # Logging, helpers
│   └── main.py           # App entry point
├── requirements-dev.txt
└── README.md
```

## Manual Setup
```sh
cd backend

# 1. Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# 2. Install dependencies
pip install -r requirements-dev.txt

# 3. Create .env file
cp .env.example .env
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

### Access:
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Testing
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
```

## Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/vantage_point
RIOT_API_KEY=your_riot_api_key
LOG_LEVEL=DEBUG
DEBUG=true
SECRET_KEY=your-secret-key
```

Access in code:
```python
import os
api_key = os.getenv("RIOT_API_KEY")
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
