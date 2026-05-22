# 4.2.1 Brand Style

The brand style defines the visual identity of Vantage Point and ensures a consistent, professional appearance across all interfaces. This document reflects what is **implemented in the codebase** today (`frontend/src`), not aspirational guidelines.

---

## Color Palette

Vantage Point uses two complementary colour systems:

1. **Design tokens** — CSS variables in `frontend/src/styles/theme.css`, consumed by shadcn/ui components via Tailwind (`bg-primary`, `text-muted-foreground`, etc.).
2. **Figma / screen-specific hex values** — hard-coded on auth screens, the dashboard shell, and match views (primarily Inter-based layouts).

### Semantic tokens (light mode)

Defined in `:root` in `theme.css`:

| Role | Value | Usage |
|------|-------|--------|
| Background | `#ffffff` | Page and card surfaces |
| Foreground | `oklch(0.145 0 0)` | Primary text |
| Primary | `#030213` | Primary actions, emphasis |
| Primary foreground | `oklch(1 0 0)` | Text on primary |
| Secondary | `oklch(0.95 0.0058 264.53)` | Secondary surfaces |
| Muted | `#ececf0` / muted-foreground `#717182` | Subtle UI, secondary text |
| Accent | `#e9ebef` | Hover / highlight surfaces |
| Destructive | `#d4183d` | Errors, destructive actions |
| Border | `rgba(0, 0, 0, 0.1)` | Dividers and outlines |
| Input background | `#f3f3f5` | Form fields (shadcn `Input`) |
| Ring (focus) | `oklch(0.708 0 0)` | Focus rings on interactive controls |
| Chart 1–5 | OKLCH palette | Radar chart and data viz |

A **dark mode** palette is also defined under `.dark` in the same file (used by shadcn primitives). The main app screens (auth, dashboard) currently render in **light mode** with explicit hex colours rather than toggling `.dark`.

### Application UI colours (hex)

Used across login, register, dashboard, profile, and matches:

| Role | HEX | Where used |
|------|-----|------------|
| Body text | `#1e1e1e` | Labels, match rows, profile copy |
| Strong emphasis | `#0b0b0b` | Auth links (e.g. “Sign up”) |
| Secondary text | `#525252`, `#757575` | Section labels, metadata |
| Placeholder | `#b3b3b3` | Auth input placeholders |
| Borders | `#d9d9d9`, `#eee` | Inputs, match list dividers |
| Primary button | `#2c2c2c` (hover `#3c3c3c`) | Sign in / register CTAs |
| Button label | `#f5f5f5` | Text on dark CTAs |
| Hover surface | `#f5f5f5` | Profile edit button hover |
| Victory | `#1e7e34` | Win outcome, match result |
| Defeat / error | `#c44a4a` | Loss outcome, API errors |
| Blue side (LoL) | `#4a7fd4` | Match detail team 100 |
| Red side background | `#fce8e8` | Defeat team chip in match detail |
| Avatar fallback | `#404040` | Initials when no profile image |
| Sidebar panel | `rgba(117, 117, 117, 0.12)` | Dashboard nav background |
| Landing backdrop | `#000000` | Full-screen landing (`LandingPage`) |
| Loading brand text | `#0f172a` | Loading screen wordmark |

**Loading animation accents** (`theme.css` utilities): `#1d4ed8`, `#0f766e`, `#6d28d9`, `#0e7490` cycle in `animate-vantage-pulse`.

### Layout tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `--vp-layout-max` | `1512px` | Max dashboard artboard width |
| `--vp-dashboard-header` | `94px` | Fixed header height |
| `--vp-sidebar-width` | `220px` | Sidebar width |
| `--radius` | `0.625rem` (10px) | Default border radius; sm/md/lg/xl derived |

### Accessibility (colour)

- Auth inputs use `#1e1e1e` on white with `#d9d9d9` borders; focus darkens border to `#2c2c2c`.
- Victory (`#1e7e34`) and defeat (`#c44a4a`) are distinct for outcome scanning.
- shadcn controls use `focus-visible:ring-[3px]` with `--ring` for keyboard focus visibility.

---

## Typography

Fonts are loaded from Google Fonts in `frontend/src/styles/fonts.css` and applied per screen.

### Font families

| Family | Role | Implementation |
|--------|------|----------------|
| **Sarina** | Brand wordmark “Vantage Point” | `font-sarina` token in `theme.css`; `font-sarina` class on login, register, loading, Riot ID screens |
| **Inter** | Primary UI typeface | `font-['Inter:Regular',sans-serif]` (body), `Inter:Semi_Bold` (headings, labels, buttons) |
| **Geist** | Featured-game card badges | `font-['Geist:Medium',sans-serif]` at 14px on `FeaturedGameCard` |
| **Sora** | Loaded globally | Available via `fonts.css`; not heavily used in current screens |

### Sizes and weights

| Element | Size | Weight | Line height |
|---------|------|--------|-------------|
| Root / `html` | `16px` (`--font-size`) | — | — |
| Brand title (auth) | `clamp(20px, 2.5vw, 32px)` | Sarina regular | `leading-normal` |
| Brand title (loading) | `clamp(22px, 4.2vw, 40px)` | Sarina regular | `leading-tight` |
| Body / inputs | `16px` | Inter 400 | `1.4` or `leading-none` |
| Dashboard nav | `14px` | Inter 400 | `1.4` |
| Section headings (profile) | `14px` uppercase | Inter 600 | — |
| Profile display name | `28px` | Inter 600 | `leading-tight` |
| Match stat labels | `11px` uppercase | Inter 500 | `tracking-wide` |
| shadcn `Button` / `Input` | `text-sm` / `text-base` | medium (500) per `theme.css` base layer | `1.5` |

Base heading scale in `theme.css` (`h1`–`h4`) uses `--font-weight-medium` (500) with Tailwind text scale variables; Figma screens override with explicit Inter sizes.

---

## Logo and Iconography

### Logo

- **Primary mark:** WebP asset `798001aef0b2686ac929f8c349135d3326ab65bb.webp` (imported in `Login.tsx`, `Register.tsx`, `RiotId.tsx`, `LoadingPage.tsx`, `Group14.tsx`).
- **Sizing:**
  - Auth / Riot ID: `clamp(120px, 18vw, 200px)` square, with Sarina wordmark below.
  - Dashboard header: `97×99px` absolute top-left (`Group14.tsx`).
  - Loading: responsive clamp, paired with animated wordmark.
- **Wordmark:** “Vantage Point” in Sarina, black on light auth screens, `#0f172a` on loading.

### Favicon

- `index.html` references `/favicon.svg` as the site icon; page title is **Vantage Point**.

### Icons

| Source | Usage |
|--------|--------|
| **Lucide React** | UI chrome (chevrons, checks, carousel controls, achievement mapping in `achievementIcons.ts`) |
| **Inline SVG** (`svg-*.ts` in imports) | Dashboard sidebar toggle, decorative vectors |
| **Figma-exported PNG/WebP** | Profile featured game (`league-wild-rift-*.png`), `icon-lightning-bolt.png`, `icon-time-machine.png` |
| **Social providers** | Google, Apple, Riot Games WebP buttons on auth (60×60px, `alt` describes action) |
| **Riot Data Dragon** | Champion and item images via `ddragon.ts` |

### Placement rules (as implemented)

- Logo is **centred above** auth forms; on dashboard it is **fixed top-left** with account menu top-right.
- Decorative carousel/background images use `alt=""` (presentational); interactive controls and social buttons have descriptive `alt` text.
- Achievement icons sit in a grid with optional count badges (`ProfileView.tsx`).

---

## Design Principles

Patterns observed in the implementation:

| Principle | How it appears in Vantage Point |
|-----------|----------------------------------|
| **Consistency** | Shared auth input class (`authInputClassName`), shared logo asset, repeated dashboard layout constants (`dashboardLayout.ts`, `Group14.tsx`) |
| **Simplicity** | White dashboard canvas, minimal sidebar (Matches / Analysis / Settings labels), clear win/loss colour coding |
| **Responsiveness** | `clamp()` typography and logo on auth; match list grid adds columns at `sm:` breakpoint; sidebar collapses with animated width/position |
| **Accessibility** | Radix primitives, ARIA on navigation and match rows, focus rings on shadcn controls (see Accessibility) |
| **Brand personality** | League/Arcane full-bleed wallpapers on auth; Sarina script wordmark; subtle loading animations (`animate-vantage-pulse`, `animate-vantage-breathe`) |
| **Design–dev alignment** | Figma imports under `frontend/src/landing/imports/`; profile assets documented as Figma exports in `assets/profile/index.ts` |

---

## UI Component Styling

### Auth (login / register / Riot ID)

- **Inputs:** 8px radius, 16px horizontal padding, `#d9d9d9` border, transparent background, Inter 16px (`authInputClassName` in `Login.tsx` / `Register.tsx`).
- **Primary CTA:** Full-width, 58px height, `#2c2c2c` background, `#f5f5f5` label, disabled at 60% opacity.
- **Social login:** Three 60×60 image buttons in a centred row.
- **Background carousel:** Dot tablist (`role="tablist"`), 8px dots, active `bg-black` / inactive 30% opacity.

### Dashboard shell (`Group14.tsx`)

- **Frame:** White full-viewport background, min-width fluid.
- **Sidebar:** 220px wide, 400px tall panel, 15px radius, grey translucent fill; nav items 47px tall, 10px radius white pills for active state.
- **Header:** 94px (`--vp-dashboard-header`); content offset when sidebar open (`DASHBOARD_CONTENT_LEFT_OPEN` = 299px).
- **Toggle:** 24px icon button with `aria-expanded`, `aria-controls="dashboard-sidebar"`.

### shadcn/ui library (`frontend/src/landing/app/components/ui/`)

Shared primitives for newer or composable UI:

| Component | Styling summary |
|-----------|-----------------|
| **Button** | Variants: default, destructive, outline, secondary, ghost, link; sizes sm/default/lg/icon; `rounded-md`, `focus-visible:ring-[3px]` |
| **Input / Textarea / Select** | `h-9`, `rounded-md`, `bg-input-background`, ring on focus, `aria-invalid` destructive styling |
| **Dialog** | Overlay `bg-black/50`, animated open/close (Radix) |
| **Card, Badge, Avatar, Chart** | Token-driven colours; chart uses theme chart-1–5 |
| **Dropdown / Navigation menu** | Accent hover states, keyboard focus rings |

Auth screens use **custom Figma buttons**; dashboard match/profile views mix **custom layout** with selective shadcn pieces (e.g. `Avatar`, `Button` in profile editor).

### Match list and detail

- **List row:** CSS grid, bordered with `#eee`, tabular numerals for stats.
- **Outcome:** Green `#1e7e34` / red `#c44a4a` semibold labels.
- **Detail:** Team colours blue/red; result banner uses same win/loss palette.

---

## Accessibility

Implemented practices (targeting WCAG-oriented behaviour):

| Area | Implementation |
|------|----------------|
| **Language** | `<html lang="en">` in `index.html` |
| **Keyboard focus** | shadcn components: `focus-visible:border-ring`, `focus-visible:ring-[3px]`; auth inputs: visible border change on focus |
| **Screen readers** | `aria-label` on dashboard sidebar toggle, nav (“Matches”), profile sections (“Performance radar”, “Achievements”, etc.); `aria-current="page"` for active nav; match rows expose `matchRowAriaLabel()`; carousel previous/next use `sr-only` text; login errors use `role="alert"` |
| **Semantic structure** | Match list uses `role="row"` / `role="columnheader"`; carousel uses `role="region"` and `aria-roledescription` |
| **Forms** | Labels associated with fields on auth screens; `aria-invalid` styling on shadcn inputs when invalid |
| **Motion** | CSS animations on loading screen; no `prefers-reduced-motion` override yet |
| **Colour contrast** | Light dashboards rely on dark grey text on white; known gap: some decorative images use empty `alt` |

### Gaps / follow-ups

- Dark-mode tokens exist but are not wired as the default experience for main routes.
- Not all images have descriptive `alt` (logo and wallpapers are decorative).
- No documented WCAG conformance level or automated a11y test suite in repo.

---

## Source reference

| Topic | Primary files |
|-------|----------------|
| Theme tokens | `frontend/src/styles/theme.css` |
| Fonts | `frontend/src/styles/fonts.css`, `frontend/src/styles/index.css` |
| shadcn components | `frontend/src/landing/app/components/ui/` |
| Auth branding | `frontend/src/landing/imports/Login/Login.tsx`, `Register/Register.tsx` |
| Dashboard shell | `frontend/src/landing/imports/Group14/Group14.tsx` |
| Layout constants | `frontend/src/landing/app/lib/dashboardLayout.ts` |
| Profile assets | `frontend/src/landing/app/assets/profile/` |
