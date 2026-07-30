
// Imports
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listUsers,
  getUser,
  addUserToGroup,
  removeUserFromGroup,
  enableUser,
  disableUser,
  deleteUser,
  registerUserManually,
  getPlatformSettings,
  setRegistrationsOpen,
  listMatchSessions,
  flagSessionForDeletion,
  unflagSessionForDeletion,
  hardDeleteSession,
  getDashboardMetrics,
  getSiteTraffic,
  getErrorLog,
  markErrorReviewed,
  listMapAssets,
  uploadMapAsset,
  listChampionAssets,
  uploadChampionAsset,
} from '../../api/admin';
import { apiFetch, apiFetchFormData } from '../../api/client';
import type { AdminUser, AppRole } from '../../types/admin';

// Constants + Mocks
vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
  apiFetchFormData: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);
const mockedApiFetchFormData = vi.mocked(apiFetchFormData);


// Helper fucntions
function setDevMode(isDev: boolean) {
  vi.stubEnv('DEV', String(isDev));
}



// USERS Functional Requirements
describe('admin API (mock mode)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // USE_MOCKS = true
    setDevMode(true); 
  });

  it('listUsers returns mock users', async () => {
    const result = await listUsers();

    // From MOCK_USERS
    expect(result.items).toHaveLength(5); 
    expect(mockedApiFetch).not.toHaveBeenCalled();
  });

  it('listUsers filters by status', async () => {
    const result = await listUsers({ status: 'Active' });
    expect(result.items.every(u => u.enabled && u.user_status === 'CONFIRMED')).toBe(true);
  });

  it('getUser returns mock user', async () => {
    const user = await getUser('jonny77');
    expect(user.username).toBe('jonny77');
  });

  it('addUserToGroup updates mock role', async () => {
    await addUserToGroup('jonny77', 'Admin');

    // After adding, listUsers should show role
    const { items } = await listUsers();
    const found = items.find(u => u.username === 'jonny77');
    expect(found?.role).toBe('Admin');
  });

  it('registerUserManually returns mock user', async () => {
    const user = await registerUserManually({
      email: 'new@example.com',
      display_name: 'NewUser',
      password: 'temp',
    });

    // Derived from email
    expect(user.username).toBe('new'); 
    expect(user.role).toBe('Player');
  });

  // Test other functions that return mock data
  it('getPlatformSettings returns mock settings', async () => {
    const settings = await getPlatformSettings();
    expect(settings.registrations_open).toBe(true);
  });

  it('listMatchSessions returns mock sessions', async () => {
    const result = await listMatchSessions();
    expect(result.items).toHaveLength(2);
  });

  // Dashboard / System Metrics Functional Requirements
  it('getDashboardMetrics returns mock metrics', async () => {
    const metrics = await getDashboardMetrics();
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
    await listUsers();
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
    await getUser('test');
    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/users/test');
  });

  it('addUserToGroup posts to /admin/add_user_to_group', async () => {
    await addUserToGroup('user', 'Admin');
    expect(mockedApiFetch).toHaveBeenCalledWith('/admin/add_user_to_group', {
      method: 'POST',
      body: JSON.stringify({ username: 'user', group: 'Admin' }),
    });
  });

  // USERS Functional Requirements
  it('setRegistrationsOpen patches /admin/settings', async () => {
    await setRegistrationsOpen(false);
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

