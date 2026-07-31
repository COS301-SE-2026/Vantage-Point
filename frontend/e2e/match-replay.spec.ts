import type { Page } from "@playwright/test";
import { PRIMARY_MATCH_ID } from "./fixtures/data";
import { expect, test } from "./fixtures/test";

const REPLAY_URL = new RegExp(`/dashboard/replay/${PRIMARY_MATCH_ID}$`);

function overlay(page: Page) {
  return page.locator('[data-name="replay-overlay"]');
}

/** The map pane holds the clock badge, the zoom readout and the overlay. */
function mapPane(page: Page) {
  return page.locator('[data-name="Map"]');
}

function progressSlider(page: Page) {
  return page.getByRole("slider", { name: "Replay progress" });
}

/** Range inputs ignore fill(); End/Home move them and fire React's onChange. */
async function scrubToEnd(page: Page) {
  await progressSlider(page).focus();
  await page.keyboard.press("End");
}

test.describe("Match replay", () => {
  test.beforeEach(async ({ app, page }) => {
    await app.signIn();
    await page.goto("/dashboard/replay");
    await expect(page).toHaveURL(REPLAY_URL);
    await expect(page.getByAltText("Summoner's Rift map")).toBeVisible();
  });

  test("redirects the bare replay route to the most recent match", async ({
    page,
  }) => {
    await expect(page).toHaveURL(REPLAY_URL);
  });

  test("shows the viewer's scoreline above the map", async ({ page }) => {
    const menu = page.locator('[data-name="MatchMenu"]');

    await expect(menu).toContainText("Victory");
    await expect(menu).toContainText("Jinx");
    await expect(menu).toContainText("BOT");
    await expect(menu).toContainText("12/2/8");
    await expect(menu).toContainText("32 min");
  });

  test("starts paused at 0:00 with the timeline loaded", async ({ page }) => {
    await expect(
      mapPane(page).getByText("0:00", { exact: true }),
    ).toBeVisible();
    await expect(progressSlider(page)).toHaveValue("0");
    await expect(
      page.getByRole("button", { name: "Play replay" }),
    ).toBeVisible();
    // Champion markers only render once frames are in.
    await expect(overlay(page).locator("img")).toHaveCount(1);
  });

  test("plays and pauses the clock", async ({ page }) => {
    await page.getByRole("button", { name: "Play replay" }).click();
    await expect(
      page.getByRole("button", { name: "Pause replay" }),
    ).toBeVisible();
    await expect(progressSlider(page)).not.toHaveValue("0");

    await page.getByRole("button", { name: "Pause replay" }).click();
    const paused = await progressSlider(page).inputValue();
    await page.waitForTimeout(600);
    await expect(progressSlider(page)).toHaveValue(paused);
  });

  test("scrubbing jumps the clock to the end of the game", async ({ page }) => {
    await scrubToEnd(page);

    await expect(progressSlider(page)).toHaveValue("100");
    await expect(
      mapPane(page).getByText("32:00", { exact: true }),
    ).toBeVisible();
  });

  test("zoom steps in and out and clamps at both ends", async ({ page }) => {
    const zoomIn = page.getByRole("button", { name: "Zoom in" });
    const zoomOut = page.getByRole("button", { name: "Zoom out" });
    const readout = page.locator('[data-name="Zoom controls"] span');

    await expect(readout).toHaveText("0%");

    await zoomIn.click();
    await zoomIn.click();
    await expect(readout).toHaveText("20%");

    await zoomOut.click();
    await expect(readout).toHaveText("10%");

    await zoomOut.click();
    await zoomOut.click();
    await expect(readout).toHaveText("0%");
  });

  test("expands and collapses the tool rail", async ({ page }) => {
    const rail = page.getByRole("complementary", {
      name: "Match replay tools",
    });
    const expand = page.getByRole("button", { name: "Expand replay tools" });
    await expect(expand).toHaveAttribute("aria-expanded", "false");

    await expand.click();
    await expect(rail).toContainText("Show Kills");
    await expect(rail).toContainText("Show Path");
    await expect(rail).toContainText("Change Map");

    await page.getByRole("button", { name: "Collapse replay tools" }).click();
    await expect(rail).not.toContainText("Show Kills");
  });

  test("toggling Show Path draws the traversed route", async ({ page }) => {
    await scrubToEnd(page);
    await expect(overlay(page).locator("polyline")).toHaveCount(0);

    const showPath = page.getByRole("button", { name: "Show Path" });
    await showPath.click();
    await expect(showPath).toHaveAttribute("aria-pressed", "true");
    await expect(overlay(page).locator("polyline")).toHaveCount(1);

    await showPath.click();
    await expect(showPath).toHaveAttribute("aria-pressed", "false");
    await expect(overlay(page).locator("polyline")).toHaveCount(0);
  });

  test("Show Analysis opens the metrics view for this match", async ({
    page,
  }) => {
    // Metrics is no longer in the sidebar, so this button is the only way through.
    // It navigates rather than toggling an overlay, and carries the match with it.
    await page.getByRole("button", { name: "Show Analysis" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/metrics/${PRIMARY_MATCH_ID}$`),
    );
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("Show Kills and Show Deaths mark the viewer's fights", async ({
    page,
  }) => {
    await scrubToEnd(page);
    const markers = overlay(page).locator("span[title]");
    await expect(markers).toHaveCount(0);

    await page.getByRole("button", { name: "Show Kills" }).click();
    await expect(markers).toHaveCount(1); // the 5' kill by the viewer

    await page.getByRole("button", { name: "Show Deaths" }).click();
    await expect(markers).toHaveCount(2); // plus the 12' death

    await page.getByRole("button", { name: "Show Kills" }).click();
    await expect(markers).toHaveCount(1);
  });

  test("player selection controls which champions are tracked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Select Players" }).click();
    const list = page.getByRole("complementary", { name: "Select players" });
    await expect(list).toBeVisible();
    await expect(list.getByRole("button")).toHaveCount(10);

    // The signed-in player starts selected; everyone else does not.
    await expect(
      list.getByRole("button", { name: /VantageTester#EUW/ }),
    ).toHaveAttribute("aria-pressed", "true");
    const darius = list.getByRole("button", { name: /Noxus#NA1/ });
    await expect(darius).toHaveAttribute("aria-pressed", "false");

    await darius.click();
    await expect(darius).toHaveAttribute("aria-pressed", "true");
    await expect(overlay(page).locator("img")).toHaveCount(2);

    await page.getByRole("button", { name: "Select Players" }).click();
    await expect(list).toBeHidden();
  });

  test("collapsing the rail also closes the player list", async ({ page }) => {
    await page.getByRole("button", { name: "Expand replay tools" }).click();
    await page.getByRole("button", { name: "Select Players" }).click();
    await expect(
      page.getByRole("complementary", { name: "Select players" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Collapse replay tools" }).click();
    await expect(
      page.getByRole("complementary", { name: "Select players" }),
    ).toBeHidden();
  });

  test("renders coaching notes for the replay", async ({ page }) => {
    const coaching = page.getByRole("complementary", {
      name: "AI coaching comments",
    });

    await expect(coaching).toBeVisible();
    await expect(coaching.getByRole("heading")).not.toHaveCount(0);
  });
});

test.describe("Match replay — degraded data", () => {
  test("keeps the map usable when no timeline is stored", async ({
    app,
    page,
    api,
  }) => {
    api.fail("matchTimeline", 404, "No replay data available for this match");
    await app.signIn();

    await page.goto(`/dashboard/replay/${PRIMARY_MATCH_ID}`);

    await expect(page.getByAltText("Summoner's Rift map")).toBeVisible();
    await expect(
      page.getByText("No replay data available for this match"),
    ).toBeVisible();
    await expect(overlay(page)).toHaveCount(0);
  });

  test("explains when the account has no matches to replay", async ({
    app,
    page,
    api,
  }) => {
    api.state.matches = [];
    await app.signIn();

    await page.goto("/dashboard/replay");

    await expect(
      page.getByText("No matches available for replay"),
    ).toBeVisible();
  });

  test("surfaces a failed match fetch", async ({ app, page, api }) => {
    api.fail("matchDetail", 500, "Match store unavailable");
    await app.signIn();

    await page.goto(`/dashboard/replay/${PRIMARY_MATCH_ID}`);

    await expect(page.getByText("Match store unavailable")).toBeVisible();
  });

  test("says so when the match has no viewer participant", async ({
    app,
    page,
    api,
  }) => {
    for (const team of api.state.matchDetails[PRIMARY_MATCH_ID].teams) {
      for (const participant of team.participants) {
        participant.is_viewer = false;
      }
    }
    await app.signIn();

    await page.goto(`/dashboard/replay/${PRIMARY_MATCH_ID}`);

    await expect(
      page.getByText("Match loaded, but no viewer participant was found."),
    ).toBeVisible();
  });
});
