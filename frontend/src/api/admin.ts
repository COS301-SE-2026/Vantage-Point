import { apiFetch, apiFetchFormData } from "./client";
import type {
    AdminMatchSession,
    AdminMatchSessionListResponse,
    AdminUser,
    AdminUserFilters,
    AdminUserListResponse,
    ChampionAsset,
    DashboardMetrics,
    ErrorLogEntry,
    MapAsset,
    MatchSessionFilters,
    PlatformSettings,
    RegisterUserPayload,
    SiteTrafficPoint,
    UpdateUserPayload,
} from "../types/admin";

// MOCK DATA - STUB for Local UI testing only,
// delete this  block and eveer "if (USE_MOCKS) { ... } block once backend admin routes exist"
const USE_MOCKS = import.meta.env.DEV; // STUB — flip off once backend admin routes exist

const MOCK_USERS: AdminUser[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    username: "jonny77",
    status: "Active",
    role: "Admin",
    joined_at: "2023-03-12T00:00:00Z",
    last_active_at: new Date(Date.now() - 60_000).toISOString(),
    avatar_url: null,
  },
  {
    id: "2",
    name: "Daniel Warren",
    email: "dwarren3@example.com",
    username: "dwarren3",
    status: "Banned",
    role: "Player",
    joined_at: "2024-01-08T00:00:00Z",
    last_active_at: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    avatar_url: null,
  },
  {
    id: "3",
    name: "Chloe Hye",
    email: "chloehye@example.com",
    username: "chloehh",
    status: "Pending",
    role: "Admin",
    joined_at: "2021-10-05T00:00:00Z",
    last_active_at: new Date(Date.now() - 10 * 86_400_000).toISOString(),
    avatar_url: null,
  },
  {
    id: "4",
    name: "Isabelle Clark",
    email: "belleclark@example.com",
    username: "bellecl",
    status: "Active",
    role: "Super Admin",
    joined_at: "2022-08-30T00:00:00Z",
    last_active_at: new Date(Date.now() - 7 * 86_400_000).toISOString(),
    avatar_url: null,
  },
  {
    id: "5",
    name: "Marcus Reeds",
    email: "reeds777@example.com",
    username: "reeds7",
    status: "Suspended",
    role: "Player",
    joined_at: "2023-02-19T00:00:00Z",
    last_active_at: new Date(Date.now() - 90 * 86_400_000).toISOString(),
    avatar_url: null,
  },
  {
    id: "6",
    name: "Mia Naddlin",
    email: "mianaddlin@example.com",
    username: "mianaddlin",
    status: "Inactive",
    role: "Admin",
    joined_at: "2021-12-31T00:00:00Z",
    last_active_at: new Date(Date.now() - 120 * 86_400_000).toISOString(),
    avatar_url: null,
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
  { map_id: "summoners_rift", display_name: "Summoner's Rift", image_url: "" },
];
 
const MOCK_CHAMPION_ASSETS: ChampionAsset[] = [
  { champion_id: "ahri", display_name: "Ahri", image_url: "" },
];

// USERS Functional Requirements

export async function listUsers(
  filters: AdminUserFilters = {},
): Promise<AdminUserListResponse> {

    if (USE_MOCKS) {
    return { items: MOCK_USERS, total: MOCK_USERS.length, page: 1, page_size: 10 };
  }

  const params = new URLSearchParams();
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);
  params.set("page", String(filters.page ?? 1));
  params.set("page_size", String(filters.pageSize ?? 10));
  return apiFetch<AdminUserListResponse>(`/api/v1/admin/users?${params}`);
}
 
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<AdminUser> {

    if (USE_MOCKS) {
    const existing = MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0];
    return { ...existing, ...payload };
  }

  return apiFetch<AdminUser>(`/api/v1/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
 
export async function deleteUser(userId: string): Promise<void> {

    if (USE_MOCKS) {
    console.log("[mock] deleteUser", userId);
    return;
  }

  return apiFetch<void>(`/api/v1/admin/users/${userId}`, {
    method: "DELETE",
  });
}
 
export async function registerUserManually(
  payload: RegisterUserPayload,
): Promise<AdminUser> {

    if (USE_MOCKS) {
    return {
      id: crypto.randomUUID(),
      name: payload.display_name,
      email: payload.email,
      username: payload.email.split("@")[0],
      status: "Active",
      role: "Player",
      joined_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      avatar_url: null,
    };
  }


  return apiFetch<AdminUser>("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
 
export async function getPlatformSettings(): Promise<PlatformSettings> {

    if (USE_MOCKS) {
    return MOCK_SETTINGS;
  }

  return apiFetch<PlatformSettings>("/api/v1/admin/settings");
}
 
export async function setRegistrationsOpen(
  open: boolean,
): Promise<PlatformSettings> {

    if (USE_MOCKS) {
    console.log("[mock] setRegistrationsOpen", open);
    return { registrations_open: open };
  }

  return apiFetch<PlatformSettings>("/api/v1/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ registrations_open: open }),
  });
}


// Match Data/ Data Ingestion (Matches view) Functional Requirements

export async function listMatchSessions(
  filters: MatchSessionFilters = {},
): Promise<AdminMatchSessionListResponse> {

    if (USE_MOCKS) {
    return { items: MOCK_SESSIONS, total: MOCK_SESSIONS.length  };
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
    const existing = MOCK_SESSIONS.find((s) => s.id === sessionId) ?? MOCK_SESSIONS[0];
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
    const existing = MOCK_SESSIONS.find((s) => s.id === sessionId) ?? MOCK_SESSIONS[0];
    return { ...existing, deletion_status: "active" };
  }

  return apiFetch<AdminMatchSession>(
    `/api/v1/admin/sessions/${sessionId}/unflag-delete`,
    { method: "POST" },
  );
}
 
/** Super Admin only — bypasses the 24h queue (FR-A13). */
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
    const existing = MOCK_ERRORS.find((e) => e.id === errorId) ?? MOCK_ERRORS[0];
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
  mapId: string,
  displayName: string,
  file: File,
): Promise<MapAsset> {

    if (USE_MOCKS) {
    console.log("[mock] uploadMapAsset", mapId, displayName, file.name);
    return { map_id: mapId, display_name: displayName, image_url: URL.createObjectURL(file) };
    }

  const formData = new FormData();
  formData.append("map_id", mapId);
  formData.append("display_name", displayName);
  formData.append("file", file);
  return apiFetchFormData<MapAsset>("/api/v1/admin/assets/maps", formData);
}
 
export async function listChampionAssets(): Promise<ChampionAsset[]> {
  if (USE_MOCKS) return MOCK_CHAMPION_ASSETS;

  return apiFetch<ChampionAsset[]>("/api/v1/admin/assets/champions");
}
 
export async function uploadChampionAsset(
  championId: string,
  displayName: string,
  file: File,
): Promise<ChampionAsset> {
    
  if (USE_MOCKS) {
    console.log("[mock] uploadChampionAsset", championId, displayName, file.name);
    return { champion_id: championId, display_name: displayName, image_url: URL.createObjectURL(file) };
  }

  const formData = new FormData();
  formData.append("champion_id", championId);
  formData.append("display_name", displayName);
  formData.append("file", file);
  return apiFetchFormData<ChampionAsset>(
    "/api/v1/admin/assets/champions",
    formData,
  );
}

