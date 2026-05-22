import type { CSSProperties } from "react";
import { DASHBOARD_CONTENT_LEFT_OPEN } from "../../imports/Group14/Group14";

export {
  DASHBOARD_CONTENT_LEFT_OPEN,
  DASHBOARD_FRAME_W,
} from "../../imports/Group14/Group14";

export const DASHBOARD_CONTENT_TOP = "var(--vp-dashboard-header)";

export const DASHBOARD_CONTENT_HEIGHT =
  "calc(100vh - var(--vp-dashboard-header))";

export function getDashboardContentStyle(sidebarOpen: boolean): CSSProperties {
  if (sidebarOpen) {
    return {
      left: DASHBOARD_CONTENT_LEFT_OPEN,
      width: `calc(100% - ${DASHBOARD_CONTENT_LEFT_OPEN}px)`,
    };
  }
  return { left: 0, width: "100%" };
}

export function getDashboardContentBackdropStyle(
  sidebarOpen: boolean,
): CSSProperties {
  const base: CSSProperties = {
    top: "var(--vp-dashboard-header)",
    height: DASHBOARD_CONTENT_HEIGHT,
  };
  return { ...base, ...getDashboardContentStyle(sidebarOpen) };
}
