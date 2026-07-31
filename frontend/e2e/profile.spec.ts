import { expect, test } from "./fixtures/test";

test.describe("Profile", () => {
  test.beforeEach(async ({ app, page }) => {
    await app.signIn();
    await page.goto("/dashboard/profile");
    await expect(
      page.getByRole("region", { name: "Performance radar" }),
    ).toBeVisible();
  });

  test("shows the account identity in the header", async ({ page }) => {
    await expect(page.getByText("Vantage Tester").first()).toBeVisible();
    await expect(page.getByText("VantageTester#EUW").first()).toBeVisible();
  });

  test("summarises the sampled window", async ({ page }) => {
    await expect(page.getByText("Last 6 matches")).toBeVisible();
  });

  test("draws the performance radar with every axis", async ({ page }) => {
    const radar = page.getByRole("region", { name: "Performance radar" });

    for (const axis of ["KDA", "Vision", "CS/min", "Damage", "Gold"]) {
      await expect(radar.getByText(axis, { exact: true })).toBeVisible();
    }
  });

  test("shows the featured game card", async ({ page }) => {
    const featured = page.getByRole("region", { name: "Featured game" });

    await expect(featured).toBeVisible();
    await expect(featured).toContainText("League of Legends");
  });

  test("lists most played champions with their game counts", async ({
    page,
  }) => {
    const champions = page.getByRole("region", {
      name: "Most played champions",
    });

    await expect(champions.getByRole("img")).toHaveCount(3);
    await expect(champions.getByAltText("Jinx")).toBeVisible();
    await expect(champions).toContainText("12");
    await expect(champions).toContainText("7");
  });

  test("shows a placeholder until the profile arrives", async ({
    app,
    page,
    api,
  }) => {
    api.override("profile", async () => {
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      return undefined;
    });
    await app.signIn();

    await page.goto("/dashboard/profile");

    await expect(page.getByText("Loading profile…")).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Performance radar" }),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Editing the profile", () => {
  test.beforeEach(async ({ app, page }) => {
    await app.signIn();
    await page.goto("/dashboard/profile");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Edit profile" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("opens with the current values prefilled", async ({ page }) => {
    const dialog = page.getByRole("dialog");

    await expect(
      dialog.getByRole("heading", { name: "Edit profile" }),
    ).toBeVisible();
    await expect(dialog.getByLabel("Display name")).toHaveValue(
      "Vantage Tester",
    );
    await expect(dialog.getByLabel("Riot ID")).toHaveValue("VantageTester#EUW");
  });

  test("saves a new display name and refreshes the header", async ({
    page,
    api,
  }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Display name").fill("Renamed Player");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog).toBeHidden();
    expect(api.lastBody("updateMe")).toEqual({
      display_name: "Renamed Player",
    });
    await expect(page.getByText("Renamed Player").first()).toBeVisible();
  });

  test("relinks a new Riot ID", async ({ page, api }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Riot ID").fill("Rebrand#EUW");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog).toBeHidden();
    expect(api.lastBody("updateRiot")).toEqual({ riot_id: "Rebrand#EUW" });
  });

  test("rejects an empty display name before calling the API", async ({
    page,
    api,
  }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Display name").fill("   ");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog.getByRole("alert")).toHaveText(
      "Display name is required.",
    );
    expect(api.countOf("updateMe")).toBe(0);
  });

  test("rejects a Riot ID without a tag", async ({ page, api }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Riot ID").fill("NoTagHere");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog.getByRole("alert")).toHaveText(
      "Riot ID must include a tag, e.g. Player#EUW",
    );
    expect(api.countOf("updateRiot")).toBe(0);
  });

  test("surfaces a Riot lookup failure", async ({ page, api }) => {
    api.state.unknownRiotIds.add("Ghost#EUW");
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Riot ID").fill("Ghost#EUW");
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog.getByRole("alert")).toHaveText(
      'Riot ID "Ghost#EUW" was not found.',
    );
    await expect(dialog).toBeVisible();
  });

  test("cancel discards edits and closes the dialog", async ({ page, api }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Display name").fill("Discarded");
    await dialog.getByRole("button", { name: "Cancel" }).click();

    await expect(dialog).toBeHidden();
    expect(api.countOf("updateMe")).toBe(0);
    await expect(page.getByText("Vantage Tester").first()).toBeVisible();
  });
});

test.describe("Profile photo", () => {
  test("uploads a new avatar", async ({ app, page, api }) => {
    await app.signIn();
    await page.goto("/dashboard/profile");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Edit profile" }).click();

    const dialog = page.getByRole("dialog");
    const [chooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      dialog.getByRole("button", { name: "Change profile photo" }).click(),
    ]);
    await chooser.setFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog).toBeHidden();
    expect(api.countOf("uploadAvatar")).toBe(1);
    expect(api.state.profile.avatar_url).toBe("/static/avatars/e2e.png");
  });

  test("removes an existing avatar", async ({ app, page, api }) => {
    api.state.profile.avatar_url = "/static/avatars/existing.png";
    await app.signIn({ user: { avatar_url: "/static/avatars/existing.png" } });
    await page.goto("/dashboard/profile");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Edit profile" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Remove photo" }).click();
    await dialog.getByRole("button", { name: "Save" }).click();

    await expect(dialog).toBeHidden();
    expect(api.countOf("deleteAvatar")).toBe(1);
    expect(api.state.profile.avatar_url).toBeNull();
  });
});
