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