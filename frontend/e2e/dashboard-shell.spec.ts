import { PRIMARY_MATCH_ID } from "./fixtures/data";
import { expect, sidebar, test } from "./fixtures/test";

test.describe("Dashboard shell", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoDashboard();
  });

  test("shows the branded chrome and every nav destination", async ({
    page,
  }) => {
    await expect(page.getByText("Vantage Point").first()).toBeVisible();
    await expect(
      sidebar(page).getByRole("button", { name: "Matches" }),
    ).toBeVisible();
    await expect(
      sidebar(page).getByRole("button", { name: "Match Replay" }),
    ).toBeVisible();
    await expect(
      sidebar(page).getByRole("button", { name: "Log out" }),
    ).toBeVisible();
    // Metrics left the sidebar; "Show Analysis" in the replay toolbar is the way in.
    await expect(
      sidebar(page).getByRole("button", { name: "Metrics" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Account menu" }),
    ).toBeVisible();
  });

  test("marks the current section with aria-current", async ({ page }) => {
    await expect(
      sidebar(page).getByRole("button", { name: "Matches" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      sidebar(page).getByRole("button", { name: "Match Replay" }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  test("navigates between sections and keeps the URL in step", async ({
    page,
  }) => {
    await sidebar(page).getByRole("button", { name: "Match Replay" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/dashboard/replay/${PRIMARY_MATCH_ID}$`),
    );
    await expect(
      sidebar(page).getByRole("button", { name: "Match Replay" }),
    ).toHaveAttribute("aria-current", "page");

    await sidebar(page).getByRole("button", { name: "Matches" }).click();
    await expect(page).toHaveURL(/\/dashboard\/matches$/);
  });

  test("collapses and re-expands the navigation panel", async ({ page }) => {
    const collapse = page.getByRole("button", {
      name: "Collapse navigation panel",
    });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");

    await collapse.click();
    await expect(sidebar(page)).toBeHidden();

    const expand = page.getByRole("button", {
      name: "Expand navigation panel",
    });
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    await expand.click();
    await expect(sidebar(page)).toBeVisible();
  });

  test("account menu links through to the profile section", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Profile", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard\/profile$/);
    await expect(
      page.getByRole("region", { name: "Performance radar" }),
    ).toBeVisible();
  });

  test("shows the account name beside the avatar on the profile section only", async ({
    page,
  }) => {
    await expect(page.getByText("VantageTester#EUW")).toBeHidden();

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Profile", exact: true }).click();

    await expect(page.getByText("VantageTester#EUW").first()).toBeVisible();
  });

  test("closes the account menu with Escape", async ({ page }) => {
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(
      page.getByRole("menuitem", { name: "Profile", exact: true }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("menuitem", { name: "Profile", exact: true }),
    ).toBeHidden();
  });

  test("keeps working when the profile endpoint is down", async ({
    page,
    api,
  }) => {
    api.fail("profile", 500, "Profile service unavailable");
    await page.reload();

    await expect(sidebar(page)).toBeVisible();
    // Without a profile there is nothing to edit, so that item is not offered.
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(
      page.getByRole("menuitem", { name: "Profile", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Edit profile" }),
    ).toHaveCount(0);
  });
});
