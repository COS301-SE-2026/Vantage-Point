import type { PlayerProfile } from "../types/profile";

export type DashboardOutletContext = {
  readonly sidebarOpen: boolean;
  readonly profile?: PlayerProfile;
  readonly refreshProfile?: () => Promise<void>;
};
