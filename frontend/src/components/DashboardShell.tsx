import type { CSSProperties, ReactNode } from "react";
import UserAccountMenu from "./UserAccountMenu";
import { getDashboardContentBackdropStyle } from "../lib/dashboardLayout";
import svgPaths from "./dashboard-shell-svg";
import imgLogo from "../assets/images/logos/logo-mark.webp";
import imgLogoWhite from "../assets/images/logos/logo-mark-white.webp";

/**
 * Figma 13:1171 — left nav parent panel, x 34…214 / y 93…643. The panel is
 * pulled up to 72 with the header band so the content does not start a fifth of
 * the way down the screen; the x offsets stay on the Figma grid.
 */
const DASHBOARD_SIDEBAR_LEFT = 34;
const DASHBOARD_SIDEBAR_WIDTH = 180;
const DASHBOARD_SIDEBAR_TOP = 72;
const DASHBOARD_NAV_INSET = 10;
const DASHBOARD_SIDEBAR_HEIGHT = 550;
const DASHBOARD_NAV_WIDTH = DASHBOARD_SIDEBAR_WIDTH - DASHBOARD_NAV_INSET * 2;

/** Figma 13:1177–13:1180 — 35px rows at y 125 / 178 / 231, log out at 595. */
const DASHBOARD_NAV_PADDING_TOP = 32;
const DASHBOARD_NAV_GAP = 18;
const DASHBOARD_NAV_PADDING_BOTTOM = 13;

/** Figma 13:1172 — 14px glyph inside the panel, 7.5px in from its right edge. */
const DASHBOARD_TOGGLE_ICON = 14;
const DASHBOARD_TOGGLE_HIT = 24;
const DASHBOARD_TOGGLE_CENTER_Y = 14;
const DASHBOARD_TOGGLE_RIGHT_INSET = 7.5;
const DASHBOARD_TOGGLE_TOP =
  DASHBOARD_SIDEBAR_TOP + DASHBOARD_TOGGLE_CENTER_Y - DASHBOARD_TOGGLE_HIT / 2;
const DASHBOARD_TOGGLE_LEFT_OPEN =
  DASHBOARD_SIDEBAR_LEFT +
  DASHBOARD_SIDEBAR_WIDTH -
  DASHBOARD_TOGGLE_RIGHT_INSET -
  DASHBOARD_TOGGLE_ICON / 2 -
  DASHBOARD_TOGGLE_HIT / 2;
const DASHBOARD_TOGGLE_LEFT_CLOSED = DASHBOARD_SIDEBAR_LEFT;

export type DashboardSection = "matches" | "replay" | "metrics" | "profile";

interface DashboardShellProps {
  readonly children: ReactNode;
  readonly sidebarOpen: boolean;
  readonly onSidebarToggle: () => void;
  readonly activeSection?: DashboardSection;
  readonly onLogout?: () => void;
  readonly onMatchesClick?: () => void;
  readonly onReplayClick?: () => void;
  readonly onProfileClick?: () => void;
  readonly accountInitials?: string;
  readonly accountAvatarUrl?: string | null;
  /** Figma 14:464 — shown beside the 88px avatar on the Profile Page only. */
  readonly accountName?: string;
  readonly accountTag?: string;
  readonly onEditProfileClick?: () => void;

  readonly onAdminClick?: () => void;
  readonly userRole?: string;
}

/**
 * Figma 54:320 — mark at (24,32) 68px wide, wordmark at (94,42) 15px caps.
 * Both are re-centred in the 72px band: the mark renders 38px tall at w=68,
 * so it sits at (72-38)/2, and the 20px wordmark at (72-20)/2.
 */
function Logo() {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-20 h-[72px] w-[214px]"
      data-name="Logo"
      data-node-id="54:320"
    >
      {/* Figma 13:1199 — the mark is a solid silhouette, so dark needs the white cut. */}
      <picture>
        <source srcSet={imgLogoWhite} media="(prefers-color-scheme: dark)" />
        <img
          alt="Vantage Point logo"
          className="absolute left-[25px] top-[17px] h-auto w-[68px] object-contain"
          src={imgLogo}
        />
      </picture>
      <p className="absolute left-[94px] top-[26px] h-[20px] font-['League_Spartan',sans-serif] text-[15px] font-bold uppercase leading-[20px] tracking-[0.6px] whitespace-nowrap text-[#1e1e1e] device-dark:text-white">
        Vantage Point
      </p>
    </div>
  );
}

function NavItemLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="font-['Beaufort_for_LOL',serif] text-[14px] font-normal leading-[20px] text-[#1e1e1e] device-dark:text-white">
      {children}
    </span>
  );
}

export default function DashboardShell({
  children,
  sidebarOpen,
  onSidebarToggle,
  activeSection = "matches",
  onLogout,
  onMatchesClick,
  onReplayClick,
  onProfileClick,
  accountInitials = "UN",
  accountAvatarUrl = null,
  accountName,
  accountTag,
  onEditProfileClick,

  onAdminClick,
  userRole,
}: Readonly<DashboardShellProps>) {
  const showAccountHeading = Boolean(accountName);
  const panelVars = {
    "--transform-inner-width": "1200",
    "--transform-inner-height": "19",
  } as CSSProperties;
  /** The 88px account avatar needs a taller band than the default 72. */
  const headerVars = showAccountHeading
    ? ({ "--vp-dashboard-header": "108px" } as CSSProperties)
    : undefined;

    const isAdmin = userRole?.toLowerCase() === "admin";

  return (
    <div
      className="relative min-h-screen w-full min-w-0 bg-white device-dark:bg-[#181818]"
      style={headerVars}
    >
      {/* Page canvas — white so #f0f0f0 panels are visible */}
      <div
        className="absolute left-0 top-0 min-h-screen w-full min-w-0 overflow-clip bg-white device-dark:bg-[#181818]"
        data-name="Frame"
      >
        <Logo />
        <div
          className="absolute bg-white device-dark:bg-[#181818] transition-[left,width] duration-300 ease-out"
          style={getDashboardContentBackdropStyle(sidebarOpen)}
        />
      </div>

      {showAccountHeading ? (
        /* Figma 14:440 (141×60 heading) butted against the 88px avatar at 13:1166. */
        <div className="absolute right-[15px] top-[16px] z-20 flex items-center">
          <div className="w-[141px] px-[15px]" data-node-id="14:464">
            <p className="h-[29px] truncate font-['Beaufort_for_LOL',serif] text-[24px] font-medium leading-[29px] text-[#1e1e1e] device-dark:text-white">
              {accountName}
            </p>
            {accountTag ? (
              <p className="mt-[2px] h-[22px] truncate font-['Inter',sans-serif] text-[16px] leading-[22px] text-[#b7b7b7] device-dark:text-[#929292]">
                {accountTag}
              </p>
            ) : null}
          </div>
          <UserAccountMenu
            onProfileClick={onProfileClick}
            onEditProfileClick={onEditProfileClick}
            onLogout={onLogout}
            initials={accountInitials}
            avatarUrl={accountAvatarUrl}
            size={88}
          />
        </div>
      ) : (
        <div className="absolute right-6 top-[12px] z-20">
          <UserAccountMenu
            onProfileClick={onProfileClick}
            onEditProfileClick={onEditProfileClick}
            onLogout={onLogout}
            initials={accountInitials}
            avatarUrl={accountAvatarUrl}
          />
        </div>
      )}

      {sidebarOpen ? (
        <nav
          id="dashboard-sidebar"
          data-name="Rectangle 5"
          aria-label="Dashboard navigation"
          className="absolute z-10 flex flex-col rounded-[15px] bg-[#f0f0f0] device-dark:bg-[#3a3939]"
          style={{
            left: DASHBOARD_SIDEBAR_LEFT,
            top: DASHBOARD_SIDEBAR_TOP,
            width: DASHBOARD_SIDEBAR_WIDTH,
            height: DASHBOARD_SIDEBAR_HEIGHT,
          }}
        >
          <div
            className="flex flex-col px-[10px]"
            style={{
              gap: DASHBOARD_NAV_GAP,
              paddingTop: DASHBOARD_NAV_PADDING_TOP,
            }}
          >
            <button
              type="button"
              onClick={onMatchesClick}
              className="flex h-[35px] cursor-pointer items-center rounded-[10px] border-0 bg-[#dadada] device-dark:bg-[#2a2a2a] py-0 pl-[12px] pr-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
              style={{ width: DASHBOARD_NAV_WIDTH }}
              aria-label="Matches"
              aria-current={activeSection === "matches" ? "page" : undefined}
            >
              <NavItemLabel>Matches</NavItemLabel>
            </button>
            <button
              type="button"
              onClick={onReplayClick}
              className="flex h-[35px] cursor-pointer items-center rounded-[10px] border-0 bg-[#dadada] device-dark:bg-[#2a2a2a] py-0 pl-[12px] pr-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
              style={{ width: DASHBOARD_NAV_WIDTH }}
              data-name="Match Replay"
              aria-label="Match Replay"
              aria-current={activeSection === "replay" ? "page" : undefined}
            >
              <NavItemLabel>Match Replay</NavItemLabel>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={onAdminClick}
                className="flex h-[35px] cursor-pointer items-center rounded-[10px] border-0 bg-[#dadada] device-dark:bg-[#2a2a2a] py-0 pl-[12px] pr-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
                style={{ width: DASHBOARD_NAV_WIDTH }}
                aria-label="Admin Panel"
              >
                <NavItemLabel>Admin Panel</NavItemLabel>
              </button>
            )}
          </div>
          <div
            className="mt-auto px-[10px]"
            style={{ paddingBottom: DASHBOARD_NAV_PADDING_BOTTOM }}
          >
            <button
              type="button"
              onClick={onLogout}
              className="flex h-[35px] cursor-pointer items-center rounded-[10px] border-0 bg-[#dadada] device-dark:bg-[#2a2a2a] py-0 pl-[12px] pr-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
              style={{ width: DASHBOARD_NAV_WIDTH }}
              aria-label="Log out"
            >
              <NavItemLabel>Log out</NavItemLabel>
            </button>
          </div>
        </nav>
      ) : null}

      <button
        type="button"
        onClick={onSidebarToggle}
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-sidebar"
        aria-label={
          sidebarOpen ? "Collapse navigation panel" : "Expand navigation panel"
        }
        className="absolute z-30 flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#525252] transition-[left,transform] duration-300 ease-out hover:bg-[#e8e8e8] device-dark:text-[#e5e5e5] device-dark:hover:bg-[#4a4949]"
        style={{
          top: DASHBOARD_TOGGLE_TOP,
          left: sidebarOpen
            ? DASHBOARD_TOGGLE_LEFT_OPEN
            : DASHBOARD_TOGGLE_LEFT_CLOSED,
          width: DASHBOARD_TOGGLE_HIT,
          height: DASHBOARD_TOGGLE_HIT,
          ...panelVars,
        }}
      >
        <div
          className={`flex-none transition-transform duration-300 ease-out ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
        >
          <div
            className="relative size-[14px] overflow-clip"
            data-name="Icon / panel-top-open"
          >
            <div className="absolute inset-0" data-name="Vector">
              <svg
                className="absolute inset-0 block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 19.5 19.5"
              >
                <g id="Vector">
                  <path d={svgPaths.p1616c880} fill="currentColor" />
                  <path d={svgPaths.p184c1a00} fill="currentColor" />
                  <path d={svgPaths.p8beb600} fill="currentColor" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </button>

      {children}
    </div>
  );
}
