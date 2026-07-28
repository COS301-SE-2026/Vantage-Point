export type AppRole = "Player" | "Admin" | "Super Admin";

// The Figma Users design states. (Active, Banned, Pending, Suspended, Inactive).
// NOTE : The Admin Page req document only defines Active, Deactivated. So are we limiting only to those 2 or is my figma fine with those 5?
export type UserStatus = "Active" | "Banned" | "Pending" | "Suspended" | "Inactive";

export interface AdminUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly username: string;
  readonly status: UserStatus;
  readonly role: AppRole;
  readonly joined_at: string;
  readonly last_active_at: string;
  readonly avatar_url: string | null;
}

export interface AdminUserListResponse {
  readonly items: AdminUser[];
  readonly total: number;
  readonly page: number;
  readonly page_size: number;
}
 
export interface AdminUserFilters {
  readonly role?: AppRole;
  readonly status?: UserStatus;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface UpdateUserPayload {
  readonly role?: Exclude<AppRole, "Super Admin">; // Admins may only assign "Player" 
  readonly status?: UserStatus;
}

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


// Map & Champion Assests Functional Requirements
export interface MapAsset {
  readonly map_id: string;
  readonly display_name: string;
  readonly image_url: string;
}
 
export interface ChampionAsset {
  readonly champion_id: string;
  readonly display_name: string;
  readonly image_url: string;
}
 
