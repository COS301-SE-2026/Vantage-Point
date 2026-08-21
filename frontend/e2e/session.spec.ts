import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  ROTATED_ACCESS_TOKEN,
} from "./fixtures/data";
import { expect, matchRows, test } from "./fixtures/test";

test.describe("Session handling", () => {
  test("refreshes an expired access token and retries the request", async ({
    app,
    page,
    api,
  }) => {
    api.state.revokedAccessTokens.add(ACCESS_TOKEN);
    await app.signIn({ accessToken: ACCESS_TOKEN });

    await page.goto("/dashboard/matches");

    await expect(
      page.getByRole("navigation", { name: "Dashboard navigation" }),
    ).toBeVisible();
    await expect(matchRows(page).first()).toBeVisible();

    expect(api.countOf("refresh")).toBe(1);
    // The retry, and everything after it, carries the rotated token.
    expect(api.callsTo("me").at(-1)?.bearer).toBe(ROTATED_ACCESS_TOKEN);

    const stored = await page.evaluate(() => ({
      access: window.localStorage.getItem("vp_access_token"),
      refresh: window.localStorage.getItem("vp_refresh_token"),
    }));
    // The refresh token is carried forward, not replaced: Cognito returns a new
    // access token from a refresh exchange and nothing else.
    expect(stored).toEqual({
      access: ROTATED_ACCESS_TOKEN,
      refresh: REFRESH_TOKEN,
    });
  });

  test("recovers from a mid-session 401 on the match list", async ({
    app,
    page,
    api,
  }) => {
    await app.signIn();
    api.once("matchHistory", () => ({
      status: 401,
      json: { detail: "Token expired" },
    }));

    await page.goto("/dashboard/matches");

    await expect(matchRows(page).first()).toBeVisible();
    expect(api.countOf("refresh")).toBe(1);
    expect(api.countOf("matchHistory")).toBe(2);
  });

  test("clears the session and returns to login when the refresh fails", async ({
    app,
    page,
    api,
  }) => {
    api.state.revokedAccessTokens.add(ACCESS_TOKEN);
    api.fail("refresh", 401, "Refresh token expired");
    await app.signIn({ accessToken: ACCESS_TOKEN });

    await page.goto("/dashboard/matches");

    await expect(page).toHaveURL(/\/login$/);
    const stored = await page.evaluate(() => ({
      access: window.localStorage.getItem("vp_access_token"),
      refresh: window.localStorage.getItem("vp_refresh_token"),
    }));
    expect(stored).toEqual({ access: null, refresh: null });
  });

  test("only refreshes once when several requests expire together", async ({
    app,
    page,
    api,
  }) => {
    api.state.revokedAccessTokens.add(ACCESS_TOKEN);
    await app.signIn({ accessToken: ACCESS_TOKEN });

    await page.goto("/dashboard/metrics");
    await expect(
      page.getByRole("complementary", { name: "Live performance metrics" }),
    ).toBeVisible();

    expect(api.countOf("refresh")).toBe(1);
  });

  test("logging out from the sidebar clears tokens and returns to login", async ({
    app,
    page,
    api,
  }) => {
    await app.gotoDashboard();

    await page.getByRole("button", { name: "Log out", exact: true }).click();

    await expect(page).toHaveURL(/\/login$/);
    expect(api.countOf("logout")).toBe(1);
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("vp_access_token"),
    );
    expect(stored).toBeNull();
  });

  test("logging out from the account menu clears tokens too", async ({
    app,
    page,
  }) => {
    await app.gotoDashboard();

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();

    await expect(page).toHaveURL(/\/login$/);
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("vp_access_token"),
    );
    expect(stored).toBeNull();
  });

  test("a logged-out user cannot walk back into the dashboard", async ({
    app,
    page,
  }) => {
    await app.gotoDashboard();
    await page.getByRole("button", { name: "Log out", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/dashboard/matches");
    await expect(page).toHaveURL(/\/login$/);
  });
});
