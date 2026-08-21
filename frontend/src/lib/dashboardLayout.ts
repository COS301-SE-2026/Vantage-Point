/**
 * Chrome measurements for the dashboard app shell.
 *
 * The dashboard used to be an absolutely-positioned copy of a 1512px Figma
 * frame: every view computed its own `left`/`width` from the sidebar state and
 * pinned itself under a fixed header. That could not reflow, so wide screens
 * got a column of dead space and narrow ones got a scrollbar. The shell is now
 * an ordinary flex layout — sidebar beside a scrolling main column — and these
 * are the only numbers it still needs.
 */

/** Expanded rail: wide enough for a label at 14px plus its icon. */
export const DASHBOARD_SIDEBAR_WIDTH = 232;

/** Collapsed rail: icons only, still a real click target. */
export const DASHBOARD_RAIL_WIDTH = 68;
