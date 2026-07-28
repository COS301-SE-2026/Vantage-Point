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

// USERS Fucntional Requirements

export async function listUsers(
  filters: AdminUserFilters = {},
): Promise<AdminUserListResponse> {
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
  return apiFetch<AdminUser>(`/api/v1/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
 
export async function deleteUser(userId: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/users/${userId}`, {
    method: "DELETE",
  });
}
 
export async function registerUserManually(
  payload: RegisterUserPayload,
): Promise<AdminUser> {
  return apiFetch<AdminUser>("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
 
export async function getPlatformSettings(): Promise<PlatformSettings> {
  return apiFetch<PlatformSettings>("/api/v1/admin/settings");
}
 
export async function setRegistrationsOpen(
  open: boolean,
): Promise<PlatformSettings> {
  return apiFetch<PlatformSettings>("/api/v1/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ registrations_open: open }),
  });
}

// Match Data/ Data Ingestion (Matches view) Functional Requirements
export async function listMatchSessions(
  filters: MatchSessionFilters = {},
): Promise<AdminMatchSessionListResponse> {
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
  return apiFetch<AdminMatchSession>(
    `/api/v1/admin/sessions/${sessionId}/flag-delete`,
    { method: "POST" },
  );
}
 
export async function unflagSessionForDeletion(
  sessionId: string,
): Promise<AdminMatchSession> {
  return apiFetch<AdminMatchSession>(
    `/api/v1/admin/sessions/${sessionId}/unflag-delete`,
    { method: "POST" },
  );
}
 
/** Super Admin only — bypasses the 24h queue (FR-A13). */
export async function hardDeleteSession(sessionId: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/sessions/${sessionId}`, {
    method: "DELETE",
  });
}


// Dashboard / System Metrics Functional Requirements
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiFetch<DashboardMetrics>("/api/v1/admin/dashboard/metrics");
}
 
export async function getSiteTraffic(): Promise<SiteTrafficPoint[]> {
  return apiFetch<SiteTrafficPoint[]>("/api/v1/admin/dashboard/traffic");
}
 
export async function getErrorLog(): Promise<ErrorLogEntry[]> {
  return apiFetch<ErrorLogEntry[]>("/api/v1/admin/dashboard/errors");
}
 
export async function markErrorReviewed(
  errorId: string,
  reviewed: boolean,
): Promise<ErrorLogEntry> {
  return apiFetch<ErrorLogEntry>(`/api/v1/admin/dashboard/errors/${errorId}`, {
    method: "PATCH",
    body: JSON.stringify({ reviewed }),
  });
}


// Map & Champion Assests Functional Requirements
export async function listMapAssets(): Promise<MapAsset[]> {
  return apiFetch<MapAsset[]>("/api/v1/admin/assets/maps");
}
 
export async function uploadMapAsset(
  mapId: string,
  displayName: string,
  file: File,
): Promise<MapAsset> {
  const formData = new FormData();
  formData.append("map_id", mapId);
  formData.append("display_name", displayName);
  formData.append("file", file);
  return apiFetchFormData<MapAsset>("/api/v1/admin/assets/maps", formData);
}
 
export async function listChampionAssets(): Promise<ChampionAsset[]> {
  return apiFetch<ChampionAsset[]>("/api/v1/admin/assets/champions");
}
 
export async function uploadChampionAsset(
  championId: string,
  displayName: string,
  file: File,
): Promise<ChampionAsset> {
  const formData = new FormData();
  formData.append("champion_id", championId);
  formData.append("display_name", displayName);
  formData.append("file", file);
  return apiFetchFormData<ChampionAsset>(
    "/api/v1/admin/assets/champions",
    formData,
  );
}

