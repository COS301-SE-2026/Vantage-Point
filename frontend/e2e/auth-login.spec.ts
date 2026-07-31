import { TEST_EMAIL, TEST_PASSWORD } from "./fixtures/data";
import { expect, test } from "./fixtures/test";

test.describe("Sign in", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("takes a linked account through the loading screen to the dashboard", async ({
    page,
    api,
  }) => {
    await page.getByLabel("Username or Email").fill(TEST_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    await expect(page).toHaveURL(/\/loading$/);
    await expect(
      page.getByRole("status", { name: "Loading your dashboard" }),
    ).toBeVisible();

    await expect(page).toHaveURL(/\/dashboard\/matches$/, { timeout: 10_000 });
    await expect(
      page.getByRole("navigation", { name: "Dashboard navigation" }),
    ).toBeVisible();

    // The Cognito login endpoint takes query parameters, not a JSON body.
    const search = new URLSearchParams(api.callsTo("login").at(-1)?.search);
    expect(Object.fromEntries(search)).toEqual({
      username: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
  });

  test("stores both tokens for later requests", async ({ page, api }) => {
    await page.getByLabel("Username or Email").fill(TEST_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/matches$/, { timeout: 10_000 });

    const stored = await page.evaluate(() => ({
      access: window.localStorage.getItem("vp_access_token"),
      refresh: window.localStorage.getItem("vp_refresh_token"),
    }));
    expect(stored.access).toBe(api.state.accessToken);
    expect(stored.refresh).toBe(api.state.refreshToken);

    // The dashboard requests must be authenticated with the stored token.
    expect(api.callsTo("matchHistory").at(-1)?.bearer).toBe(stored.access);
  });

  test("sends an account without a Riot ID to the linking step", async ({
    page,
    api,
  }) => {
    api.state.user = {
      ...api.state.user!,
      riot_id_tag: null,
      has_linked_riot: false,
    };

    await page.getByLabel("Username or Email").fill(TEST_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    await expect(page).toHaveURL(/\/link-riot$/);
    await expect(page.getByLabel("Riot ID")).toBeVisible();
  });

  test("surfaces the backend message for bad credentials", async ({ page }) => {
    await page.getByLabel("Username or Email").fill(TEST_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    await expect(page.getByRole("alert")).toHaveText(
      "Incorrect email or password",
    );
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("button", { name: "Sign In", exact: true }),
    ).toBeEnabled();
  });

  test("falls back to a generic message when the API is unreachable", async ({
    page,
    api,
  }) => {
    api.override("login", () => ({ status: 502, body: "<html>bad gateway" }));

    await page.getByLabel("Username or Email").fill(TEST_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("disables the submit button while the request is in flight", async ({
    page,
    api,
  }) => {
    api.override("login", async () => {
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      return undefined; // fall through to the real handler
    });

    await page.getByLabel("Username or Email").fill(TEST_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    const submit = page.getByRole("button", { name: "Sign In", exact: true });
    await submit.click();

    const pending = page.getByRole("button", { name: "Signing in…" });
    await expect(pending).toBeVisible();
    await expect(pending).toBeDisabled();
  });

  test("toggles password visibility", async ({ page }) => {
    const password = page.getByLabel("Password", { exact: true });
    await password.fill(TEST_PASSWORD);
    await expect(password).toHaveAttribute("type", "password");

    await page
      .getByRole("button", { name: "Show password", exact: true })
      .click();
    await expect(password).toHaveAttribute("type", "text");

    await page
      .getByRole("button", { name: "Hide password", exact: true })
      .click();
    await expect(password).toHaveAttribute("type", "password");
  });

  test("tells the user social sign-in is not wired up yet", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sign in with Google" }).click();

    await expect(page.getByRole("alert")).toHaveText(
      "Social sign-in is coming soon.",
    );
  });

  test("offers a route to registration", async ({ page }) => {
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page).toHaveURL(/\/register$/);
  });
});
