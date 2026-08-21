# Brand Style

This doc maps the Vantage Point brand to the files that implement it.

**Live page:** `/style-guide` in the frontend app. Use that for demos and
marking. It covers colour, type, logo, tokens, components, layout,
accessibility, and voice, and it renders in the same palette and
face as the product, so it is a working sample rather than a description of one.

Vantage Point is **one dark theme**, not a light theme with a dark mode. The
landing page, auth, and the dashboard all set `dark` and `font-beaufort` on
their own root and inherit from there. Nothing follows the OS colour scheme.

---

## Colour

The palette lives in `frontend/src/styles/theme.css` under `@theme inline` as
`--color-vp-*` tokens, and reaches components as ordinary Tailwind utilities
(`bg-vp-surface`, `text-vp-dim`, `border-vp-line`). Because they are declared
`inline`, Tailwind compiles the value into the class and emits no runtime custom
property: read them from the stylesheet, not from `getComputedStyle`.

Three greys carry the depth, two hairlines carry the structure, gold is the only
accent, and win and loss are the only other colours. Anything needing more
emphasis earns it with type or spacing, not another hue.

| Role | Utility | Value | Where |
|------|---------|-------|-------|
| Canvas | `bg-vp-canvas` | `#0b0c0f` | Page ground, header band |
| Surface | `bg-vp-surface` | `#131519` | Panels, sidebar rail, auth card |
| Raised | `bg-vp-raised` | `#1b1e25` | Stat tiles, inputs, active rail row |
| Line | `border-vp-line` | `rgba(255,255,255,0.09)` | Hairline between surfaces |
| Line strong | `border-vp-line-strong` | `rgba(255,255,255,0.18)` | Ghost buttons, dashed empty states |
| Ink | `text-vp-ink` | `#eceef2` | Primary text, headings, figures |
| Dim | `text-vp-dim` | `#9ba0a9` | Secondary text, panel captions |
| Faint | `text-vp-faint` | `#6b7079` | Placeholders and metadata only |
| Gold | `text-vp-gold` | `#e0b46c` | Active markers, primary buttons, eyebrows, focus |
| Gold dim | `text-vp-gold-dim` | `#a97f3e` | Gradients and pressed states |
| Win | `text-vp-win` | `#46c97e` | Victory outcomes, positive deltas |
| Loss | `text-vp-loss` | `#e2565c` | Defeats, errors, negative deltas |

Depth comes from a lighter fill plus a hairline, never a drop shadow: on a
near-black canvas a shadow reads as smudge rather than lift. The only blur in
the product is `backdrop-blur-md` under the sticky header and the auth card.

**shadcn tokens** in `:root` and `.dark` are still live, because the vendored
primitives in `components/ui/` are written against them. Every screen that
renders one wraps it in `dark`. Prefer the vp palette for anything you lay out
yourself.

`vp-faint` is deliberately below AA. It marks text that is not content:
placeholders, tile captions, inactive icons. Never set a sentence in it. Full
contrast table on `/style-guide#colour`.

---

## Typography

| Family | Role | Source |
|--------|------|--------|
| **Beaufort for LOL** | The product face: headings, body, buttons, stats, small caps | Self-hosted OTF, 400 / 500 / 700 |
| **League Spartan** | Wordmark only | Self-hosted variable woff2, 400 to 700 |
| **Inter** | Legacy. Admin shell, profile header editor, route guards | Google Fonts (OFL) |

Set the face once on a page root with `font-beaufort` and let it inherit. Strip
any hardcoded `font-sans` from vendored components that would beat the
inheritance. `font-spartan` opts back out for the wordmark, and nothing else.

Beaufort is a display serif and gives up more than a sans at small sizes. Keep
running copy at **13px or above**. Below that, use it only for uppercase labels
with wide tracking.

Named scale (wordmark, auth title, page title, stat value, header title, body,
meta, eyebrow, panel caption, tile label): see `/style-guide#typography`.

`styles/fonts.css` still fetches **Geist, Sarina, and Sora**, which nothing
renders. They are blocking requests on every page load and can be dropped.

---

## Logo and iconography

- **Primary mark:** `frontend/src/assets/images/logos/logo-mark-white.webp`.
  Every product surface is dark, so the white cut is the one the app ships.
- **Lockup:** mark at 32px, 10px gap, wordmark at 14px League Spartan uppercase
  with `0.06em` tracking. Used by the sidebar, the auth header, and the landing
  nav.
- **Light plate:** `logo-mark.webp` is the full colour cut for print or white
  backgrounds. `logo.webp` survives only in the admin shell.
- **Clear space:** at least a quarter of the mark height on all sides. No
  stretch, skew, rotation, recolour, shadow, glow, or crop. Over champion art
  the mark needs a plate.
- **Icons are functional, never decorative.** A glyph earns its place by being
  the control: a nav destination, a toggle, a transport button. Decorative
  pictograms above card titles are against the guide. Chrome uses lucide-react
  at 18px with stroke 1.7.
- **`ThemedIcon`** keeps light and dark Figma exports side by side but renders
  only the dark one. It no longer swaps on the device theme.

---

## Design tokens

Layout and chart values live in `:root`, colour lives in `@theme inline`, and
the sidebar widths are TypeScript because the rail animates between them.

| Token | Value | Purpose |
|-------|-------|---------|
| `--vp-dash-max` | `1440px` | Max width of a dashboard tab column (`PageContainer`) |
| `--vp-content-max` | `1180px` | Narrower cap used by the metrics column |
| `--vp-chart-grid` / `--vp-chart-label` | `#d4d4d4` / `#9ba0a9` | Radar web and axis labels. The label mirrors `--color-vp-dim` |
| `--radius` | `0.625rem` | Base radius the shadcn primitives derive from |

`lib/dashboardLayout.ts`: `DASHBOARD_SIDEBAR_WIDTH` **232px**,
`DASHBOARD_RAIL_WIDTH` **68px**.

Radius ladder: `rounded-lg` for controls, `rounded-xl` for panels, `rounded-2xl`
for the auth card, `rounded-full` for avatars and pills. An element never shares
a corner radius with its own container.

**Known drift, listed rather than quietly carried:**

- `--vp-layout-max`, `--vp-dashboard-header`, `--vp-sidebar-width`,
  `--vp-sidebar-left`, and `--vp-content-gap` are declared in `:root` and read
  by nothing. They date from the absolutely positioned Figma frame.
- `.vp-scrollbar` still paints the old light spec and only switches track colour
  when the *device* theme is dark, so it never matches `#0b0c0f`.
- The radar series is hardcoded to `#22c55e` rather than `--color-vp-win`, so
  the one green on the profile panel is not the green the palette defines.
- `animate-vantage-pulse` has no callers.

---

## Components

`frontend/src/components/dashboard/primitives.tsx` is the component library:
`PageContainer`, `PageHeading`, `Panel`, `PanelHeader`, `StatTile`,
`EmptyState`, `ErrorNote`, `ChampionIcon`, and one `Button` in three weights
(primary gold, ghost, quiet). Each tab used to spell out its own hex values and
paddings, which is how the old screens drifted apart.

- **Auth:** `AuthScreen` wraps login, register, and Riot ID. Fields are raised
  fill, hairline border, gold caret, gold focus warm. Primary CTA is gold with a
  black label.
- **Dashboard:** `DashboardShell`. Rail destinations are Matches and Match
  Replay, with Log out at the foot of the same landmark. The active marker is a
  2px gold rule against the rail edge, not a filled pill.
- **shadcn (`components/ui/`):** kept for the things that need real behaviour:
  Dialog, Select, Avatar, dropdown menus, Sonner toasts.

Live demos on `/style-guide#components` import the real components, so they
cannot drift.

---

## Layout

The dashboard used to be an absolutely positioned copy of a 1512px Figma frame:
every view computed its own `left` and `width` and pinned itself under a fixed
header. It could not reflow. It is an ordinary flex layout now, sidebar beside a
scrolling main column.

- Sidebar: sticky, full height, `bg-vp-surface`, right hairline, animating
  232px to 68px over 0.22s. The header toggle is the only thing that opens it.
- Header: sticky, 64px, `bg-vp-canvas/85` with a backdrop blur.
- Content: `PageContainer` caps at `--vp-dash-max`, gutters 20px opening to 28px
  above `sm`.
- Auth: one column below `lg`; above it the form takes 46% with a 440px floor.
- Landing: full bleed, fixed navbar that shrinks to a pill past 100px.

Nothing positions itself. A tab renders content and lets the shell place it.

---

## Accessibility

- Target: **WCAG 2.2 AA**, AAA for running copy where the surface allows. Ink on
  canvas and ink on surface both clear AAA.
- Focus: product controls warm the border to `vp-gold/60` with a soft
  `ring-vp-gold/15`; vendored primitives keep `focus-visible:ring-[3px]` against
  `--ring`.
- Motion: `prefers-reduced-motion: reduce` switches off every brand animation in
  `theme.css`. The rail resize and label cross-fade are framer transitions and
  are not covered by it.
- Theme: one dark theme on every device, so nothing depends on an OS setting the
  user may not control. `device-dark:` remains in `theme.css` but only the route
  guards still use it.

---

## Voice and tone

Short, specific, addressed to a player who is already frustrated. Say what
happened on the map. Do not congratulate and do not lecture. Verb-led buttons,
errors that say what to do next, empty states that give exactly one next step.

**No em dashes or en dashes in user-facing copy.** Rewrite rather than swapping
the glyph: a colon when the second half explains the first, a comma when it is
an aside, a full stop when it is really two thoughts.

Full rules on `/style-guide#voice`.

---

## Source reference

| Topic | Primary files |
|-------|----------------|
| Live brand guide | `frontend/src/pages/StyleGuidePage.tsx`, `frontend/src/pages/style-guide/*` |
| Palette and tokens | `frontend/src/styles/theme.css` |
| Fonts | `frontend/src/styles/fonts.css`, `frontend/src/assets/fonts/` |
| Component library | `frontend/src/components/dashboard/primitives.tsx` |
| Vendored primitives | `frontend/src/components/ui/` |
| Auth | `frontend/src/components/auth/AuthScreen.tsx` |
| Dashboard shell | `frontend/src/components/DashboardShell.tsx` |
| Themed icons | `frontend/src/components/ThemedIcon.tsx` |
| Shell measurements | `frontend/src/lib/dashboardLayout.ts` |
| Logos | `frontend/src/assets/images/logos/` |
| Landing | `frontend/src/pages/LandingPage.tsx`, `frontend/src/landing/` |
| Route | `frontend/src/Routes.tsx` → `/style-guide` |
