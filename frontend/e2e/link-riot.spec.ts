import { TEST_RIOT_ID, UNLINKED_USER } from "./fixtures/data";
import { expect, test } from "./fixtures/test";

test.describe("Linking a Riot ID", () => {
  test.beforeEach(async ({ app, page }) => {
    // Signed up, but no game account attached yet.
    await app.signIn({ user: UNLINKED_USER });
    await page.goto("/link-riot");
    await expect(page.getByLabel("Riot ID")).toBeVisible();
  });

  test("links the account and continues to the dashboard", async ({
    page,
    api,
  }) => {
    await page.getByLabel("Riot ID").fill(TEST_RIOT_ID);
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL(/\/loading$/);
    await expect(page).toHaveURL(/\/dashboard\/matches$/, { timeout: 10_000 });

    expect(api.lastBody("linkRiot")).toEqual({ riot_id: TEST_RIOT_ID });
    expect(api.state.user?.has_linked_riot).toBe(true);
  });

  test("requires the Name#TAG shape before hitting the API", async ({
    page,
    api,
  }) => {
    await page.getByLabel("Riot ID").fill("JustAName");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByRole("alert")).toHaveText(
      "Enter your Riot ID as Name#TAG (e.g. Player#EUW).",
    );
    expect(api.countOf("linkRiot")).toBe(0);
    await expect(page).toHaveURL(/\/link-riot$/);
  });

  test("shows Riot's not-found message and stays put", async ({
    page,
    api,
  }) => {
    api.state.unknownRiotIds.add("Ghost#EUW");

    await page.getByLabel("Riot ID").fill("Ghost#EUW");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByRole("alert")).toHaveText(
      'Riot ID "Ghost#EUW" was not found.',
    );
    await expect(page).toHaveURL(/\/link-riot$/);
  });

  test("shows a pending label while Riot is queried", async ({ page, api }) => {
    api.override("linkRiot", async () => {
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      return undefined;
    });

    await page.getByLabel("Riot ID").fill(TEST_RIOT_ID);
    await page.getByRole("button", { name: "Submit" }).click();

    const pending = page.getByRole("button", { name: "Linking…" });
    await expect(pending).toBeVisible();
    await expect(pending).toBeDisabled();
  });

  test("blocks the dashboard until an account is linked", async ({ page }) => {
    await page.goto("/dashboard/matches");

    await expect(page).toHaveURL(/\/link-riot$/);
  });

  test("hides social sign-in buttons on this step", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /with (Google|Apple|Riot Games)$/ }),
    ).toHaveCount(0);
  });
});
