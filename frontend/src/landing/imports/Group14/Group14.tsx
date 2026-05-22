import type { CSSProperties, ReactNode } from "react";
import UserAccountMenu from "../../app/components/UserAccountMenu";
import { getDashboardContentBackdropStyle } from "../../app/lib/dashboardLayout";
import svgPaths from "./svg-a7h301bhtl";
import imgRectangle2 from "./798001aef0b2686ac929f8c349135d3326ab65bb.webp";

/** Fixed artboard width used by this screen (px). */
export const DASHBOARD_FRAME_W = 1512;
export const DASHBOARD_FRAME_H = 982;
export const DASHBOARD_SIDEBAR_LEFT = 28;
export const DASHBOARD_SIDEBAR_WIDTH = 220;
export const DASHBOARD_SIDEBAR_TOP = 94;
export const DASHBOARD_CONTENT_GAP = 51;
export const DASHBOARD_NAV_INSET = 10;
export const DASHBOARD_TOGGLE_OFFSET = 12;

/** Panel height: wraps nav items with padding; not full viewport. */
export const DASHBOARD_SIDEBAR_HEIGHT = 400;

export const DASHBOARD_CONTENT_LEFT_OPEN =
  DASHBOARD_SIDEBAR_LEFT + DASHBOARD_SIDEBAR_WIDTH + DASHBOARD_CONTENT_GAP;

export const DASHBOARD_CONTENT_WIDTH_OPEN =
  DASHBOARD_FRAME_W - DASHBOARD_CONTENT_LEFT_OPEN;

export const DASHBOARD_NAV_WIDTH =
  DASHBOARD_SIDEBAR_WIDTH - DASHBOARD_NAV_INSET * 2;

export const DASHBOARD_NAV_LEFT = DASHBOARD_SIDEBAR_LEFT + DASHBOARD_NAV_INSET;

export const DASHBOARD_TOGGLE_LEFT_OPEN =
  DASHBOARD_SIDEBAR_LEFT + DASHBOARD_SIDEBAR_WIDTH + DASHBOARD_TOGGLE_OFFSET;

export type DashboardSection = "matches" | "profile";

interface DashboardShellProps {
  readonly children: ReactNode;
  readonly sidebarOpen: boolean;
  readonly onSidebarToggle: () => void;
  readonly activeSection?: DashboardSection;
  readonly onLogout?: () => void;
  readonly onMatchesClick?: () => void;
  readonly onProfileClick?: () => void;
  readonly accountInitials?: string;
  readonly accountAvatarUrl?: string | null;
}

interface FrameProps {
  readonly sidebarOpen: boolean;
}

function Logo() {
  return (
    <div className="absolute contents left-[12px] top-[8px]" data-name="logo">
      <div className="absolute h-[97px] left-[12px] top-[8px] w-[99px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgRectangle2}
        />
      </div>
    </div>
  );
}

function Frame({ sidebarOpen }: Readonly<FrameProps>) {
  return (
    <div
      className="absolute left-0 top-0 min-h-screen w-full min-w-0 overflow-clip bg-white"
      data-name="Frame"
    >
      <Logo />
      {sidebarOpen ? (
        <div id="dashboard-sidebar" className="contents">
          <div
            className="absolute rounded-[15px] bg-[rgba(117,117,117,0.12)]"
            style={{
              left: DASHBOARD_SIDEBAR_LEFT,
              top: DASHBOARD_SIDEBAR_TOP,
              width: DASHBOARD_SIDEBAR_WIDTH,
              height: DASHBOARD_SIDEBAR_HEIGHT,
            }}
          />
          <div
            className="absolute h-[47px] rounded-[10px] bg-white"
            style={{
              left: DASHBOARD_NAV_LEFT,
              top: 148,
              width: DASHBOARD_NAV_WIDTH,
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-3px] rounded-[13px] border-3 border-solid border-white"
            />
          </div>
          <div
            className="absolute h-[47px] rounded-[10px] bg-white"
            style={{
              left: DASHBOARD_NAV_LEFT,
              top: 213,
              width: DASHBOARD_NAV_WIDTH,
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-3px] rounded-[13px] border-3 border-solid border-[#fdfdfd]"
            />
          </div>
          <div
            className="absolute h-[47px] rounded-[10px] bg-white"
            style={{
              left: DASHBOARD_NAV_LEFT,
              top: 278,
              width: DASHBOARD_NAV_WIDTH,
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-3px] rounded-[13px] border-3 border-solid border-[#fdfdfd]"
            />
          </div>
        </div>
      ) : null}
      <p className="absolute left-[128px] top-[36px] max-w-[calc(100%-160px)] truncate font-sarina text-[clamp(18px,1.6vw,24px)] leading-normal not-italic text-black">{`Vantage Point `}</p>
      <div
        className="absolute bg-white transition-[left,width] duration-300 ease-out"
        style={getDashboardContentBackdropStyle(sidebarOpen)}
      />
    </div>
  );
}

export default function DashboardShell({
  children,
  sidebarOpen,
  onSidebarToggle,
  activeSection = "matches",
  onLogout,
  onMatchesClick,
  onProfileClick,
  accountInitials = "VP",
  accountAvatarUrl = null,
}: Readonly<DashboardShellProps>) {
  const panelVars = {
    "--transform-inner-width": "1200",
    "--transform-inner-height": "19",
  } as CSSProperties;

  return (
    <div className="relative min-h-screen w-full min-w-0">
      <Frame sidebarOpen={sidebarOpen} />
      <div className="absolute right-6 top-[29px] z-20">
        <UserAccountMenu
          onProfileClick={onProfileClick}
          onLogout={onLogout}
          initials={accountInitials}
          avatarUrl={accountAvatarUrl}
        />
      </div>
      <button
        type="button"
        onClick={onSidebarToggle}
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-sidebar"
        aria-label={
          sidebarOpen ? "Collapse navigation panel" : "Expand navigation panel"
        }
        className="absolute top-[94px] z-30 flex size-[24px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 transition-[left,transform] duration-300 ease-out hover:bg-neutral-100"
        style={{
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
      {sidebarOpen ? (
        <>
          <button
            type="button"
            onClick={onMatchesClick}
            className="absolute top-[148px] z-10 h-[47px] cursor-pointer rounded-[10px] border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-80"
            style={{
              left: DASHBOARD_NAV_LEFT,
              width: DASHBOARD_NAV_WIDTH,
            }}
            aria-label="Matches"
            aria-current={activeSection === "matches" ? "page" : undefined}
          >
            <span className="absolute left-[20px] top-[12px] font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[1.4] text-[#1e1e1e]">
              Matches
            </span>
          </button>
          <div
            className="absolute top-[224px] flex content-stretch items-start pointer-events-none"
            style={{
              left: DASHBOARD_NAV_LEFT + 20,
              width: DASHBOARD_NAV_WIDTH - 20,
            }}
            data-name="Text"
          >
            <p className="relative shrink-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[1.4] not-italic text-[#1e1e1e]">
              Analysis
            </p>
          </div>
          <div
            className="absolute top-[286px] flex content-stretch items-start pointer-events-none"
            style={{
              left: DASHBOARD_NAV_LEFT + 20,
              width: DASHBOARD_NAV_WIDTH - 20,
            }}
            data-name="Text"
          >
            <p className="relative shrink-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[14px] font-normal leading-[1.4] not-italic text-[#1e1e1e]">
              Metrics
            </p>
          </div>
        </>
      ) : null}
      {children}
    </div>
  );
}
