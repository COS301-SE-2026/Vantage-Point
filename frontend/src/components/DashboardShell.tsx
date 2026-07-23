import type { CSSProperties, ReactNode } from "react";
import UserAccountMenu from "./UserAccountMenu";
import { getDashboardContentBackdropStyle } from "../lib/dashboardLayout";
import svgPaths from "./dashboard-shell-svg";
import imgLogo from "../assets/images/dashboard/dashboard-logo-mark.png";

/** Figma 14:665 — left nav parent panel */
const DASHBOARD_SIDEBAR_LEFT = 28;
const DASHBOARD_SIDEBAR_WIDTH = 180;
const DASHBOARD_SIDEBAR_TOP = 94;
const DASHBOARD_NAV_INSET = 10;
const DASHBOARD_TOGGLE_OFFSET = -10;
const DASHBOARD_SIDEBAR_HEIGHT = 560;
const DASHBOARD_NAV_WIDTH = DASHBOARD_SIDEBAR_WIDTH - DASHBOARD_NAV_INSET * 2;
const DASHBOARD_TOGGLE_LEFT_OPEN =
  DASHBOARD_SIDEBAR_LEFT + DASHBOARD_SIDEBAR_WIDTH + DASHBOARD_TOGGLE_OFFSET;

export type DashboardSection = "matches" | "replay" | "metrics" | "profile";

interface DashboardShellProps {
  readonly children: ReactNode;
  readonly sidebarOpen: boolean;
  readonly onSidebarToggle: () => void;
  readonly activeSection?: DashboardSection;
  readonly onLogout?: () => void;
  readonly onMatchesClick?: () => void;
  readonly onReplayClick?: () => void;
  readonly onMetricsClick?: () => void;
  readonly onProfileClick?: () => void;
  readonly accountInitials?: string;
  readonly accountAvatarUrl?: string | null;
}

function Logo() {
  return (
    <div
      className="absolute left-[18px] top-[18px] z-20 flex items-center gap-[10px]"
      data-name="logo"
    >
      <div className="h-[42px] w-[56px]">
        <img
          alt="Vantage Point logo"
          className="h-full w-full object-contain"
          src={imgLogo}
        />
      </div>
      <p className="font-['League_Spartan',sans-serif] text-[31px] font-semibold leading-none tracking-[0.01em] text-[#1e1e1e]">
        VANTAGE POINT
      </p>
    </div>
  );
}

function NavItemLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="absolute left-[14px] top-[7px] font-['Inter:Regular',sans-serif] text-[20px] font-normal leading-[1.05] text-[#1e1e1e]">
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
  onMetricsClick,
  onProfileClick,
  accountInitials = "UN",
  accountAvatarUrl = null,
}: Readonly<DashboardShellProps>) {
  const panelVars = {
    "--transform-inner-width": "1200",
    "--transform-inner-height": "19",
  } as CSSProperties;

  return (
    <div className="relative min-h-screen w-full min-w-0 bg-white">
      {/* Page canvas — white so #f0f0f0 panels are visible */}
      <div
        className="absolute left-0 top-0 min-h-screen w-full min-w-0 overflow-clip bg-white"
        data-name="Frame"
      >
        <Logo />
        <div
          className="absolute bg-white transition-[left,width] duration-300 ease-out"
          style={getDashboardContentBackdropStyle(sidebarOpen)}
        />
      </div>

      <div className="absolute right-6 top-[29px] z-20">
        <UserAccountMenu
          onProfileClick={onProfileClick}
          onLogout={onLogout}
          initials={accountInitials}
          avatarUrl={accountAvatarUrl}
        />
      </div>

      {sidebarOpen ? (
        <nav
          id="dashboard-sidebar"
          data-name="Rectangle 5"
          aria-label="Dashboard navigation"
          className="absolute z-10 flex flex-col rounded-[15px] bg-[#f0f0f0]"
          style={{
            left: DASHBOARD_SIDEBAR_LEFT,
            top: DASHBOARD_SIDEBAR_TOP,
            width: DASHBOARD_SIDEBAR_WIDTH,
            height: DASHBOARD_SIDEBAR_HEIGHT,
          }}
        >
          <div className="flex flex-col gap-[13px] px-[10px] pt-[30px]">
            <button
              type="button"
              onClick={onMatchesClick}
              className="relative h-[35px] cursor-pointer rounded-[10px] border-0 bg-[#dadada] p-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
              style={{ width: DASHBOARD_NAV_WIDTH }}
              aria-label="Matches"
              aria-current={activeSection === "matches" ? "page" : undefined}
            >
              <NavItemLabel>Matches</NavItemLabel>
            </button>
            <button
              type="button"
              onClick={onReplayClick}
              className="relative h-[35px] cursor-pointer rounded-[10px] border-0 bg-[#dadada] p-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
              style={{ width: DASHBOARD_NAV_WIDTH }}
              data-name="Match Replay"
              aria-label="Match Replay"
              aria-current={activeSection === "replay" ? "page" : undefined}
            >
              <NavItemLabel>Match Replay</NavItemLabel>
            </button>
            <button
              type="button"
              onClick={onMetricsClick}
              className="relative h-[35px] cursor-pointer rounded-[10px] border-0 bg-[#dadada] p-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
              style={{ width: DASHBOARD_NAV_WIDTH }}
              data-name="Metrics"
              aria-label="Metrics"
              aria-current={activeSection === "metrics" ? "page" : undefined}
            >
              <NavItemLabel>Metrics</NavItemLabel>
            </button>
          </div>
          <div className="mt-auto px-[10px] pb-[20px]">
            <button
              type="button"
              onClick={onLogout}
              className="relative h-[35px] cursor-pointer rounded-[10px] border-0 bg-[#dadada] p-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
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
        className="absolute z-30 flex size-[24px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 transition-[left,transform] duration-300 ease-out hover:bg-[#e8e8e8]"
        style={{
          top: DASHBOARD_SIDEBAR_TOP,
          left: sidebarOpen ? DASHBOARD_TOGGLE_LEFT_OPEN : 44,
          ...panelVars,
        }}
      >
        <div
          className={`flex-none transition-transform duration-300 ease-out ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
        >
          <div
            className="relative size-[24px] overflow-clip"
            data-name="Icon / panel-top-open"
          >
            <div className="absolute inset-[9.38%]" data-name="Vector">
              <svg
                className="absolute inset-0 block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 19.5 19.5"
              >
                <g id="Vector">
                  <path d={svgPaths.p1616c880} fill="var(--fill-0, #525252)" />
                  <path d={svgPaths.p184c1a00} fill="var(--fill-0, #525252)" />
                  <path d={svgPaths.p8beb600} fill="var(--fill-0, #525252)" />
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
