export type AppRole = "Player" | "Admin" | "Super Admin";

// Cognito's own account-status enum (from `user_status` on GET /admin/users).
export type CognitoUserStatus =
  | "CONFIRMED"
  | "UNCONFIRMED"
  | "FORCE_CHANGE_PASSWORD"
  | "RESET_REQUIRED"
  | "ARCHIVED"
  | "COMPROMISED"
  | "EXTERNAL_PROVIDER";

export type UserStatus = "Active" | "Pending" | "Disabled";

// adjusted the order and info based on Cognito side that Shaun shared so there is no mismatch when reading and easier for future reference
export interface AdminUser {
  readonly username: string; // primary key — Cognito has no separate `id`
  readonly email: string;
  readonly sub: string;
  readonly user_created_date: string;
  readonly user_last_modified_date: string;
  readonly enabled: boolean;
  readonly user_status: CognitoUserStatus;
  readonly role: AppRole; // derived from Cognito group membership
}

export function deriveUserStatus(
  u: Pick<AdminUser, "enabled" | "user_status">,
): UserStatus {
  if (!u.enabled) return "Disabled";
  return u.user_status === "CONFIRMED" ? "Active" : "Pending";
}
// I am basing this on the fact that the only way to get a user into the "CONFIRMED" state is to have them complete the registration flow, which is what we want to consider "Active".
// Also just on what Shaun described on discord.

export interface AdminUserListResponse {
  readonly items: AdminUser[];
}

export interface AdminUserFilters {
  readonly role?: AppRole;
  readonly status?: UserStatus;
}

// removed UpdateUserPayload based on backend capabilities

export interface RegisterUserPayload {
  readonly email: string;
  readonly display_name: string;
  readonly password: string;
}

export interface PlatformSettings {
  readonly registrations_open: boolean;
}

// Match Data / Data Ingestion Functional Requirements
export type SessionDeletionStatus = "active" | "flagged";

export interface AdminMatchSession {
  readonly id: string;
  readonly match_id: string;
  readonly map_name: string;
  readonly player_count: number;
  readonly played_at: string;
  readonly deletion_status: SessionDeletionStatus;
}

export interface AdminMatchSessionListResponse {
  readonly items: AdminMatchSession[];
  readonly total: number;
}

export interface MatchSessionFilters {
  readonly mapName?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly page?: number;
}

// Dashboard / System Metrics Functional Requirements
export interface DashboardMetrics {
  readonly active_users: number;
  readonly inactive_users: number;
  readonly matches_last_5_months: number;
  readonly matches_all_time: number;
  readonly storage_matches_mb: number;
  readonly storage_profiles_mb: number;
  readonly storage_other_mb: number;
}

export interface SiteTrafficPoint {
  readonly month: string; // "February 2026"
  readonly relative_load: number; // the "x" scale in the Figma
}

export interface ErrorLogEntry {
  readonly id: string;
  readonly error_code: string;
  readonly error_message: string;
  readonly occurred_at: string;
  readonly reviewed: boolean;
}

// Map & Champion Assets Functional Requirements
export interface MapAsset {
  readonly map_id: number;
  readonly display_name: string;
  readonly image_url: string;
}

export interface ChampionAsset {
  readonly champion_id: number;
  readonly display_name: string;
  readonly image_url: string;
}
