// Imports
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// simplified imports to just take from the api since there are a lot more to keep track of
// also allows to make it easier to import the env info for each test
type AdminApi = typeof import("../../api/admin");

// Constants + Mocks
// const ogDev = import.meta.env.DEV; // save original DEV env value

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock("../../api/client");
  vi.resetModules();
});

// Mock mode (USE_MOCKS === true, the vitest default)
// === means equivalent, so type and value need to be exactly the same. This is important for the type-checking of the mock functions.

// USERS Functional Requirements
describe("admin API (mock mode)", () => {
  let admin: AdminApi;

  beforeEach(async () => {
    vi.stubEnv("VITE_USE_MOCKS", "true");
    vi.resetAllMocks();
    vi.resetModules(); // ensure a fresh module is loaded

    admin = await import("../../api/admin");
  });

  it("listUsers returns mock users, (UNFILTERED)", async () => {
    const result = await admin.listUsers();

    expect(result.items).toHaveLength(5);
    expect(result.items.map((used) => used.username)).contains("jonny77");
  });

  it("listUsers filters by status", async () => {
    const result = await admin.listUsers({ status: "Active" });
    expect(
      result.items.every(
        (used) => used.enabled && used.user_status === "CONFIRMED",
      ),
    ).toBe(true);
  });

  it("listUsers filters by derived status", async () => {
    const result = await admin.listUsers({ status: "Disabled" });
    expect(result.items.every((used) => !used.enabled)).toBe(true);
  });

  it("listUsers filters by role", async () => {
    const result = await admin.listUsers({ role: "Super Admin" });
    expect(result.items).toEqual([
      expect.objectContaining({ username: "bellecl", role: "Super Admin" }),
    ]);
  });
  // Both Filters ( ROLE and Status) are being tested above

  it("getUser returns mock user", async () => {
    // this should find since it is nto the first and havent tested with this user yet
    const user1 = await admin.getUser("reeds7");
    expect(user1.username).toBe("reeds7");

    // lets test another way to fall back to the FIRST user in the mock data
    expect((await admin.getUser("nobody")).username).toBe("jonny77");
    // Polyphemus 2:58 - 3:08     ^
  });

  it("addUserToGroup updates mock role", async () => {
    await admin.addUserToGroup("jonny77", "Admin");

    // After adding, listUsers should show role
    const { items } = await admin.listUsers();
    const found = items.find((u) => u.username === "jonny77");
    expect(found?.role).toBe("Admin");
  });

  it("registerUserManually returns mock user derived from the email locally", async () => {
    const creation = await admin.registerUserManually({
      email: "Lady.of@palace.com",
      display_name: "Circe",
      password: "Nymphs123!",
      //   Done For 0:11,
    });

    // Derived from email
    expect(creation.username).toBe("Lady.of");
    expect(creation.role).toBe("Player");

    // status
    expect(creation.user_status).toBe("FORCE_CHANGE_PASSWORD");
  });

  // Test other functions that return mock data
  it("getPlatformSettings & setRegistrationsOpen  roundtrip in-memory", async () => {
    const settings = await admin.getPlatformSettings();
    expect(settings.registrations_open).toBe(true);

    expect((await admin.setRegistrationsOpen(false)).registrations_open).toBe(
      false,
    );
    expect((await admin.setRegistrationsOpen(true)).registrations_open).toBe(
      true,
    );
  });

  it("listMatchSessions returns mock sessions ", async () => {
    const result = await admin.listMatchSessions();
    expect(result.items).toHaveLength(2);
  });

  // Dashboard / System Metrics Functional Requirements
  it("getDashboardMetrics returns mock metrics", async () => {
    const metrics = await admin.getDashboardMetrics();
    expect(metrics.active_users).toBe(500);
  });

  it("getSiteTraffic returns mock traffic", async () => {
    const traffic = await admin.getSiteTraffic();
    expect(traffic).toHaveLength(6);
  });

  it("getErrorLog returns mock errors", async () => {
    const errors = await admin.getErrorLog();
    expect(errors).toHaveLength(2);
  });

  it("flagSessionForDeletion and unflagSessionForDeletion roundtrip in-memory", async () => {
    const session = await admin.flagSessionForDeletion("s1");
    expect(session.deletion_status).toBe("flagged");

    const unflagged = await admin.unflagSessionForDeletion("s2");
    expect(unflagged.deletion_status).toBe("active");
  });

  it("hardDeleteSession removes session from mock data", async () => {
    await expect(admin.hardDeleteSession("s1")).resolves.toBeUndefined();
  });

  it("markErrorReviewed updates mock error", async () => {
    const error = await admin.markErrorReviewed("e1", true);
    expect(error.reviewed).toBe(true);
  });

  it("listMapAssets/ uploadMapAsset returns mock maps and an object URL", async () => {
    expect(await admin.listMapAssets()).toEqual([
      {
        map_id: 11,
        display_name: "Summoner's Rift",
        image_url: "",
      },
    ]);
    const file = new File(["x"], "rift.png", { type: "image/png" });
    const created = await admin.uploadMapAsset(11, "Rift", file);
    expect(created.map_id).toBe(11);
    expect(created.display_name).toBe("Rift");
  });

  it("listChampionAssest/ uploadChampionAsset returns mock data and an object URL", async () => {
    expect(await admin.listChampionAssets()).toEqual([
      { champion_id: 103, display_name: "Ahri", image_url: "" },
    ]);
    const file = new File(["x"], "ahri.png", { type: "image/png" });
    const created = await admin.uploadChampionAsset(103, "Ahri", file);
    expect(created.champion_id).toBe(103);
  });
});

// using real mode (USE_MOCKS === false) to test that the API calls are made correctly
describe("admin API (real mode)", () => {
  const apiFetch = vi.fn();
  const apiFetchFormData = vi.fn();
  let admin: AdminApi;

  beforeEach(async () => {
    apiFetch.mockReset();
    apiFetchFormData.mockReset();
    vi.doMock("../../api/client", () => ({
      apiFetch,
      apiFetchFormData,
      ApiError: class ApiError extends Error {
        status: number;
        constructor(status: number, message: string) {
          super(message);
          this.status = status;
        }
      },
    }));
    vi.stubEnv("VITE_USE_MOCKS", "false");
    vi.resetModules();
    admin = await import("../../api/admin");
  });

  it("listUsers calls apiFetch with correct URL", async () => {
    apiFetch.mockResolvedValueOnce([]);
    await admin.listUsers();
    expect(apiFetch).toHaveBeenCalledWith("/admin/users");
  });

  it("listUsers fetches the bare array and merges in-memory assigned roles", async () => {
    apiFetch.mockResolvedValueOnce([
      {
        username: "alice",
        email: "alice@example.com",
        sub: "sub-1",
        user_created_date: "2024-01-01T00:00:00Z",
        user_last_modified_date: "2024-01-01T00:00:00Z",
        enabled: true,
        user_status: "CONFIRMED",
      },
    ]);

    const result = await admin.listUsers();
    expect(apiFetch).toHaveBeenCalledWith("/admin/users");
    expect(result.items).toEqual([
      expect.objectContaining({ username: "alice", role: null }),
    ]);
  });

  it("listUsers passes filters as query? Actually filters are applied client-side", () => {
    // Just verifies it calls apiFetch.
    // CURRENTLY nto fully functional where filters are applied after fetch
    // Futur will do that test
  });

  it("getUser calls apiFetch with username", async () => {
    apiFetch.mockResolvedValueOnce({
      username: "test",
      email: "test@x.com",
      sub: "sub",
      user_created_date: "",
      user_last_modified_date: "",
      enabled: true,
      user_status: "CONFIRMED",
    });
    await admin.getUser("test");
    expect(apiFetch).toHaveBeenCalledWith("/admin/users/test");
  });

  it("addUserToGroup posts to /admin/add_user_to_group", async () => {
    await admin.addUserToGroup("user", "Admin");
    expect(apiFetch).toHaveBeenCalledWith("/admin/add_user_to_group", {
      method: "POST",
      body: JSON.stringify({ username: "user", group: "Admin" }),
    });

    apiFetch.mockResolvedValueOnce([
      {
        username: "user",
        email: "user@example.com",
        sub: "sub-1",
        user_created_date: "2024-01-01T00:00:00Z",
        user_last_modified_date: "2024-01-01T00:00:00Z",
        enabled: true,
        user_status: "CONFIRMED",
      },
    ]);
    const result = await admin.listUsers();
    expect(result.items[0].role).toBe("Admin");
  });

  it("removeUserFromGroup posts to /admin/remove_user_from_group and clears the assigned role", async () => {
    apiFetch.mockResolvedValueOnce({ success: "ok", message: "done" });
    await admin.addUserToGroup("bobby", "Admin");

    apiFetch.mockResolvedValueOnce({ success: "ok", message: "done" });
    await admin.removeUserFromGroup("bobby", "Admin");

    expect(apiFetch).toHaveBeenCalledWith("/admin/remove_user_from_group", {
      method: "POST",
      body: JSON.stringify({ username: "bobby", group: "Admin" }),
    });
  });

  it("setRegistrationsOpen uses the new PUT endpoint", async () => {
    await admin.setRegistrationsOpen(false);
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/v1/admin/platform-settings/registrations-open?open_=false",
      { method: "PUT" },
    );
  });

  // Map & Champion Assests Functional Requirements
  it("uploadMapAsset uses apiFetchFormData", async () => {
    const file = new File([""], "map.png");
    apiFetchFormData.mockResolvedValueOnce({
      map_id: "m",
      display_name: "Map",
      image_url: "",
    });
    await admin.uploadMapAsset("m", "Map", file);
    expect(apiFetchFormData).toHaveBeenCalledWith(
      "/api/v1/admin/assets/maps",
      expect.any(FormData),
    );
  });

  it("enableUser/disableUser/deleteUser call their respective endpoints", async () => {
    apiFetch.mockResolvedValue({ success: "ok", message: "done" });
    await admin.enableUser("bobby");

    expect(apiFetch).toHaveBeenCalledWith("/admin/enable_user", {
      method: "POST",
      body: JSON.stringify({ username: "bobby" }),
    });

    await admin.disableUser("bobby");
    expect(apiFetch).toHaveBeenCalledWith("/admin/disable_user", {
      method: "POST",
      body: JSON.stringify({ username: "bobby" }),
    });

    await admin.deleteUser("bobby");
    expect(apiFetch).toHaveBeenCalledWith("/admin/delete_user", {
      method: "POST",
      body: JSON.stringify({ username: "bobby" }),
    });
  });

  it("registerUserManually posts to /admin/create_user and returns role: null", async () => {
    apiFetch.mockResolvedValueOnce({
      username: "newp",
      email: "new.person@example.com",
      sub: "sub-9",
      user_created_date: "2024-01-01T00:00:00Z",
      user_last_modified_date: "2024-01-01T00:00:00Z",
      enabled: true,
      user_status: "FORCE_CHANGE_PASSWORD",
    });

    const created = await admin.registerUserManually({
      email: "new.person@example.com",
      display_name: "New Person",
      password: "temp-pass",
    });
    expect(apiFetch).toHaveBeenCalledWith(
      "/admin/create_user",
      expect.objectContaining({ method: "POST" }),
    );
    expect(created.role).toBeNull();
  });

  it("getPlatformSettings/setRegistrationsOpen hit the new endpoints", async () => {
    apiFetch.mockResolvedValueOnce({ registrations_open: true });
    await admin.getPlatformSettings();
    expect(apiFetch).toHaveBeenCalledWith("/api/v1/admin/platform-settings");

    apiFetch.mockResolvedValueOnce({ registrations_open: false });
    await admin.setRegistrationsOpen(false);
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/v1/admin/platform-settings/registrations-open?open_=false",
      { method: "PUT" },
    );
  });

  it("listMatchSessions builds query params from filters and defaults page to 1", async () => {
    apiFetch.mockResolvedValueOnce({ items: [], total: 0 });
    await admin.listMatchSessions({
      mapName: "Summoner's Rift",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });

    const [url] = apiFetch.mock.calls[0] as [string];
    expect(url).toContain("/api/v1/admin/sessions?");
    expect(url).toContain("map_name=Summoner%27s+Rift");
    expect(url).toContain("start_date=2026-01-01");
    expect(url).toContain("end_date=2026-01-31");
    expect(url).toContain("page=1");
  });

  it("flagSessionForDeletion/unflagSessionForDeletion hit the flag endpoints", async () => {
    apiFetch.mockResolvedValueOnce({ id: "s1", deletion_status: "flagged" });
    await admin.flagSessionForDeletion("s1");
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/v1/admin/sessions/s1/flag-delete",
      { method: "POST" },
    );

    apiFetch.mockResolvedValueOnce({ id: "s1", deletion_status: "active" });
    await admin.unflagSessionForDeletion("s1");
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/v1/admin/sessions/s1/unflag-delete",
      { method: "POST" },
    );
  });

  it("hardDeleteSession issues a DELETE to the session endpoint", async () => {
    apiFetch.mockResolvedValueOnce(undefined);
    await admin.hardDeleteSession("s1");
    expect(apiFetch).toHaveBeenCalledWith("/api/v1/admin/sessions/s1", {
      method: "DELETE",
    });
  });

  it("getDashboardMetrics/getSiteTraffic/getErrorLog hit the dashboard endpoints", async () => {
    apiFetch.mockResolvedValueOnce({});
    await admin.getDashboardMetrics();
    expect(apiFetch).toHaveBeenCalledWith("/api/v1/admin/dashboard/metrics");

    apiFetch.mockResolvedValueOnce([]);
    await admin.getSiteTraffic();
    expect(apiFetch).toHaveBeenCalledWith("/api/v1/admin/dashboard/traffic");

    apiFetch.mockResolvedValueOnce([]);
    await admin.getErrorLog();
    expect(apiFetch).toHaveBeenCalledWith("/api/v1/admin/dashboard/errors");
  });
});
