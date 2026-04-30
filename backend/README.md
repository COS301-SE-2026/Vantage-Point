# Backend Development Guide

## Setup
```sh
cd backend

# 1. Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements-dev.txt

# 3. Create .env file
cp .env.example .env
# Edit .env with your config
```

### Visit:
- App: `http://localhost:5173`
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_user_registration

# Run with verbose output
pytest -v

# Run only integration tests
pytest -m integration

# Watch for changes (if using pytest-watch)
ptw
```

## Code Quality

```bash
# Format code
black app tests

# Lint
ruff check app tests

# Type checking
mypy app
```

## API Development Workflow

1. **Define Schema** (Pydantic)
   ```python
   # app/database/schemas.py
   class UserSchema(BaseModel):
       username: str
       email: str
   ```

2. **Create Database Model** (SQLAlchemy)
   ```python
   # app/database/models.py
   class User(Base):
       id = Column(Integer, primary_key=True)
       username = Column(String, unique=True)
   ```

3. **Implement Service Logic**
   ```python
   # app/services/auth_service.py
   async def register_user(user_data: UserSchema):
       # Business logic here
   ```

4. **Create API Endpoint**
   ```python
   # app/api/v1/auth.py
   @router.post("/register")
   async def register(user: UserSchema, db: Session = Depends(get_db)):
       return await auth_service.register_user(user)
   ```

5. **Write Tests**
   ```python
   # tests/test_auth.py
   def test_user_registration(client):
       response = client.post("/api/v1/register", json=user_data)
       assert response.status_code == 201
   ```

## External API Integration (Riot API)

```python
# app/services/riot_api.py
class RiotAPIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://americas.api.riotgames.com"
    
    async def fetch_matches(self, puuid: str):
        """Fetch match IDs from Riot API"""
        # Implementation
    
    async def fetch_match_timeline(self, match_id: str):
        """Get detailed match data"""
        # Implementation
```

## Database Migrations (if using Alembic)

```bash
# Create migration
alembic revision --autogenerate -m "Add user table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Debugging

Enable logging in `app/utils/logger.py`:

```python
import logging
logger = logging.getLogger(__name__)
logger.debug("Debug message")
logger.info("Info message")
logger.error("Error message")
```

## Performance Tips

- Use async/await for I/O operations
- Cache Riot API responses
- Paginate large result sets
- Use database indexes on frequently queried columns
