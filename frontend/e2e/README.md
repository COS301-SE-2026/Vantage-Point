# End-to-end tests

Playwright specs that drive the real frontend in Chromium. **No backend, database
or Riot API key is required** — every request the app makes is intercepted and
answered from fixtures, so the suite is hermetic, offline and deterministic.

## Running

From the repo root, which installs the browser for you on a new machine:

```bash
./scripts/e2e.sh                 # build + preview + run everything
./scripts/e2e.sh --ui            # interactive runner
./scripts/e2e.sh -- profile      # only specs whose filename matches "profile"
./scripts/e2e.sh --report        # open the last HTML report
./scripts/e2e.sh --help          # every flag
```

Or from `frontend/` directly:

```bash
npm run e2e              # build + preview + run everything
npm run e2e:ui           # interactive runner
npm run e2e -- profile   # only specs whose filename matches "profile"
npm run e2e:report       # open the last HTML report
```

The npm scripts assume the Chromium binary is already downloaded. Fetch it with
`npm run e2e:install` (or `./scripts/e2e.sh --install`); `scripts/e2e.sh` does
this for you when it is missing.

Useful environment variables:

| Variable       | Effect                                                                |
| -------------- | --------------------------------------------------------------------- |
| `E2E_DEV=1`    | Serve with `vite dev` instead of a preview build (faster to re-run)\* |
| `E2E_PORT`     | Port for the local server (default 4173, or 5173 with `E2E_DEV`)      |
| `E2E_BASE_URL` | Run against an already-running server (no server is started)          |

\* The dev server re-optimises dependencies on first load and forces a page
reload, which can abort an in-flight fetch and make error-path assertions flaky.
The preview build is the default for that reason.

## Layout

```
e2e/
  fixtures/
    data.ts       Wire-shaped payloads (snake_case, exactly what FastAPI returns)
    api-mock.ts   Request interception + mutable server state per test
    test.ts       `test` / `expect` with the `api` and `app` fixtures attached
  *.spec.ts       One file per user-facing area
```

## Writing a spec

Import from `./fixtures/test`, never from `@playwright/test` directly — that is
what wires in the mocked backend.

```ts
import { expect, test } from "./fixtures/test";

test("does the thing", async ({ app, page, api }) => {
  await app.gotoDashboard(); // seeds tokens, lands on /dashboard/matches
  await expect(page.getByRole("button", { name: "Matches" })).toBeVisible();
  expect(api.countOf("matchHistory")).toBe(1);
});
```

### The `app` fixture

- `app.signIn({ user })` — plant tokens in `localStorage` so the app boots
  authenticated. Call **before** the first `page.goto`. Pass `UNLINKED_USER` to
  simulate an account with no Riot ID attached.
- `app.gotoDashboard(path?)` — `signIn` plus a navigation, waiting for the shell.
- `app.consoleErrors` — console errors and page errors seen so far.

### The `api` fixture

Installed automatically for every test, so nothing escapes to a real network.

- `api.state` — mutable server state: `user`, `profile`, `matches`,
  `matchDetails`, `timelines`, `liveMetrics`, `revokedAccessTokens`,
  `unknownRiotIds`, `syncAdds`. Mutate it **before** navigating.
- `api.fail(endpoint, status, detail)` — make one endpoint return an error.
- `api.override(endpoint, handler)` — full control; returning `undefined` (after
  a delay, say) falls through to the default handler.
- `api.once(endpoint, handler)` — applies to the next call only. Used to force a
  single 401 and assert the refresh-and-retry path.
- `api.calls`, `api.callsTo(name)`, `api.countOf(name)`, `api.lastBody(name)` —
  assert on what the app actually sent, including the `Authorization` header.

Endpoint names are listed in `EndpointName` in `api-mock.ts` and map 1:1 to the
backend routes the frontend calls.

## Coverage

| Spec                      | Area                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| `landing.spec.ts`         | Marketing page: hero, section coverage, anchors, auth entry points       |
| `auth-login.spec.ts`      | Sign in: success, wrong password, API down, pending state, toggles       |
| `auth-register.spec.ts`   | Sign up: client validation, duplicate email, FastAPI detail lists        |
| `link-riot.spec.ts`       | Riot ID linking: format check, Riot 404, success, gating                 |
| `route-guards.spec.ts`    | Auth/Riot guards on every route plus the legacy path and query redirects |
| `session.spec.ts`         | Token refresh and retry, single-flight refresh, expiry, logout           |
| `dashboard-shell.spec.ts` | Sidebar, nav state, account menu, profile-endpoint outage                |
| `matches-list.spec.ts`    | Grouping, sort, filter, search, sync, empty and error states             |
| `match-detail.spec.ts`    | Scoreboards, objectives, bans, coaching panel, failure modes             |
| `match-replay.spec.ts`    | Clock, scrubbing, zoom, overlays, player selection, missing timeline     |
| `metrics.spec.ts`         | Live metrics panel, map analysis grid, transport, degraded data          |
| `profile.spec.ts`         | Radar, featured game, champions, edit dialog, avatar upload/removal      |

## Gotchas

- Backend requests are matched on **origin** (`VITE_API_URL`, default
  `http://localhost:8000`), not on a `/api/` path glob — the app's own source
  lives in `src/api/`, which a path glob would also intercept in dev.
- `getByRole(..., { name })` matches substrings by default. `"Profile"` also
  matches `"Edit profile"`, and `"Sign In"` also matches `"Sign in with Google"`;
  pass `exact: true` when a name is a prefix of another.
- The suite pins `locale: en-GB` and `timezoneId: UTC` so date labels such as
  `"14 May"` are stable across machines.
- Riot's Data Dragon CDN is stubbed with a 1×1 PNG; champion and item art never
  leaves the machine.
