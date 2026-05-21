# Vantage Point

> **Spatial Intelligence Platform for Competitive Gamers**

Transform your gameplay through advanced positioning analysis. Move beyond K/D ratios and discover the data-driven insights that separate top-tier players from the rest.


[![Backend Tests](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/backend_tests.yml/badge.svg)](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/backend_tests.yml)
[![Frontend Tests](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/frontend_tests.yml/badge.svg)](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/frontend_tests.yml)
[![Security](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/security.yml/badge.svg)](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/security.yml)

---

## About

Vantage Point is a spatial intelligence platform designed for competitive gamers to move beyond traditional surface-level statistics like Kill/Death ratios. By transforming raw coordinate data from real-time matches into actionable insights, it identifies positioning errors and failing engagement patterns to help players visualize and correct their gameplay.

---

## The F.R.O.S.N Team
*Pending team picture*

| Name | Picture | Role | Description | LinkedIn |
|------|---------|------|-------------|----------|
| Fabio Berrino | *Pending picture* | Scrum Master and DevSecOps Engineer | I am a BSc Information and Knowledge Systems Student Specialising in Software Development. I am Interestred in everything related to technology ranging from software development to DevSecOps and AI/ML. | [LinkedIn](https://www.linkedin.com/in/fabio-b-15357777fa/) |
| Shaun Marx | *Pending picture* | Backend Developer |  | [LinkedIn](https://linkedin.com/in/shaun-marx) |
| Vele Ndamulelo | *Pending picture* | Frontend Developer |  | [LinkedIn](https://linkedin.com/in/vele-ndamulelo) |
| Neo Machaba | *Pending picture* | Database Manager |  | [LinkedIn](https://www.linkedin.com/in/neo-machaba) |
| Ophelia Greyling | *Pending picture* | AI/ML Developer |  | [LinkedIn](https://linkedin.com/in/ophelia-greyling) |

## Team Roles

| Role | Responsibility |
|------|-----------------|
| **Scrum Master and DevSecOps Engineer** | Process facilitation, blocker removal, team velocity tracking, CI/CD pipeline management, AWS Integration |
| **Backend Developer** | API design, ORM setup, ML model integration, FastAPI development, Match-v5 API Integration |
| **Frontend Developer** | UI/UX design, component architecture, performance optimization, React + D3.js implementation |
| **Database Manager** | Database schema design, query optimization, data integrity, PostgreSQL management |
| **AI/ML Developer** | Machine learning model development, data science pipeline, model training and optimization |

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
├── .devcontainer/            # Local containerized development environment
│   ├── docker-compose.yml    # Multi-container orchestration (DB, App, Client)
│   ├── devcontainer.json     # VS Code container environment specification tool settings
│   ├── post-create.sh        # Automated environment setup script
│   └── start-services.sh     # Service initialization script
│
├── .github/                  # GitHub workflows, actions, and workspace configurations
│   ├── docs/                 # Internal design, API, and scrum methodology logs
│   └── workflows/            # CI/CD automated test & security pipelines
│
├── backend/                  # FastAPI REST API & machine learning engine
│   ├── app/
│   │   ├── api/              # API router configurations & routing middleware
│   │   ├── database/         # Database layer, schema + models, seeding scripts and session transaction engine
│   │   ├── pred_engine/      # Match analytics predictive ML pipeline
│   │   │   └── knn_model.py  # K-Nearest Neighbors core model logic
│   │   ├── schemas/          # Used in Services
│   │   ├── services/         # Decoupled business logic & provider layer
│   │   ├── tests/            # Unit & Integration Tests; Automated backend testing logic (Pytest)
│   │   ├── utils/            # Helper functions and rate-limiting scripts
│   │   ├── config.py         # App environment configuration & secrets manager
│   │   └── main.py           # Application server root entry point
│   ├── mypy.ini              # Static type linting rules
│   ├── pytest.ini            # Pytest execution configurations
│   ├── requirements.txt      # Runtime server dependencies
│   └── requirements-dev.txt  # Local test/lint utilities
│
├── frontend/                 # Single-Page Application (React + Vite + Tailwind)
│   ├── public/               # Global static assets (SVG favicons/icons)
│   ├── src/
│   │   ├── pages/            # Client interface layouts (Login, Register, Dashboard)
│   │   ├── services/         # Axios/Fetch client endpoints (authService, API configurations)
│   │   ├── __tests__/        # Client-side Vitest test suites
│   │   ├── App.jsx           # Application shell and component router
│   │   ├── index.css         # Main stylesheet & Tailwind imports
│   │   └── main.jsx          # Client virtual DOM registration entry point
│   ├── eslint.config.js      # JS code style linting rules
│   ├── tailwind.config.js    # Utility-first CSS theme extensions
│   ├── vite.config.js        # Vite bundling engine customization
│   └── vitest.config.ts      # Client testing runtime configurations
│
├── .gitignore                # Global Git version control exclusions
├── .gitattributes            # Global Git configuration file used to define standardized line endings
└── README.md                 # Primary project overview and setup documentation
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

## Documentation

- **[Project Board](https://github.com/orgs/COS301-SE-2026/projects/32/views/6)** - Sprint planning and task tracking
- **[Setup Guide](.github/docs/SETUP.md)** - Initial project setup and dependencies
- **[Backend Development Guide](.github/docs/BACKEND_DEV.md)** - Backend setup, testing, API development, code quality
- **[Frontend Development Guide](.github/docs/FRONTEND_DEV.md)** - Frontend setup, components, styling, testing
- **[CI/CD Documentation](.github/docs/CICD.md)** - GitHub Actions workflows, automated testing, deployment pipeline
- **[SCRUM & Sprint Planning](.github/docs/SCRUM_SETUP.md)** - Sprint roadmap, ceremonies, backlog, velocity tracking
