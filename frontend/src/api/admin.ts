import { apiFetch } from "./client";
import type {
  AdminUser,
  AdminUserFilters,
  AdminUserListResponse,
  PlatformSettings,
  RegisterUserPayload,
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


// Dashboard / System Metrics Functional Requirements


// Map & Champion Assests Functional Requirements


