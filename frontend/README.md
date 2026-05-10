# Frontend Development Guide

## Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
```

## Running Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

## File Organization

### `public/` vs `src/assets/`

**public/:**
- Static files that DON'T need bundling
- Served as-is (no webpack processing)
- Use for: favicon, robots.txt, manifest.json
- Don't process/minify these files

**src/assets/:**
- Images, fonts that get bundled with code
- Webpack/Vite optimizes them
- Can import directly in code: `import logo from '@/assets/logo.png'`

## Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Testing Components

```jsx
// src/__tests__/components/Dashboard.test.jsx
import { render, screen } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'

describe('Dashboard', () => {
  it('should render dashboard title', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
  })
})
```

## Linting & Formatting

```sh
# Check for issues
npm run lint

# Format code (check only)
npm run format:check
# Format code
npm run format

# Production build
npm run build
```

## Testing

```sh
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Environment Variables

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

Access in code:
```js
const apiUrl = import.meta.env.VITE_API_URL
```

## Git Workflow

```bash
# Feature branch
git checkout -b frontend/map-overlay

# Make changes, test locally
npm run dev
npm run lint
npm run format:check # or npm run format
npm run test
npm run test:coverage
npm run build

# Commit
git add .
git commit -m "Add interactive map overlay with D3.js"

# Push
git push origin frontend/map-overlay

# Create PR on GitHub
