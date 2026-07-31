import { PRIMARY_MATCH_ID, UNLINKED_USER } from "./fixtures/data";
import { expect, test } from "./fixtures/test";

const PROTECTED_PATHS = [
  "/dashboard",
  "/dashboard/matches",
  `/dashboard/matches/${PRIMARY_MATCH_ID}`,
  "/dashboard/replay",
  "/dashboard/metrics",
  "/dashboard/profile",
  "/link-riot",
  "/loading",
];

test.describe("Route guards", () => {
  for (const path of PROTECTED_PATHS) {
    test(`sends an anonymous visitor from ${path} to the login form`, async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/login$/);
      await expect(
        page.getByRole("button", { name: "Sign In", exact: true }),
      ).toBeVisible();
    });
  }

  test("an unlinked account can reach /link-riot but not the dashboard", async ({
    app,
    page,
  }) => {
    await app.signIn({ user: UNLINKED_USER });

    await page.goto("/link-riot");
    await expect(page.getByLabel("Riot ID")).toBeVisible();

    await page.goto("/dashboard/profile");
    await expect(page).toHaveURL(/\/link-riot$/);
  });

  test("/dashboard lands on the matches tab", async ({ app, page }) => {
    await app.signIn();
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/dashboard\/matches$/);
  });

  test("legacy /link-riot-id redirects to /link-riot", async ({
    app,
    page,
  }) => {
    await app.signIn({ user: UNLINKED_USER });
    await page.goto("/link-riot-id");

    await expect(page).toHaveURL(/\/link-riot$/);
  });

  test("legacy /sign-in-loading redirects through /loading", async ({
    app,
    page,
  }) => {
    await app.signIn();
    await page.goto("/sign-in-loading");

    await expect(page).toHaveURL(/\/dashboard\/matches$/, { timeout: 10_000 });
  });

  test("legacy ?view=profile query is rewritten to the profile route", async ({
    app,
    page,
  }) => {
    await app.signIn();
    await page.goto("/dashboard?view=profile");

    await expect(page).toHaveURL(/\/dashboard\/profile$/);
  });

  test("legacy ?match= query opens that match's detail route", async ({
    app,
    page,
  }) => {
    await app.signIn();
    await page.goto(`/dashboard?match=${PRIMARY_MATCH_ID}`);

    await expect(page).toHaveURL(
      new RegExp(`/dashboard/matches/${PRIMARY_MATCH_ID}$`),
    );
  });

  test("an unknown match id renders an error rather than a blank page", async ({
    app,
    page,
  }) => {
    await app.signIn();
    await page.goto("/dashboard/matches/EUW1_does_not_exist");

    await expect(
      page.getByRole("heading", { name: "Could not load match" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Back to matches" }),
    ).toBeVisible();
  });
});
