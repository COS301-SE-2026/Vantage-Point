import type { Page } from "@playwright/test";
import { PRIMARY_MATCH_ID } from "./fixtures/data";
import { expect, test } from "./fixtures/test";

const METRICS_URL = new RegExp(`/dashboard/metrics/${PRIMARY_MATCH_ID}$`);

function metricsPanel(page: Page) {
  return page.getByRole("complementary", { name: "Live performance metrics" });
}

function analysisTable(page: Page) {
  return page.getByRole("table");
}

function transport(page: Page) {
  return page.getByRole("group", { name: "Replay transport" });
}

test.describe("Metrics / map analysis", () => {
  test.beforeEach(async ({ app, page }) => {
    await app.signIn();
    await page.goto("/dashboard/metrics");
    await expect(page).toHaveURL(METRICS_URL);
    await expect(analysisTable(page)).toBeVisible();
  });

  test("redirects the bare metrics route to the most recent match", async ({
    page,
  }) => {
    await expect(page).toHaveURL(METRICS_URL);
  });

  test("summarises recent form from the live Riot averages", async ({
    page,
    api,
  }) => {
    const panel = metricsPanel(page);

    await expect(panel).toContainText("Recent form · last 5 games");
    await expect(panel).toContainText("60%"); // win rate
    await expect(panel).toContainText("8.2 / 3.4 / 6.1"); // avg KDA
    await expect(panel).toContainText("62%"); // kill participation
    await expect(panel).toContainText("7.4"); // CS per minute
    await expect(panel).toContainText("24.5"); // vision

    // The view asks for a five-game window.
    expect(api.callsTo("liveMetrics").at(-1)?.search).toContain("count=5");
  });

  test("renders the map analysis grid with all five stat rows", async ({
    page,
  }) => {
    const table = analysisTable(page);

    for (const heading of [
      "Team Stats",
      "Player Stats",
      "Skills",
      "Last 5 Items",
      "Objectives",
    ]) {
      await expect(
        table.getByRole("columnheader", { name: heading }),
      ).toBeVisible();
    }

    // Header row plus Health / Damage / Armor / Movement Speed / Level.
    await expect(table.getByRole("row")).toHaveCount(6);
    await expect(table).toContainText("Health");
    await expect(table).toContainText("Damage");
    await expect(table).toContainText("Armor");
    await expect(table).toContainText("Movement Speed");
    await expect(table).toContainText("Level");
    await expect(table).toContainText("Rift Herald");
  });

  test("names the ability and the item in every slot", async ({ page }) => {
    const table = analysisTable(page);

    // Riot reports slot numbers and item ids; the names come from Data Dragon.
    await expect(table).toContainText("Q · Switcheroo!");
    await expect(table).toContainText("W · Zap!");
    await expect(table).toContainText("E · Flame Chompers!");
    await expect(table).toContainText("R · Super Mega Death Rocket!");
    await expect(table).toContainText("Passive · Get Excited!");

    await expect(table).not.toContainText("SkillSlot_");
    await expect(table).not.toContainText("Item_");
  });

  test("plays, steps and rewinds the analysis clock", async ({ page }) => {
    const bar = transport(page);
    await expect(bar.getByText("0:00")).toBeVisible();

    await bar.getByRole("button", { name: "Forward 30 seconds" }).click();
    await expect(bar.getByText("0:30")).toBeVisible();

    await bar.getByRole("button", { name: "Back 30 seconds" }).click();
    await expect(bar.getByText("0:00")).toBeVisible();

    await bar.getByRole("button", { name: "Play replay" }).click();
    await expect(
      bar.getByRole("button", { name: "Pause replay" }),
    ).toBeVisible();
    await expect(bar.getByText("0:00")).toBeHidden();

    await bar.getByRole("button", { name: "Rewind replay" }).click();
    await expect(bar.getByText("0:00")).toBeVisible();
    await expect(
      bar.getByRole("button", { name: "Play replay" }),
    ).toBeVisible();
  });

  test("goes back to the replay of the same match", async ({ page }) => {
    await page.getByRole("button", { name: "Back to match replay" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/replay/${PRIMARY_MATCH_ID}$`),
    );
  });

  test("shows the minimap with live champion markers", async ({ page }) => {
    await expect(page.getByAltText("Match minimap")).toBeVisible();
    await expect(page.locator('[data-name="replay-overlay"] img')).toHaveCount(
      1,
    );
  });

  test("carries the replay tool rail and coaching bar", async ({ page }) => {
    await expect(
      page.getByRole("complementary", { name: "Match replay tools" }),
    ).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "AI coaching recommendations" }),
    ).toBeVisible();
  });

  test("overlay toggles work against the minimap too", async ({ page }) => {
    const showPath = page.getByRole("button", { name: "Show Path" });

    await showPath.click();
    await expect(showPath).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('[data-name="replay-overlay"] polyline'),
    ).toHaveCount(1);
  });
});

test.describe("Metrics — degraded data", () => {
  test("falls back when Riot returns no recent games", async ({
    app,
    page,
    api,
  }) => {
    api.state.liveMetrics = { ...api.state.liveMetrics, games_analyzed: 0 };
    await app.signIn();

    await page.goto(`/dashboard/metrics/${PRIMARY_MATCH_ID}`);

    await expect(
      metricsPanel(page).getByText(
        "No recent games available from Riot for this account.",
      ),
    ).toBeVisible();
  });

  test("shows the live-metrics error but still renders the analysis", async ({
    app,
    page,
    api,
  }) => {
    api.fail("liveMetrics", 502, "Riot API rate limit reached");
    await app.signIn();

    await page.goto(`/dashboard/metrics/${PRIMARY_MATCH_ID}`);

    await expect(
      metricsPanel(page).getByText("Riot API rate limit reached"),
    ).toBeVisible();
    await expect(analysisTable(page)).toBeVisible();
  });

  test("falls back to end-of-game values when no timeline exists", async ({
    app,
    page,
    api,
  }) => {
    api.fail("matchTimeline", 404, "Timeline not stored");
    await app.signIn();

    await page.goto(`/dashboard/metrics/${PRIMARY_MATCH_ID}`);

    const table = analysisTable(page);
    await expect(table).toBeVisible();
    // No frames means the live-only columns render the em-dash placeholder.
    await expect(table.getByText("—").first()).toBeVisible();
    // Final objective counts still come from the match detail.
    await expect(table).toContainText("Rift Herald");
  });

  test("reports when the account has no matches to analyse", async ({
    app,
    page,
    api,
  }) => {
    api.state.matches = [];
    await app.signIn();

    await page.goto("/dashboard/metrics");

    await expect(
      page.getByText("No matches available for metrics"),
    ).toBeVisible();
  });
});
