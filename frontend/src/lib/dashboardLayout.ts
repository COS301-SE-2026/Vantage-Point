import type { CSSProperties } from "react";

export const DASHBOARD_FRAME_W = 1512;
/** Figma 13:1171 (Rectangle 5) — panel spans x 34…214, content starts at 248. */
const DASHBOARD_SIDEBAR_LEFT = 34;
const DASHBOARD_SIDEBAR_WIDTH = 180;
const DASHBOARD_CONTENT_GAP = 34;

export const DASHBOARD_CONTENT_LEFT_OPEN =
  DASHBOARD_SIDEBAR_LEFT + DASHBOARD_SIDEBAR_WIDTH + DASHBOARD_CONTENT_GAP;

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

/**
 * Collapsing the sidebar hands the content region the full frame width. Views
 * built around a fixed-width column centre it in that space so it doesn't snap
 * to the far-left edge; fluid views keep filling the region instead.
 */
export function getDashboardColumnAlignClass(sidebarOpen: boolean): string {
  return sidebarOpen ? "" : "mx-auto";
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
