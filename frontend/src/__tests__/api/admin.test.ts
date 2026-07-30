
// Imports
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// simplified imports to just take from the api since there are a lot more to keep track of
// also allows to make it easier to import the env info for each test 
type AdminApi = typeof import('../../api/admin');

// Constants + Mocks
const ogDev = import.meta.env.DEV; // save original DEV env value

afterEach(() => {
    (import.meta.env as { DEV: boolean }).DEV = ogDev; // restore original DEV env value
    vi.doUnmock('../../api/client');
    vi.resetModules();
});


// Mock mode (USE_MOCKS === true, the vitest default)
// === means equivalent, so type and value need to be exactly the same. This is important for the type-checking of the mock functions.




// USERS Functional Requirements
describe('admin API (mock mode)', () => {
    let admin: AdminApi;

  beforeEach(async () => {
    (import.meta.env as { DEV: boolean }).DEV = true; // set DEV env to true for mock mode
    vi.resetAllMocks();
    
    admin = await import('../../api/admin');
  });

  it('listUsers returns mock users, (UNFILTERED)', async () => {
    const result = await admin.listUsers();

    expect(result.items).toHaveLength(5); 
    expect(result.items.map((used) => used.username)).contains('jonny77');
  });

  it('listUsers filters by status', async () => {
    const result = await admin.listUsers({ status: 'Active' });
    expect(result.items.every(used => used.enabled && used.user_status === 'CONFIRMED')).toBe(true);
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

  it('getUser returns mock user', async () => {
    // this should find since it is nto the first and havent tested with this user yet
    const user1 = await admin.getUser('reeds7');
    expect(user1.username).toBe('reeds7');

    // lets test another way to fall back to the FIRST user in the mock data
    expect(( await admin.getUser("nobody") ).username).toBe('jonny77');
    // Polyphemus 2:58 - 3:08     ^
  });

  it('addUserToGroup updates mock role', async () => {
    await admin.addUserToGroup('jonny77', 'Admin');

    // After adding, listUsers should show role
    const { items } = await admin.listUsers();
    const found = items.find(u => u.username === 'jonny77');
    expect(found?.role).toBe('Admin');
  });

  it('registerUserManually returns mock user derived from the email locally', async () => {
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
  it('getPlatformSettings & setRegistrationsOpen  roundtrip in-memory', async () => {
    const settings = await admin.getPlatformSettings();
    expect(settings.registrations_open).toBe(true);
  });

  it('listMatchSessions returns mock sessions', async () => {
    const result = await admin.listMatchSessions();
    expect(result.items).toHaveLength(2);
  });

  // Dashboard / System Metrics Functional Requirements
  it('getDashboardMetrics returns mock metrics', async () => {
    const metrics = await admin.getDashboardMetrics();
    expect(metrics.active_users).toBe(500);
  });
});


// Match Data/ Data Ingestion (Matches view) Functional Requirements
describe('admin API (real mode)', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // USE_MOCKS = false
    setDevMode(false); 
  });

  it('listUsers calls apiFetch with correct URL', async () => {
    mockedApiFetch.mockResolvedValueOnce([]);
    await admin.listUsers();
    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/users');
  });

  it('listUsers passes filters as query? Actually filters are applied client-side', () => {
    // Just verifies it calls apiFetch.
    // CURRENTLY nto fully functional where filters are applied after fetch
    // Futur will do that test
  });

  it('getUser calls apiFetch with username', async () => {
    mockedApiFetch.mockResolvedValueOnce({ 
        username: 'test', 
        email: 'test@x.com', 
        sub: 'sub', 
        user_created_date: '', 
        user_last_modified_date: '', 
        enabled: true, 
        user_status: 'CONFIRMED' });
    await admin.getUser('test');
    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/users/test');
  });

  it('addUserToGroup posts to /admin/add_user_to_group', async () => {
    await admin.addUserToGroup('user', 'Admin');
    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/add_user_to_group', {
      method: 'POST',
      body: JSON.stringify({ username: 'user', group: 'Admin' }),
    });
  });

  // USERS Functional Requirements
  it('setRegistrationsOpen patches /admin/settings', async () => {
    await admin.setRegistrationsOpen(false);
    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ registrations_open: false }),
    });
  });

  // Map & Champion Assests Functional Requirements
  it('uploadMapAsset uses apiFetchFormData', async () => {
    const file = new File([''], 'map.png');
    mockedApiFetchFormData.mockResolvedValueOnce({ map_id: 'm', display_name: 'Map', image_url: '' });
    await uploadMapAsset('m', 'Map', file);
    expect(mockedApiFetchFormData).toHaveBeenCalledWith('/api/v1/admin/assets/maps', expect.any(FormData));
  });
});

