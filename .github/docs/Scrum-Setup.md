# SCRUM Setup & Sprint Planning

## Sprint Schedule
- **Sprint Duration:** 2 weeks
- **Sprint Cadence:** Every 2 weeks

## Daily Standups
**Frequency:** 3x per week (every 2 days)
- **Mondays** - 19:00
- **Wednesdays** - 19:00
- **Saturdays** - 10:00

**Duration:** 15 minutes to 1 hour
**Format:** 
- What did I complete yesterday?
- What am I working on?
- Any blockers?
- What am I doing next?

## Project Owner Meetings
- **Frequency:** Every Thursday (until June, then rediscuss)
- **Duration:** 30 minutes to 1 hour
- **Purpose:** Sprint reviews, feedback, backlog refinement

## Sprint Ceremonies
### Pre-Sprint Planning
- **When:** End of sprint (Thursday)
- **Duration:** 1 hour
- **Attendees:** Full team + Product Owner
- **Agenda:**
  - Review sprint goal
  - Break down user stories into tasks
  - Assign story points using Fibonacci (1, 2, 3, 5, 8, 13)
  - Commit to sprint capacity

### Sprint Planning
- **When:** Start of sprint (Friday)
- **Duration:** 1-2 hours
- **Attendees:** Full team
- **Agenda:**
  - Review sprint goal
  - Break down user stories into tasks
  - Assign story points using Fibonacci (1, 2, 3, 5, 8, 13)
  - Commit to sprint capacity

### Sprint Review/Demo
- **When:** End of sprint (Thursday)
- **Duration:** 1 hour
- **Attendees:** Full team + Product Owner
- **Agenda:**
  - Demo completed features
  - Gather feedback
  - Update product backlog

### Sprint Retrospective
- **When:** End of sprint (Thursday, after Demo)
- **Duration:** 45 minutes
- **Attendees:** Full team
- **Agenda:**
  - What went well?
  - What didn't go well?
  - Action items for next sprint

### Backlog Refinement
- **When:** Mid-sprint (Saturday) - replaces standup
- **Duration:** 1 hour
- **Attendees:** Full Team
- **Agenda:**
  - Clarify upcoming stories
  - Estimate complexity
  - Prepare for next sprint planning

---

## Sprint Roadmap

### Sprint 1: CI/CD + Testing Infrastructure + Initial setup + Wireframes
**Status:** In progress
**Duration:** 2 weeks
**Stant - End** May 01 - May 14
**Goal:** Establish automated testing, code quality gates, deployment pipelines, initial setup and designs

**In progress:**
- [ ] GitHub Actions workflows (backend tests, frontend tests, security scans)
- [x] pytest setup with fixtures and coverage
- [x] Vitest + React Testing Library configuration
- [x] Code quality tools (Black, Ruff, MyPy, ESLint, Prettier)
- [ ] Security scanning (pip-audit, npm audit)
- [x] Development documentation
- [ ] Dev containers (backend, frontend, database)
- [ ] Database setup (Initial tables, )

---

### Sprint 2: Authentication + User Management
**Duration:** 2 weeks
**Stant - End** May 15 - May 21
**Goal:** Integrate Riot API, implement data parsing, 

**User Stories:**
- [ ] As a user, I can register with email and password
- [ ] As a user, I can log in with credentials
- [ ] As a user, I can refresh my JWT token
- [ ] As a user, I can log out and invalidate my token
- [ ] As an admin, I can view all registered users
- [ ] As a user, I can view my profile

**Tasks:**
- Create User model in SQLModel
- Implement password hashing (bcrypt)
- Create JWT token generation/validation
- Build registration endpoint (`POST /api/v1/auth/register`)
- Build login endpoint (`POST /api/v1/auth/login`)
- Build refresh endpoint (`POST /api/v1/auth/refresh`)
- Build logout endpoint (`POST /api/v1/auth/logout`)
- Add auth middleware for protected routes
- Create frontend login/register pages
- Add token storage (localStorage/sessionStorage)
- Write unit tests for auth endpoints
- Write integration tests for auth flow

**Definition of Done:**
- All endpoints tested with >80% coverage
- Frontend pages pass UI tests
- JWT tokens validated on protected endpoints
- User credentials never logged in plaintext

---


## Backlog

### Future Features
- [ ] Duo/Team analysis (compare positioning with teammates)
- [ ] Replay video integration with D3 overlay
- [ ] Real-time live game tracking
- [ ] Discord bot integration
- [ ] Pro player comparison
- [ ] Ranked tier analysis
- [ ] Champion-specific position recommendations
- [ ] Export reports (PDF, CSV)
- [ ] Mobile app (React Native)

---


---

## Definition of Done Checklist

All work items must satisfy:
- Code quality checks passing (Black, Ruff, MyPy, ESLint, Prettier)
- No new security vulnerabilities (pip-audit, npm audit)
- Unit tests written and passing (>80% coverage for backend, >70% for frontend)
- Code reviewed and approved by peer and project lead
- Integration tests passing
- Documentation updated (README, code comments, API docs)
- Works locally on all dev machines
- No performance degradation
- Merged to `dev` branch via PR

---

## Tools & Resources

- **Project Tracking:** GitHub Projects / Milestones
- **Communication:** Discord (Updates, queries, resources, online meetings)
- **Documentation:** Discord and Github
- **Code Repo:** GitHub
- **CI/CD:** GitHub Actions
- **Code Quality:** SonarQube - Automatically used
- **API Testing:** Swagger and Postman (in `.postman/` directory)

---

## Release Plan

| Milestone | Target Date | Features |
|-----------|------------|----------|
| **v0.1 Pre-Alpha** | End of Sprint 1 | Auth + Profile page + List matches page |
| **v0.2 Pre-Alpha** | End of Sprint 2 | Endpoints use database + Match page + Basic AI/ML |
