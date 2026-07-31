import { expect, test } from "./fixtures/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the marketing hero with both auth entry points", async ({
    page,
  }) => {
    await expect(page).toHaveTitle("Vantage Point");
    await expect(page.getByRole("button", { name: "LOGIN" })).toBeVisible();
    await expect(page.getByRole("button", { name: "SIGN UP" })).toBeVisible();
  });

  test("LOGIN goes to the sign-in form", async ({ page }) => {
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("button", { name: "Sign In", exact: true }),
    ).toBeVisible();
  });

  test("SIGN UP goes to the registration form", async ({ page }) => {
    await page.getByRole("button", { name: "SIGN UP" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("does not call the backend before the user acts", async ({ api }) => {
    expect(api.calls).toHaveLength(0);
  });
});
