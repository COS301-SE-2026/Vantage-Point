import { CONFIRMATION_CODE, TEST_EMAIL } from "./fixtures/data";
import { expect, test } from "./fixtures/test";

const NEW_EMAIL = "rookie@vantagepoint.dev";
const NEW_PASSWORD = "brand-new-pass";

test.describe("Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  async function fillForm(
    page: import("@playwright/test").Page,
    overrides: Partial<{
      username: string;
      email: string;
      password: string;
      confirm: string;
    }> = {},
  ) {
    await page.getByLabel("Username").fill(overrides.username ?? "Rookie");
    await page.getByLabel("Email").fill(overrides.email ?? NEW_EMAIL);
    await page
      .getByLabel("Password", { exact: true })
      .fill(overrides.password ?? NEW_PASSWORD);
    await page
      .getByLabel("Confirm Password")
      .fill(overrides.confirm ?? NEW_PASSWORD);
  }

  test("creates the account and moves on to email verification", async ({
    page,
    api,
  }) => {
    await fillForm(page);
    await page.getByRole("button", { name: "Register" }).click();

    // Cognito starts the account UNCONFIRMED, so the code screen comes before
    // any Riot linking.
    await expect(page).toHaveURL(/\/verify-email$/);
    await expect(
      page.getByText(`Enter the code sent to ${NEW_EMAIL}`),
    ).toBeVisible();

    // The Cognito endpoints take query parameters, not a JSON body.
    const search = new URLSearchParams(api.callsTo("register").at(-1)?.search);
    expect(Object.fromEntries(search)).toEqual({
      username: "Rookie",
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
    });
  });

  test("redeems the emailed code and sends the user to sign in", async ({
    page,
    api,
  }) => {
    await fillForm(page);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/verify-email$/);

    await page.getByLabel("Verification Code").fill(CONFIRMATION_CODE);
    await page.getByRole("button", { name: "Verify Email" }).click();

    await expect(page).toHaveURL(/\/login$/);
    expect(
      new URLSearchParams(api.callsTo("confirmUser").at(-1)?.search).get(
        "username",
      ),
    ).toBe("Rookie");
  });

  test("keeps the user on the code screen when the code is wrong", async ({
    page,
  }) => {
    await fillForm(page);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/verify-email$/);

    await page.getByLabel("Verification Code").fill("000000");
    await page.getByRole("button", { name: "Verify Email" }).click();

    await expect(page.getByText("Invalid code")).toBeVisible();
    await expect(page).toHaveURL(/\/verify-email$/);
  });

  test("rejects mismatched passwords without calling the API", async ({
    page,
    api,
  }) => {
    await fillForm(page, { confirm: "something-else" });
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByRole("alert")).toHaveText("Passwords do not match.");
    expect(api.countOf("register")).toBe(0);
  });

  test("enforces the minimum password length client-side", async ({
    page,
    api,
  }) => {
    await fillForm(page, { password: "short", confirm: "short" });
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByRole("alert")).toHaveText(
      "Password must be at least 8 characters.",
    );
    expect(api.countOf("register")).toBe(0);
  });

  test("will not submit an address with no @", async ({ page, api }) => {
    await fillForm(page, { email: "rookie-at-vantagepoint.dev" });
    await page.getByRole("button", { name: "Register" }).click();

    // The field is type="email", so the browser's own constraint stops the submit
    // before RegisterPage's "Please enter a valid email address." check is reached.
    // Either way the user stays put and nothing is sent.
    await expect(page).toHaveURL(/\/register$/);
    expect(api.countOf("register")).toBe(0);
    await expect(page.getByLabel("Email Address")).toHaveJSProperty(
      "validity.valid",
      false,
    );
  });

  test("shows the backend error for an email that already exists", async ({
    page,
  }) => {
    await fillForm(page, { email: TEST_EMAIL });
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByRole("alert")).toHaveText(
      "Email already registered",
    );
    await expect(page).toHaveURL(/\/register$/);
  });

  test("reports validation errors returned as a FastAPI detail list", async ({
    page,
    api,
  }) => {
    api.override("register", () => ({
      status: 422,
      json: { detail: [{ msg: "value is not a valid email address" }] },
    }));

    await fillForm(page);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByRole("alert")).toHaveText(
      "value is not a valid email address",
    );
  });

  test("toggles both password fields independently", async ({ page }) => {
    const password = page.getByLabel("Password", { exact: true });
    const confirm = page.getByLabel("Confirm Password");
    await fillForm(page);

    await page
      .getByRole("button", { name: "Show password", exact: true })
      .click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(confirm).toHaveAttribute("type", "password");

    await page
      .getByRole("button", { name: "Show password confirmation" })
      .click();
    await expect(confirm).toHaveAttribute("type", "text");
  });

  test("offers a route back to sign in", async ({ page }) => {
    // Register uses a react-router <Link> here, so it is an anchor, not a button.
    await page.getByRole("link", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
