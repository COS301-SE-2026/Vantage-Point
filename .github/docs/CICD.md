# GitHub Actions CI/CD Workflows

## Overview

This directory contains automated workflows that run on every push and pull request to ensure code quality, security, and test coverage.

## Quick Reference

| Workflow | Trigger | Required |
|----------|---------|----------|
| `backend-tests.yml` | Push/PR to main/dev | Yes |
| `frontend-tests.yml` | Push/PR to main/dev | Yes |
| `security.yml` | Push/PR + weekly | Yes |

## Workflows

### 1. `backend-tests.yml`
**Runs on:** Every push/PR to `main` or `dev` branches affecting `backend/`

**What it does:**
- **Code Quality** (Ruff linting, Black formatting)
- **Unit Tests** (pytest with coverage)
- **Coverage Reports** (pytest --cov=app)
- **Artifacts** (HTML coverage report saved for 30 days)

**Required to pass before merge:** YES

---

### 2. `frontend-tests.yml`
**Runs on:** Every push/PR to `main` or `dev` branches affecting `frontend/`

**What it does:**
- **Code Quality** (ESLint, Prettier)
- **Unit Tests** (jest with coverage)
- **Coverage Reports** (vitest)
- **Artifacts** (HTML coverage report saved for 30 days)

**Required to pass before merge:** YES

---

### 3. `security.yml`
**Runs on:** Every push/PR + weekly schedule

**What it does:**
- **Dependency Scanning** (pip-audit checks for vulnerable packages)
- **NPM Audit** (checks frontend dependencies)

**Required to pass before merge:** YES

---

## Test Results

### Viewing Results

1. **In Pull Request:** 
   - Scroll to "Checks" section
   - Click on each check to see details
   - All must be to merge

2. **In Actions Tab:**
   - Click "Actions" on GitHub
   - Select workflow run
   - Expand each job to see logs

### Coverage Reports

- Available as artifacts (30-day retention)
- Uploaded to Codecov automatically
- HTML reports can be downloaded

## Local Testing
_Before pushing, run locally_

### Frontend

```sh
cd frontend

# Install dev dependencies
npm install

# Run tests with coverage
npm run test:coverage -- --run 
```

### Backend
```sh
cd backend

# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests with coverage
pytest --cov=app --cov-report=html

# Check code quality
black --check app tests
ruff check app tests

# Check dependencies
pip-audit
