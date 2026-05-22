# Vantage Point

> **Spatial Intelligence Platform for Competitive Gamers**

Transform your gameplay through advanced positioning analysis. Move beyond K/D ratios and discover the data-driven insights that separate top-tier players from the rest.

[![Backend Tests](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/backend_tests.yml/badge.svg)](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/backend_tests.yml)
[![Backend Coverage](backend/coverage-badge.svg)](backend/htmlcov/index.html)
[![Frontend Tests](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/frontend_tests.yml/badge.svg)](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/frontend_tests.yml)
[![Frontend Coverage](frontend/coverage-badge.svg)](frontend/coverage/index.html)
[![Security](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/security.yml/badge.svg)](https://github.com/COS301-SE-2026/Vantage-Point/actions/workflows/security.yml)

---

## About

Vantage Point is a spatial intelligence platform designed for competitive gamers to move beyond traditional surface-level statistics like Kill/Death ratios. By transforming raw coordinate data from real-time matches into actionable insights, it identifies positioning errors and failing engagement patterns to help players visualize and correct their gameplay.

---

## The F.R.O.S.N Team
*Pending team picture*

| Name | Picture | Role | Description | LinkedIn |
|------|---------|------|-------------|----------|
| Fabio Berrino | ![Fabio](.github/images/Fabio.jpg) | Scrum Master and DevSecOps Engineer | I am a BSc Information and Knowledge Systems Student Specialising in Software Development. I am Interestred in everything related to technology ranging from software development to DevSecOps and AI/ML. | [LinkedIn](https://www.linkedin.com/in/fabio-b-15357777fa/) |
| Ophelia Greyling | ![Ophelia](.github/images/Ophelia.jpeg) | Data Analyst and AI/ML Engineer | I am a Computer Science student with a deep interest in data science and its various applications, as well as the mechanisms between computer networks. I have plans to start working in a machine learning related field in the second semester. | [LinkedIn](https://www.linkedin.com/in/zanri-greyling-031636271/) |
| Vele Ndamulelo | ![Vele](.github/images/Vele.png) | Designer and Frontend Developer | I am a  BSC Computer Science student focused on building scalable software systems that reduce complexity and improve efficiency. | [LinkedIn](https://www.linkedin.com/in/vele-ndamulelo-3a3085372/) |
| Neo Machaba | ![Neo](.github/images/Neo.jpg) | Database Manager | I am a BSC Computer Science student, I am interested in Data sciene, engineering and analyst with a goal in improving appplication and workflow efficiency with applying networking in order to reduce system bottlenecking. | [LinkedIn](https://www.linkedin.com/in/neo-machaba) |
| Shaun Marx | ![Shaun](.github/images/Shaun.jpeg) | API and Backend Developer | I am an IKS student with an interest in building software systems from scratch and applying them in different environments. I am especially interested in software engineering, and backend development. | [LinkedIn](https://www.linkedin.com/in/shaun-marx-07bbb63b6/) |

## Team Roles

| Role | Responsibility |
|------|-----------------|
| **Scrum Master and DevSecOps Engineer** | Process facilitation, blocker removal, team velocity tracking, CI/CD pipeline management, AWS Integration and Vulnerability scanning |
| **API and Backend Developer** | API design, ORM setup, ML model integration, FastAPI development and Match-v5 API Integration |
| **Designer and Frontend Developer** | UI/UX design, component architecture, performance optimization, React + D3.js implementation |
| **Database Manager** | Database schema design, query optimization, data integrity, PostgreSQL management |
| **Data Analysis and AI/ML Engineer** | Machine learning model development, data science pipeline, model training and optimization |

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

## Documentation

- **[Project Board](https://github.com/orgs/COS301-SE-2026/projects/32/views/6)** - Sprint planning and task tracking
- **[Setup Guide](.github/docs/SETUP.md)** - Initial project setup and dependencies
- **[Backend Development Guide](.github/docs/BACKEND_DEV.md)** - Backend setup, testing, API development, code quality
- **[Frontend Development Guide](.github/docs/FRONTEND_DEV.md)** - Frontend setup, components, styling, testing
- **[CI/CD Documentation](.github/docs/CICD.md)** - GitHub Actions workflows, automated testing, deployment pipeline
- **[SCRUM & Sprint Planning](.github/docs/SCRUM_SETUP.md)** - Sprint roadmap, ceremonies, backlog, velocity tracking
