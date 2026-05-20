# Frontend Development Guide

## File Structure
```
frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── assets/           # Images, fonts (bundled)
│   ├── utils/            # Helpers, services
│   ├── __tests__/        # Vitest tests
│   └── App.jsx           # Entry component
├── public/               # Static files (favicon, manifest)
├── package.json
└── README.md
```

## Manual Setup
```sh
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
```

## Running Locally
```sh
# Start development server
npm run dev
```

### Access:
- `http://localhost:5173`

## Testing
```sh
# Run tests
npm run test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Example Test
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

## Code Quality & Formatting
```sh
# Check for issues
npm run lint

# Format code (check only)
npm run format:check

# Format code (apply changes)
npm run format

# Production build
npm run build
```

## Environment Variables
```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEBUG=true
```

Access in code:
```js
const apiUrl = import.meta.env.VITE_API_URL
```

### Asset Organization
- **`public/`** – Static files served as-is (favicon, robots.txt, manifest.json). No processing or minification.
- **`src/assets/`** – Images and fonts bundled with code. Vite optimizes them. Import directly: `import logo from '@/assets/logo.png'`

## Debugging
**Browser DevTools:**
1. Open DevTools (F12)
2. Console: Check for errors/warnings
3. React DevTools: Inspect component tree
4. Network: Monitor API calls

**Logging in Code:**
```javascript
console.log('Debug:', value)
console.error('Error occurred:', error)
console.warn('Warning:', message)
```

## Performance Tips
- Lazy-load components with `React.lazy()` for route splitting
- Memoize expensive calculations with `useMemo()`
- Prevent unnecessary re-renders with `React.memo()` and `useCallback()`
- Compress images before deployment
- Use virtual scrolling for long lists

## Adding New Features
1. Create component in `src/components/` (or `src/pages/` for pages)
2. Add hooks in `src/utils/hooks/` if needed
3. Write tests in `src/__tests__/`
4. Import and use in parent component
5. Run lint and tests locally
6. Open PR with test coverage info

## Git Workflow
```sh
# 1. Create feature branch
git checkout -b frontend/feature-name

# 2. Make changes and test locally
npm run format && npm run lint && npm run test

# 3. Commit with descriptive message
git add .
git commit -m "feat: Add interactive map overlay with D3.js"

# 4. Push branch
git push origin frontend/feature-name

# 5. Create PR on GitHub
# Link related issues and add test coverage info
```
