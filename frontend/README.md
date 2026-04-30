## 📝 Frontend Development Guide

Create `frontend/DEVELOPMENT.md`:

```markdown
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

## Component Development

```jsx
// src/components/Dashboard.jsx
import { useState, useEffect } from 'react'
import { fetchMatches } from '@/services/matchService'
import Card from '@/components/common/Card'

export default function Dashboard() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await fetchMatches()
        setMatches(data)
      } catch (error) {
        console.error('Failed to load matches:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [])

  if (loading) return <LoadingSpinner />
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {matches.map(match => (
        <Card key={match.id} match={match} />
      ))}
    </div>
  )
}
```

## API Communication

```js
// src/services/api.js
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE,
})

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

## Styling with Tailwind

```jsx
<div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
  <h2 className="text-xl font-bold text-white">Matches</h2>
  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
    Analyze
  </button>
</div>
```

## D3.js Map Overlay

```jsx
// src/components/MapOverlay.jsx
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function MapOverlay({ mapData }) {
  const svgRef = useRef()

  useEffect(() => {
    if (!svgRef.current || !mapData) return

    const svg = d3.select(svgRef.current)
    
    // Plot points
    svg.selectAll('.death-point')
      .data(mapData.deaths)
      .enter()
      .append('circle')
      .attr('class', 'death-point')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5)
      .attr('fill', 'red')
      .attr('opacity', 0.7)
  }, [mapData])

  return (
    <svg ref={svgRef} width={800} height={1000} className="border" />
  )
}
```

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

```bash
npm run lint        # Check for issues
npm run format      # Format code
npm run build       # Production build
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

# Commit
git add .
git commit -m "feat: add interactive map overlay with D3.js"

# Push
git push origin frontend/map-overlay

# Create PR on GitHub
