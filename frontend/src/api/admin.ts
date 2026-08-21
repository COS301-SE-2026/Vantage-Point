import { apiFetch, apiFetchFormData } from "./client";
import type {
  AdminMatchSession,
  AdminMatchSessionListResponse,
  AdminUser,
  AdminUserFilters,
  AdminUserListResponse,
  AppRole,
  ChampionAsset,
  DashboardMetrics,
  ErrorLogEntry,
  MapAsset,
  MatchSessionFilters,
  PlatformSettings,
  RegisterUserPayload,
  SiteTrafficPoint,
} from "../types/admin";
// separated below import just so its easier to remember it is not like the others which are interfaces, it is a function.
import { deriveUserStatus } from "../types/admin";

// MOCK DATA - STUB for Local UI testing only,
// delete this  block and ever "if (USE_MOCKS) { ... } block once backend admin routes exist"
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const MOCK_USERS: AdminUser[] = [
  {
    username: "jonny77",
    email: "john.smith@example.com",
    sub: "sub-1",
    user_created_date: "2023-03-12T00:00:00Z",
    user_last_modified_date: new Date(Date.now() - 60_000).toISOString(),
    enabled: true,
    user_status: "CONFIRMED",
    role: "Admin",
  },
  {
    username: "dwarren3",
    email: "dwarren3@example.com",
    sub: "sub-2",
    user_created_date: "2024-01-08T00:00:00Z",
    user_last_modified_date: new Date(
      Date.now() - 4 * 86_400_000,
    ).toISOString(),
    enabled: false,
    user_status: "CONFIRMED",
    role: "Player",
  },
  {
    username: "chloehh",
    email: "chloehye@example.com",
    sub: "sub-3",
    user_created_date: "2021-10-05T00:00:00Z",
    user_last_modified_date: new Date(
      Date.now() - 10 * 86_400_000,
    ).toISOString(),
    enabled: true,
    user_status: "FORCE_CHANGE_PASSWORD",
    role: "Admin",
  },
  {
    username: "bellecl",
    email: "belleclark@example.com",
    sub: "sub-4",
    user_created_date: "2022-08-30T00:00:00Z",
    user_last_modified_date: new Date(
      Date.now() - 7 * 86_400_000,
    ).toISOString(),
    enabled: true,
    user_status: "CONFIRMED",
    role: "Super Admin",
  },
  {
    username: "reeds7",
    email: "reeds777@example.com",
    sub: "sub-5",
    user_created_date: "2023-02-19T00:00:00Z",
    user_last_modified_date: new Date(
      Date.now() - 90 * 86_400_000,
    ).toISOString(),
    enabled: false,
    user_status: "CONFIRMED",
    role: "Player",
  },
];

const MOCK_SESSIONS: AdminMatchSession[] = [
  {
    id: "s1",
    match_id: "NA1_4987654321",
    map_name: "Summoner's Rift",
    player_count: 10,
    played_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    deletion_status: "active",
  },
  {
    id: "s2",
    match_id: "EUW1_6597728340",
    map_name: "Summoner's Rift",
    player_count: 10,
    played_at: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    deletion_status: "flagged",
  },
];

const MOCK_SETTINGS: PlatformSettings = { registrations_open: true };

const MOCK_METRICS: DashboardMetrics = {
  active_users: 500,
  inactive_users: 500,
  matches_last_5_months: 500,
  matches_all_time: 500,
  storage_matches_mb: 500,
  storage_profiles_mb: 500,
  storage_other_mb: 500,
};

const MOCK_TRAFFIC: SiteTrafficPoint[] = [
  { month: "February 2026", relative_load: 2 },
  { month: "March 2026", relative_load: 4 },
  { month: "April 2026", relative_load: 5 },
  { month: "May 2026", relative_load: 3 },
  { month: "June 2026", relative_load: 4 },
  { month: "July 2026", relative_load: 1 },
];

const MOCK_ERRORS: ErrorLogEntry[] = [
  {
    id: "e1",
    error_code: "404",
    error_message: "File Not Found",
    occurred_at: new Date().toISOString(),
    reviewed: true,
  },
  {
    id: "e2",
    error_code: "404",
    error_message: "File Not Found",
    occurred_at: new Date().toISOString(),
    reviewed: false,
  },
];

const MOCK_MAP_ASSETS: MapAsset[] = [
  { map_id: 11, display_name: "Summoner's Rift", image_url: "" },
];

const MOCK_CHAMPION_ASSETS: ChampionAsset[] = [
  { champion_id: 103, display_name: "Ahri", image_url: "" },
];

// In-memory tracking of roles assigned this session, since the backend has
// no way to report existing group membership yet (see chat notes).
const assignedRoles = new Map<string, AppRole>();

// USERS Functional Requirements

export async function listUsers(
  filters: AdminUserFilters = {},
): Promise<AdminUserListResponse> {
  let items: AdminUser[];
  if (USE_MOCKS) {
    items = MOCK_USERS;
  } else {
    // Real endpoint returns a bare array with no pagination or query params.
    const raw = await apiFetch<Omit<AdminUser, "role">[]>("/admin/users");
    items = raw.map((u) => ({
      ...u,
      role: assignedRoles.get(u.username) ?? null,
    }));
  }

  return {
    items: items.filter((u) => {
      if (filters.status && deriveUserStatus(u) !== filters.status)
        return false;
      if (filters.role && u.role !== filters.role) return false;
      return true;
    }),
  };
}

export async function getUser(username: string): Promise<AdminUser> {
  if (USE_MOCKS) {
    return MOCK_USERS.find((u) => u.username === username) ?? MOCK_USERS[0];
  }
  const raw = await apiFetch<Omit<AdminUser, "role">>(
    `/admin/users/${username}`,
  );
  return { ...raw, role: assignedRoles.get(username) ?? null };
}

export async function addUserToGroup(
  username: string,
  group: AppRole,
): Promise<void> {
  if (USE_MOCKS) {
    console.log("[mock] addUserToGroup", username, group);
    assignedRoles.set(username, group);
    return;
  }
  await apiFetch<{ success: string; message: string }>(
    "/admin/add_user_to_group",
    {
      method: "POST",
      body: JSON.stringify({ username, group }),
    },
  );
  assignedRoles.set(username, group);
}

export async function removeUserFromGroup(
  username: string,
  group: AppRole,
): Promise<void> {
  if (USE_MOCKS) {
    console.log("[mock] removeUserFromGroup", username, group);
    assignedRoles.delete(username);
    return;
  }
  await apiFetch<{ success: string; message: string }>(
    "/admin/remove_user_from_group",
    {
      method: "POST",
      body: JSON.stringify({ username, group }),
    },
  );
  assignedRoles.delete(username);
}

export async function enableUser(username: string): Promise<void> {
  if (USE_MOCKS) {
    console.log("[mock] enableUser", username);
    return;
  }
  await apiFetch<{ success: string; message: string }>("/admin/enable_user", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function disableUser(username: string): Promise<void> {
  if (USE_MOCKS) {
    console.log("[mock] disableUser", username);
    return;
  }
  await apiFetch<{ success: string; message: string }>("/admin/disable_user", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function deleteUser(username: string): Promise<void> {
  if (USE_MOCKS) {
    console.log("[mock] deleteUser", username);
    return;
  }
  await apiFetch<void>("/admin/delete_user", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export async function registerUserManually(
  payload: RegisterUserPayload,
): Promise<AdminUser> {
  if (USE_MOCKS) {
    return {
      username: payload.email.split("@")[0],
      email: payload.email,
      sub: crypto.randomUUID(),
      user_created_date: new Date().toISOString(),
      user_last_modified_date: new Date().toISOString(),
      enabled: true,
      user_status: "FORCE_CHANGE_PASSWORD",
      role: "Player",
    };
  }
  const raw = await apiFetch<Omit<AdminUser, "role">>("/admin/create_user", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ...raw, role: null };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (USE_MOCKS) return MOCK_SETTINGS;
  return apiFetch<PlatformSettings>("/api/v1/admin/platform-settings");
}

export async function setRegistrationsOpen(
  open: boolean,
): Promise<PlatformSettings> {
  if (USE_MOCKS) {
    console.log("[mock] setRegistrationsOpen", open);
    return { registrations_open: open };
  }
  return apiFetch<PlatformSettings>(
    `/api/v1/admin/platform-settings/registrations-open?open_=${open}`,
    { method: "PUT" },
  );
}

// Match Data/ Data Ingestion (Matches view) Functional Requirements

export async function listMatchSessions(
  filters: MatchSessionFilters = {},
): Promise<AdminMatchSessionListResponse> {
  if (USE_MOCKS) {
    return { items: MOCK_SESSIONS, total: MOCK_SESSIONS.length };
  }

  const params = new URLSearchParams();
  if (filters.mapName) params.set("map_name", filters.mapName);
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);
  params.set("page", String(filters.page ?? 1));
  return apiFetch<AdminMatchSessionListResponse>(
    `/api/v1/admin/sessions?${params}`,
  );
}

export async function flagSessionForDeletion(
  sessionId: string,
): Promise<AdminMatchSession> {
  if (USE_MOCKS) {
    const existing =
      MOCK_SESSIONS.find((s) => s.id === sessionId) ?? MOCK_SESSIONS[0];
    return { ...existing, deletion_status: "flagged" };
  }

  return apiFetch<AdminMatchSession>(
    `/api/v1/admin/sessions/${sessionId}/flag-delete`,
    { method: "POST" },
  );
}

export async function unflagSessionForDeletion(
  sessionId: string,
): Promise<AdminMatchSession> {
  if (USE_MOCKS) {
    const existing =
      MOCK_SESSIONS.find((s) => s.id === sessionId) ?? MOCK_SESSIONS[0];
    return { ...existing, deletion_status: "active" };
  }

  return apiFetch<AdminMatchSession>(
    `/api/v1/admin/sessions/${sessionId}/unflag-delete`,
    { method: "POST" },
  );
}

/** Super Admin only; bypasses the 24h queue (FR-A13). */
export async function hardDeleteSession(sessionId: string): Promise<void> {
  if (USE_MOCKS) {
    console.log("[mock] hardDeleteSession", sessionId);
    return;
  }

  return apiFetch<void>(`/api/v1/admin/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

// Dashboard / System Metrics Functional Requirements
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (USE_MOCKS) return MOCK_METRICS;

  return apiFetch<DashboardMetrics>("/api/v1/admin/dashboard/metrics");
}

export async function getSiteTraffic(): Promise<SiteTrafficPoint[]> {
  if (USE_MOCKS) return MOCK_TRAFFIC;

  return apiFetch<SiteTrafficPoint[]>("/api/v1/admin/dashboard/traffic");
}

export async function getErrorLog(): Promise<ErrorLogEntry[]> {
  if (USE_MOCKS) return MOCK_ERRORS;

  return apiFetch<ErrorLogEntry[]>("/api/v1/admin/dashboard/errors");
}

export async function markErrorReviewed(
  errorId: string,
  reviewed: boolean,
): Promise<ErrorLogEntry> {
  if (USE_MOCKS) {
    const existing =
      MOCK_ERRORS.find((e) => e.id === errorId) ?? MOCK_ERRORS[0];
    return { ...existing, reviewed };
  }

  return apiFetch<ErrorLogEntry>(`/api/v1/admin/dashboard/errors/${errorId}`, {
    method: "PATCH",
    body: JSON.stringify({ reviewed }),
  });
}

// Map & Champion Assests Functional Requirements

export async function listMapAssets(): Promise<MapAsset[]> {
  if (USE_MOCKS) return MOCK_MAP_ASSETS;

  return apiFetch<MapAsset[]>("/api/v1/admin/assets/maps");
}

export async function uploadMapAsset(
  mapId: number,
  displayName: string,
  file: File,
): Promise<MapAsset> {
  if (USE_MOCKS) {
    console.log("[mock] uploadMapAsset", mapId, displayName, file.name);
    return {
      map_id: mapId,
      display_name: displayName,
      image_url: URL.createObjectURL(file),
    };
  }

  const formData = new FormData();
  formData.append("map_id", String(mapId));
  formData.append("display_name", displayName);
  formData.append("file", file);
  return apiFetchFormData<MapAsset>("/api/v1/admin/assets/maps", formData);
}

export async function listChampionAssets(): Promise<ChampionAsset[]> {
  if (USE_MOCKS) return MOCK_CHAMPION_ASSETS;

  return apiFetch<ChampionAsset[]>("/api/v1/admin/assets/champions");
}

export async function uploadChampionAsset(
  championId: number,
  displayName: string,
  file: File,
): Promise<ChampionAsset> {
  if (USE_MOCKS) {
    console.log(
      "[mock] uploadChampionAsset",
      championId,
      displayName,
      file.name,
    );
    return {
      champion_id: championId,
      display_name: displayName,
      image_url: URL.createObjectURL(file),
    };
  }

  const formData = new FormData();
  formData.append("champion_id", String(championId));
  formData.append("display_name", displayName);
  formData.append("file", file);
  return apiFetchFormData<ChampionAsset>(
    "/api/v1/admin/assets/champions",
    formData,
  );
}
