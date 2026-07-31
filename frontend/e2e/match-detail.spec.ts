import { PRIMARY_MATCH_ID, TEST_RIOT_ID } from "./fixtures/data";
import { expect, matchRows, test } from "./fixtures/test";

test.describe("Match detail", () => {
  test.beforeEach(async ({ app, page }) => {
    await app.signIn();
    await page.goto(`/dashboard/matches/${PRIMARY_MATCH_ID}`);
    await expect(
      page.getByRole("button", { name: "Back to matches" }),
    ).toBeVisible();
  });

  test("headlines the viewer's own result and line score", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Victory" })).toBeVisible();
    await expect(page.getByText("Jinx · 12/2/8 KDA")).toBeVisible();
  });

  test("summarises the game metadata", async ({ page }) => {
    await expect(page.getByText("32:00")).toBeVisible();
    await expect(page.getByText("Ranked Solo/Duo")).toBeVisible();
    await expect(page.getByText("Summoner's Rift").first()).toBeVisible();
    await expect(page.getByText("v14.24.1")).toBeVisible();
  });

  test("renders both scoreboards with all ten participants", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Blue Team" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Red Team" })).toBeVisible();

    const scoreboards = page.getByRole("table");
    await expect(scoreboards).toHaveCount(2);
    await expect(scoreboards.nth(0).getByRole("row")).toHaveCount(6); // header + 5
    await expect(scoreboards.nth(1).getByRole("row")).toHaveCount(6);

    await expect(page.getByText(TEST_RIOT_ID)).toBeVisible();
    await expect(page.getByText("Noxus#NA1")).toBeVisible();
  });

  test("labels the winning and losing side", async ({ page }) => {
    const blue = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Blue Team" }) })
      .first();
    const red = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Red Team" }) })
      .first();

    await expect(blue).toContainText("Victory");
    await expect(red).toContainText("Defeat");
  });

  test("lists objectives for both teams", async ({ page }) => {
    const cards = page
      .locator("section")
      .filter({ hasText: "Objectives Completed" });
    await expect(cards).toHaveCount(2);

    const blueObjectives = cards.first();
    await expect(blueObjectives).toContainText("Dragons");
    await expect(blueObjectives).toContainText("Baron");
    await expect(blueObjectives).toContainText("Herald");
    await expect(blueObjectives).toContainText("Towers");
    await expect(blueObjectives).toContainText("Inhibitors");
  });

  test("shows all ten bans", async ({ page }) => {
    const bans = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Bans" }) })
      .first();

    await expect(bans.locator("span[title]")).toHaveCount(10);
    await expect(bans.locator('span[title="Yasuo"]')).toBeVisible();
  });

  test("renders the AI coaching panel", async ({ page }) => {
    const coaching = page.getByRole("complementary", {
      name: "AI coaching comments",
    });

    await expect(coaching).toBeVisible();
    await expect(coaching.getByRole("heading")).not.toHaveCount(0);
  });

  test("goes back to the list", async ({ page }) => {
    await page.getByRole("button", { name: "Back to matches" }).click();

    await expect(page).toHaveURL(/\/dashboard\/matches$/);
    await expect(matchRows(page)).toHaveCount(6);
  });

  test("round-trips from the list and back without a reload", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Back to matches" }).click();
    await matchRows(page).filter({ hasText: "Ahri" }).click();

    await expect(page).toHaveURL(/\/dashboard\/matches\/EUW1_1005$/);
    await expect(
      page.getByRole("button", { name: "Back to matches" }),
    ).toBeVisible();
  });
});

test.describe("Match detail — failure modes", () => {
  test("reports a failed fetch", async ({ app, page, api }) => {
    api.fail("matchDetail", 500, "Match store unavailable");
    await app.signIn();

    await page.goto(`/dashboard/matches/${PRIMARY_MATCH_ID}`);

    await expect(
      page.getByRole("heading", { name: "Could not load match" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Try again later or pick another match from your matches.",
      ),
    ).toBeVisible();
  });

  test("treats an empty team list as an error", async ({ app, page, api }) => {
    api.override("matchDetail", () => ({
      json: {
        match_id: PRIMARY_MATCH_ID,
        game_creation: 0,
        game_duration: 0,
        game_version: "14.24.1",
        queue_id: 420,
        queue_label: "Ranked Solo/Duo",
        map_id: 11,
        map_label: "Summoner's Rift",
        teams: [],
      },
    }));
    await app.signIn();

    await page.goto(`/dashboard/matches/${PRIMARY_MATCH_ID}`);

    await expect(
      page.getByRole("heading", { name: "Could not load match" }),
    ).toBeVisible();
  });

  test("falls back to a neutral heading when the viewer is not in the match", async ({
    app,
    page,
    api,
  }) => {
    const detail = api.state.matchDetails[PRIMARY_MATCH_ID];
    for (const team of detail.teams) {
      for (const participant of team.participants) {
        participant.is_viewer = false;
      }
    }
    await app.signIn();

    await page.goto(`/dashboard/matches/${PRIMARY_MATCH_ID}`);

    await expect(
      page.getByRole("heading", { name: "Match details" }),
    ).toBeVisible();
  });
});
