# Vantage Point

> **Spatial Intelligence Platform for Competitive Gamers**

Transform your gameplay through advanced positioning analysis. Move beyond K/D ratios and discover the data-driven insights that separate top-tier players from the rest.

---

## About

Vantage Point is a spatial intelligence platform designed for competitive gamers to move beyond traditional surface-level statistics like Kill/Death ratios. By transforming raw coordinate data from real-time matches into actionable insights, it identifies positioning errors and failing engagement patterns to help players visualize and correct their gameplay.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Spatial Tracking Engine** | Processes (x,y) coordinate data for player deaths and kills across match timelines |
| **Interactive 2D Map Overlays** | Renders dynamic game maps (e.g., Summoner's Rift) with plottable data points |
| **AI Positioning Coach** | Machine learning model that predicts optimal positions by comparing to professional win patterns |
| **Ghost Player Overlay** | D3.js visualization showing recommended position with vector arrows for suggested movement |
| **Clustering Pattern Recognition** | K-Means clustering identifies "recurrent mistake" clusters and categorizes playstyles |
| **Predictive Analytics** | Random Forest models predict probability of death at different map positions |

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | FastAPI (Python) | Data processing, vector calculations, API rate limiting, ML inference |
| | Black | Code formatting |
| | Ruff | Linting and code analysis |
| | MyPy | Type checking |
| **Frontend** | React | Interactive dashboard |
| | D3.js | Coordinate-accurate map overlays |
| | Tailwind CSS | Utility-first styling with custom-built UI components |
| | ESLint | Code quality and linting |
| | Prettier | Code formatting |
| **Database** | PostgreSQL | Match histories and spatial benchmarks |
| **Data Science** | Pandas | Data manipulation |
| | Scikit-learn | K-Nearest Neighbors for finding winning snapshots |
| | Random Forest | Risk prediction models |
| | K-Means | Map clustering and area identification |
| **Infrastructure** | AWS (S3, Lambda) | Serverless data fetching and storage |
| **Environment** | Dev Containers | Standardized Docker development environments |
| **Testing Framework** | pytest | Backend unit and integration tests |
| | Vitest + React Testing Library | Frontend unit and component tests |
| **Security** | pip-audit | Python dependency vulnerability scanning |
| | npm audit | JavaScript dependency vulnerability scanning |
| **Code Quality** | SonarQube | Code analysis and quality metrics |
| **Package Manager** | pip + npm | Python and JavaScript dependency management |


---

## Project Structure
```
Vantage-Point/
├── backend/              # FastAPI server
│   ├── app/
│   │   ├── api/          # API routes (v1)
│   │   ├── services/     # Business logic
│   │   ├── models/       # SQLModel schemas
│   │   ├── tests/        # Unit & integration tests
│   │   ├── utils/        # Logging, helpers
│   │   └── main.py       # App entry point
│   ├── requirements-dev.txt
│   └── README.md         # Backend guide
│
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── assets/       # Images, fonts (bundled)
│   │   ├── __tests__/    # Vitest tests
│   │   ├── utils/        # Helpers, services
│   │   └── App.jsx       # Entry component
│   ├── public/           # Static files (favicon, manifest)
│   ├── package.json
│   └── README.md         # Frontend guide
│
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
│
└── README.md             # Main project guide
```

## Branching Strategy
To ensure a stable and collaborative development workflow, the following strategy is utilized:
- `main`: The production-ready branch. Contains only thoroughly tested and reviewed code.
- `dev`: The primary integration branch. All feature branches merge here first.
- `<domain>/<feature>`: Temporary branches used for developing new features and bug fixes (e.g., `frontend/login_page`, `backend/API_fixes`).

## CI/CD Pipeline

**Testing Strategy: SANDWICH** - Quality checks → Unit tests → Integration tests

| Level | Backend | Frontend | When | Purpose |
|-------|---------|----------|------|---------|
| **Level 1: Quality Gate** | Ruff, Black, MyPy | ESLint, Prettier | First (fails fast) | Catch style & format issues |
| **Level 2: Unit Tests** | Services, schemas, utils | Components, hooks, services | After quality | Test individual functions |
| **Level 3: Integration** | API endpoints + database | Full user workflows | Last | Validate end-to-end flows |

### Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Backend Tests** | Push/PR to main, dev | Unit tests, linting, coverage |
| **Frontend Tests** | Push/PR to main, dev | Unit tests, linting, build |
| **Integration Tests** | Push/PR to main, dev | Full stack E2E tests |
| **Security Checks** | Weekly + on demand | Dependency & vulnerability scan |
| **Code Quality** | Push/PR to main, dev | Coverage reports & analysis |
| **Deploy** | Push to main | Deploy to production |

See [CI/CD Documentation](.github/workflows/README.md) for detailed setup.

## Documentation

- **[Backend Development Guide](backend/README.md)** - Setup, testing, API development
- **[Frontend Development Guide](frontend/README.md)** - Setup, components, styling
