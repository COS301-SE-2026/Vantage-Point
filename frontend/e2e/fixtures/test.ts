import { test as base, expect, type Page } from "@playwright/test";
import { ApiMock } from "./api-mock";
import { makeUser, type UserMeBody } from "./data";

export interface SignInOptions {
  /** Overrides for the account `/api/v1/users/me` will return. */
  readonly user?: Partial<UserMeBody>;
  /** Access token planted in localStorage; defaults to the mock's live one. */
  readonly accessToken?: string;
  readonly refreshToken?: string;
}

export interface AppHelpers {
  /**
   * Plants tokens in localStorage so the app boots already authenticated,
   * skipping the login form. Call before the first `page.goto`.
   */
  signIn(options?: SignInOptions): Promise<void>;
  /** Signs in and lands on the matches list with the first paint settled. */
  gotoDashboard(path?: string): Promise<void>;
  /** Console errors and failed requests collected during the test. */
  readonly consoleErrors: string[];
}

interface Fixtures {
  api: ApiMock;
  app: AppHelpers;
}

export const test = base.extend<Fixtures>({
  // `auto` so interception is on even for tests that never name the fixture.
  // Otherwise a stray request escapes to a real backend and fails opaquely.
  api: [
    async ({ context }, use) => {
      const api = new ApiMock();
      await api.install(context);
      await use(api);
    },
    { auto: true },
  ],

  app: async ({ context, page, api }, use) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const helpers: AppHelpers = {
      consoleErrors,
      async signIn(options: SignInOptions = {}) {
        api.state.user = makeUser(options.user);
        const access = options.accessToken ?? api.state.accessToken;
        const refresh = options.refreshToken ?? api.state.refreshToken;
        // Seeded once, on the first document load only: a later goto() must not
        // resurrect a session the test deliberately ended (e.g. after logout).
        await context.addInitScript(
          ([accessToken, refreshToken, username]) => {
            if (window.sessionStorage.getItem("vp_e2e_seeded")) return;
            window.sessionStorage.setItem("vp_e2e_seeded", "1");
            window.localStorage.setItem("vp_access_token", accessToken);
            window.localStorage.setItem("vp_refresh_token", refreshToken);
            // A real login stores this too, and a refresh cannot happen without it.
            window.localStorage.setItem("vp_username", username);
          },
          [access, refresh, api.state.credentials.email],
        );
      },
      async gotoDashboard(path = "/dashboard/matches") {
        await helpers.signIn();
        await page.goto(path);
        await expect(
          page.getByRole("navigation", { name: "Dashboard navigation" }),
        ).toBeVisible();
      },
    };

    await use(helpers);
  },
});

export { expect };

/** The dashboard's left rail, shared by most dashboard specs. */
export function sidebar(page: Page) {
  return page.getByRole("navigation", { name: "Dashboard navigation" });
}

/** Every clickable match row in the matches list, in rendered order. */
export function matchRows(page: Page) {
  return page.getByRole("button", { name: /^View match as / });
}
