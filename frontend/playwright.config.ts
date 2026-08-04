import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite for the Vantage Point frontend.
 *
 * Every backend call is intercepted in `e2e/fixtures/api-mock.ts`, so the suite
 * runs without the FastAPI service, Postgres or a Riot API key. Point the tests
 * at a deployed build instead with `E2E_BASE_URL=https://… npm run e2e`.
 */
/**
 * The suite runs against a production preview build by default: Vite's dev
 * server re-optimises dependencies on first load and forces a page reload,
 * which aborts in-flight fetches and makes error-path assertions flaky. Set
 * `E2E_DEV=1` for a fast local edit-and-rerun loop against `vite dev`.
 */
const USE_DEV_SERVER = process.env.E2E_DEV === "1";
const PORT = Number(process.env.E2E_PORT ?? (USE_DEV_SERVER ? 5173 : 4173));
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/** The dashboard is a fixed-width desktop layout; give it room to breathe. */
const DESKTOP_VIEWPORT = { width: 1600, height: 1000 };

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    viewport: DESKTOP_VIEWPORT,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    /** Deterministic day labels and `toLocaleString` output across machines. */
    locale: "en-GB",
    timezoneId: "UTC",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: DESKTOP_VIEWPORT },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: USE_DEV_SERVER
          ? `npm run dev -- --port ${String(PORT)} --strictPort`
          : `npm run build && npm run preview -- --port ${String(PORT)} --strictPort`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
