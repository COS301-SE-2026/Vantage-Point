import { PRIMARY_MATCH_ID } from "./fixtures/data";
import { expect, matchRows, test } from "./fixtures/test";

const DAY_14 = "Matches on 14 May";
const DAY_13 = "Matches on 13 May";
const DAY_12 = "Matches on 12 May";

test.describe("Match history list", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoDashboard();
  });

  test("renders every stored match grouped by the day it was played", async ({
    page,
  }) => {
    await expect(matchRows(page)).toHaveCount(6);

    const days = page.getByRole("region", { name: /^Matches on / });
    await expect(days).toHaveCount(3);
    await expect(days.nth(0)).toHaveAccessibleName(DAY_14);
    await expect(days.nth(1)).toHaveAccessibleName(DAY_13);
    await expect(days.nth(2)).toHaveAccessibleName(DAY_12);
  });

  test("each row carries result, champion, role, KDA, CS and duration", async ({
    page,
  }) => {
    const jinx = matchRows(page).filter({ hasText: "Jinx" });

    await expect(jinx).toHaveAccessibleName(
      "View match as Jinx, Victory, role BOT, KDA 12/2/8, 210 creep score, 32 minutes",
    );
    await expect(jinx).toContainText("Victory");
    await expect(jinx).toContainText("12/2/8");
    await expect(jinx).toContainText("210");
    await expect(jinx).toContainText("32 min");
  });

  test("defaults to newest first within each day", async ({ page }) => {
    const firstDay = page.getByRole("region", { name: DAY_14 });

    await expect(firstDay.getByRole("button").first()).toContainText("Lee Sin");
  });

  test("sorts by duration, KDA, CS and oldest-first", async ({ page }) => {
    const day14 = page.getByRole("region", { name: DAY_14 });

    await page.getByRole("button", { name: /^Sort matches:/ }).click();
    await page.getByRole("menuitemradio", { name: "Duration" }).click();
    await expect(day14.getByRole("button").first()).toContainText("Jinx");

    await page.getByRole("button", { name: "Sort matches: Duration" }).click();
    await page.getByRole("menuitemradio", { name: "KDA" }).click();
    await expect(day14.getByRole("button").first()).toContainText("Jinx");

    await page.getByRole("button", { name: "Sort matches: KDA" }).click();
    await page.getByRole("menuitemradio", { name: "CS" }).click();
    await expect(day14.getByRole("button").first()).toContainText("Jinx");

    await page.getByRole("button", { name: "Sort matches: CS" }).click();
    await page.getByRole("menuitemradio", { name: "Oldest first" }).click();
    await expect(
      page.getByRole("region", { name: /^Matches on / }).first(),
    ).toHaveAccessibleName(DAY_12);
  });

  test("filters down to wins, losses and a single role", async ({ page }) => {
    const filter = page.getByRole("button", { name: /^Filter matches:/ });

    await filter.click();
    await page.getByRole("menuitemradio", { name: "Wins only" }).click();
    await expect(matchRows(page)).toHaveCount(3);
    await expect(
      page.getByRole("button", { name: "Filter matches: Wins only" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Filter matches: Wins only" })
      .click();
    await page.getByRole("menuitemradio", { name: "Losses only" }).click();
    await expect(matchRows(page)).toHaveCount(3);

    await page
      .getByRole("button", { name: "Filter matches: Losses only" })
      .click();
    await page.getByRole("menuitemradio", { name: "Jungle" }).click();
    await expect(matchRows(page)).toHaveCount(1);
    await expect(matchRows(page)).toContainText("Lee Sin");

    await page.getByRole("button", { name: "Filter matches: Jungle" }).click();
    await page.getByRole("menuitemradio", { name: "All matches" }).click();
    await expect(matchRows(page)).toHaveCount(6);
  });

  test("searches champion, role, outcome and KDA text", async ({ page }) => {
    const search = page.getByRole("searchbox", { name: "Search matches" });

    await search.fill("yasuo");
    await expect(matchRows(page)).toHaveCount(1);

    await search.fill("SUP");
    await expect(matchRows(page)).toHaveCount(1);
    await expect(matchRows(page)).toContainText("Thresh");

    await search.fill("victory");
    await expect(matchRows(page)).toHaveCount(3);

    await search.fill("");
    await expect(matchRows(page)).toHaveCount(6);
  });

  test("explains when search and filters exclude everything", async ({
    page,
  }) => {
    await page
      .getByRole("searchbox", { name: "Search matches" })
      .fill("no-such-champion");

    await expect(
      page.getByText("No matches match your search or filters."),
    ).toBeVisible();
    await expect(matchRows(page)).toHaveCount(0);
  });

  test("search and filter compose", async ({ page }) => {
    await page.getByRole("button", { name: /^Filter matches:/ }).click();
    await page.getByRole("menuitemradio", { name: "Wins only" }).click();
    await page.getByRole("searchbox", { name: "Search matches" }).fill("ahri");

    await expect(matchRows(page)).toHaveCount(1);
    await expect(matchRows(page)).toContainText("Ahri");
  });

  test("opens the detail view for the clicked match", async ({ page }) => {
    await matchRows(page).filter({ hasText: "Jinx" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/matches/${PRIMARY_MATCH_ID}$`),
    );
    await expect(
      page.getByRole("button", { name: "Back to matches" }),
    ).toBeVisible();
  });

  test("rows are reachable and activatable from the keyboard", async ({
    page,
  }) => {
    const firstRow = matchRows(page).first();
    await firstRow.focus();
    await expect(firstRow).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/dashboard\/matches\/EUW1_/);
  });
});

test.describe("Match history — sync and edge cases", () => {
  test("imports new games from Riot and reports the count", async ({
    app,
    page,
    api,
  }) => {
    api.state.syncAdds = [
      {
        match_id: "EUW1_2001",
        champion_name: "Zeri",
        outcome: "Victory",
        duration_minutes: 30,
        map_label: "Summoner's Rift",
        played_on: "2026-05-15",
        kills: 8,
        deaths: 1,
        assists: 9,
        cs: 260,
        position: "BOTTOM",
      },
    ];
    await app.gotoDashboard();
    await expect(matchRows(page)).toHaveCount(6);

    await page.getByRole("button", { name: "Sync with Riot" }).click();

    await expect(
      page.getByText("Imported 1 new match(es) from Riot."),
    ).toBeVisible();
    await expect(matchRows(page)).toHaveCount(7);
    expect(api.countOf("matchSync")).toBe(1);
    expect(api.countOf("matchHistory")).toBe(2);
  });

  test("says so when Riot has nothing new", async ({ app, page }) => {
    await app.gotoDashboard();

    await page.getByRole("button", { name: "Sync with Riot" }).click();

    await expect(page.getByText("Already up to date with Riot.")).toBeVisible();
  });

  test("shows the sync error without wiping the list", async ({
    app,
    page,
    api,
  }) => {
    await app.gotoDashboard();
    api.fail("matchSync", 503, "Riot API is unavailable");

    await page.getByRole("button", { name: "Sync with Riot" }).click();

    await expect(page.getByText("Riot API is unavailable")).toBeVisible();
    await expect(matchRows(page)).toHaveCount(6);
  });

  test("offers a first-run import when nothing is stored", async ({
    app,
    page,
    api,
  }) => {
    api.state.matches = [];
    await app.signIn();

    await page.goto("/dashboard/matches");

    await expect(
      page.getByText(
        "No matches stored yet. Pull your recent games from Riot to fill the dashboard.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Import my matches" }),
    ).toBeVisible();
  });

  test("shows a load error when the history endpoint fails", async ({
    app,
    page,
    api,
  }) => {
    api.fail("matchHistory", 500, "Database unavailable");
    await app.signIn();

    await page.goto("/dashboard/matches");

    await expect(page.getByText("Database unavailable")).toBeVisible();
    await expect(matchRows(page)).toHaveCount(0);
  });

  test("shows a loading placeholder before the list arrives", async ({
    app,
    page,
    api,
  }) => {
    api.override("matchHistory", async () => {
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      return undefined;
    });
    await app.signIn();

    await page.goto("/dashboard/matches");

    await expect(page.getByText("Loading matches…")).toBeVisible();
    await expect(matchRows(page).first()).toBeVisible({ timeout: 10_000 });
  });
});
