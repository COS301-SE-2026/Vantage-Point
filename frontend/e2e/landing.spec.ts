import { expect, test } from "./fixtures/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the marketing hero with both auth entry points", async ({
    page,
  }) => {
    await expect(page).toHaveTitle("Vantage Point");
    await expect(
      page.getByRole("heading", { name: /Turning every match into/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Analyse my last match" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "I already have an account" }),
    ).toBeVisible();
  });

  test("the navbar reaches sign-in and registration", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Log in" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start free" }).first(),
    ).toBeVisible();
  });

  test("the hero CTA goes to the registration form", async ({ page }) => {
    await page.getByRole("button", { name: "Analyse my last match" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("the secondary CTA goes to the sign-in form", async ({ page }) => {
    await page
      .getByRole("button", { name: "I already have an account" })
      .click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("button", { name: "Sign In", exact: true }),
    ).toBeVisible();
  });

  test("every marketing section below the hero is present", async ({
    page,
  }) => {
    for (const id of [
      "showcase",
      "workflow",
      "positioning",
      "pipeline",
      "team",
      "start",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("a navbar link scrolls to its section", async ({ page }) => {
    await page.getByRole("link", { name: "Team", exact: true }).first().click();

    // The scroll is smooth, so wait for the section to settle in the viewport
    // rather than asserting a fixed offset.
    await expect(
      page.getByRole("heading", { name: /Five students, one capstone/ }),
    ).toBeInViewport({ timeout: 10_000 });
  });

  test("does not call the backend before the user acts", async ({ api }) => {
    expect(api.calls).toHaveLength(0);
  });
});
