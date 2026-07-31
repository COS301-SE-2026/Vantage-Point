# Brand Style

This doc maps the Vantage Point brand to the files that implement it.

**Demo 2 live page:** `/style-guide` in the frontend app. Use that for demos and marking. It covers colour, type, logo, tokens, components, layout, accessibility, voice, and the Demo 1 changelog.

Matches the merged `frontend-implematation` UI (device-dark theme, League Spartan / Beaufort, logo-mark assets, replay and metrics).

---

## Color Palette

Vantage Point uses a few colour systems together:

1. **Design tokens:** CSS variables in `frontend/src/styles/theme.css`, used by shadcn/ui via Tailwind.
2. **Screen hex values:** hard-coded on auth, dashboard, match, replay, and metrics views.
3. **`device-dark:`:** Tailwind variant for `prefers-color-scheme: dark` on landing, auth, and match surfaces. Separate from shadcn `.dark` so Figma light panels are not flipped by accident.

### Semantic tokens (light mode)

Defined in `:root` in `theme.css` (see the live guide for HEX / RGB / HSL). Key roles: background, foreground, primary `#030213`, secondary, muted, accent, destructive `#d4183d`, border, input-background, ring, chart-1 to chart-5.

### Application UI colours (hex)

| Role | HEX | Where used |
|------|-----|------------|
| Body text | `#1e1e1e` | Light UI copy |
| Device-dark canvas | `#181818` | Auth / match pages in dark OS theme |
| Device-dark surface | `#2a2a2a` | Cards, scoreboards |
| Secondary (dark) | `#929292` | Muted text on dark |
| Primary button | `#2c2c2c` | Auth CTAs |
| Button label | `#f5f5f5` | Text on dark CTAs |
| Victory | `#1e7e34` / dark `#18c840` | Win outcomes |
| Defeat | `#c44a4a` / dark `#e03b3b` | Losses / errors |
| Scrollbar thumb | `#b7b7b7` | `.vp-scrollbar` |

### Layout tokens

| Token | Typical value | Purpose |
|-------|---------------|---------|
| `--vp-layout-max` | `1512px` | Max dashboard artboard |
| `--vp-content-max` | `1180px` | Fluid content column cap |
| `--vp-dashboard-header` | `72px` | Header band (raised for large avatars) |
| `--vp-sidebar-width` | `220px` CSS / **180px** JS panel | Sidebar |
| `--vp-chart-grid` / `--vp-chart-label` | `#d4d4d4` / `#525252` (#929292 dark) | Radar chart |
| `--radius` | `0.625rem` | Default radius |

JS layout (`dashboardLayout.ts`): sidebar left **34px**, width **180px**, gap **34px**, content open offset **248px**.

---

## Typography

| Family | Role | Source |
|--------|------|--------|
| **League Spartan** | Brand wordmark (auth, dashboard, landing) | Self-hosted woff2 (`fonts.css`) |
| **Beaufort for LOL** | Display / match UI | Self-hosted OTF (`assets/fonts/beaufort`) |
| **Inter** | Forms, body, UI | Google Fonts (OFL) |
| **Geist** | Featured-game badges | Google Fonts (OFL) |
| **Sarina / Sora** | Still loaded; use Spartan for wordmarks | Google Fonts (OFL) |

Named scale (display, h1-h4, body, caption): see `/style-guide#typography`.

---

## Logo and Iconography

- **Primary mark:** `frontend/src/assets/images/logos/logo-mark.webp`
- **Inverse / dark:** `logo-mark-white.webp`
- **Wordmark:** League Spartan uppercase beside or below the mark (`AuthScreen`, `DashboardShell`, landing)
- **Legacy:** `logo.webp` may still exist; prefer logo-mark assets
- **Clear space:** at least 1/4 mark height; no stretch, random recolour, shadows, or crop
- **Icons:** Lucide React (stroke 2); Figma light/dark SVG pairs via `ThemedIcon`

---

## Design tokens

See `/style-guide#tokens` for colour, spacing, radius, `.vp-scrollbar`, shadow, motion (`animate-vantage-*`, `sg-fade-in`), and breakpoints. Keep CSS vars in sync with `dashboardLayout.ts`.

---

## UI Component Styling

- **Auth:** `AuthScreen` shared wrapper; CTA `#2c2c2c` / `#f5f5f5`; `device-dark` canvas `#181818`
- **Dashboard:** `DashboardShell` with Matches, Replay, Metrics, Profile
- **shadcn (`components/ui/`):** Button variants/states, Input, Select, Dialog, Badge, Sonner toasts
- **Product:** Match detail, MatchReplay, Metrics, MapAnalysis, coaching bars

Live demos: `/style-guide#components`.

---

## Accessibility

- Target: **WCAG 2.2 AA** (AAA encouraged for body text)
- Focus: `focus-visible:ring-[3px]` with `--ring`
- Motion: `prefers-reduced-motion` turns off vantage animations and `sg-fade-in`
- Theme: `device-dark` follows OS colour scheme
- Contrast pairs listed on `/style-guide#colour`

---

## Voice & tone

See `/style-guide#voice`. Keep copy short and direct. Verb-led buttons, clear errors, useful empty states.

---

## Changelog (Demo 1 to Demo 2)

See `/style-guide#changelog`. Covers the live guide, frontend-implematation merge (fonts, marks, device-dark, replay/metrics), WCAG tables, component states, and path updates.

---

## Source reference

| Topic | Primary files |
|-------|----------------|
| Live brand guide | `frontend/src/pages/StyleGuidePage.tsx`, `frontend/src/pages/style-guide/*` |
| Theme tokens | `frontend/src/styles/theme.css` |
| Fonts | `frontend/src/styles/fonts.css` |
| shadcn | `frontend/src/components/ui/` |
| Auth | `frontend/src/components/auth/AuthScreen.tsx` |
| Dashboard | `frontend/src/components/DashboardShell.tsx` |
| Themed icons | `frontend/src/components/ThemedIcon.tsx` |
| Layout constants | `frontend/src/lib/dashboardLayout.ts` |
| Logos | `frontend/src/assets/images/logos/` |
| Route | `frontend/src/Routes.tsx` → `/style-guide` |
