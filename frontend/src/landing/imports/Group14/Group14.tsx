import { useState, type CSSProperties } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import MatchDetailView from "../../app/components/MatchDetailView";
import MatchesListView from "../../app/components/MatchesListView";
import ProfileView from "../../app/components/ProfileView";
import UserAccountMenu from "../../app/components/UserAccountMenu";
import svgPaths from "./svg-a7h301bhtl";
import imgRectangle2 from "./798001aef0b2686ac929f8c349135d3326ab65bb.webp";

/** Fixed artboard width used by this screen (px). */
const DASHBOARD_FRAME_W = 1512;
const SEARCH_WIDTH = 377;
const TOOLBAR_GAP = 16;
const TOOLBAR_ICON_SIZE = 40;
const TOOLBAR_ICON_GAP = 8;

export type DashboardView = "matches" | "profile";

interface Group1Props {
  readonly onLogout?: () => void;
  readonly onMatchSelect?: (matchId: string) => void;
  readonly selectedMatchId?: string | null;
  readonly onMatchBack?: () => void;
  readonly activeView?: DashboardView;
  readonly onProfileClick?: () => void;
  readonly onDashboardClick?: () => void;
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
      className="absolute bg-white h-[982px] left-0 overflow-clip top-0 w-[1512px]"
      data-name="Frame"
    >
      <Logo />
      {sidebarOpen ? (
        <div id="dashboard-sidebar" className="contents">
          <div className="absolute bg-[rgba(117,117,117,0.12)] h-[366px] left-[28px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[94px] w-[293px]" />
          <div className="absolute bg-white h-[47px] left-[38px] rounded-[10px] top-[148px] w-[272px]">
            <div
              aria-hidden="true"
              className="absolute border-3 border-solid border-white inset-[-3px] pointer-events-none rounded-[13px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            />
          </div>
          <div className="absolute bg-white h-[47px] left-[39px] rounded-[10px] top-[213px] w-[272px]">
            <div
              aria-hidden="true"
              className="absolute border-3 border-[#fdfdfd] border-solid inset-[-3px] pointer-events-none rounded-[13px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            />
          </div>
          <div className="absolute bg-white h-[47px] left-[40px] rounded-[10px] top-[278px] w-[273px]">
            <div
              aria-hidden="true"
              className="absolute border-3 border-[#fdfdfd] border-solid inset-[-3px] pointer-events-none rounded-[13px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>
      ) : null}
      <p className="absolute left-[128px] top-[36px] whitespace-nowrap font-sarina text-[clamp(18px,1.6vw,24px)] leading-normal not-italic text-black">{`Vantage Point `}</p>
      <div
        className="absolute top-[94px] h-[840px] bg-white transition-[left,width] duration-300 ease-out"
        style={
          sidebarOpen
            ? { left: 372, width: 1091 }
            : { left: 0, width: DASHBOARD_FRAME_W }
        }
      />
    </div>
  );
}

export default function Group1({
  onLogout,
  onMatchSelect,
  selectedMatchId = null,
  onMatchBack,
  activeView = "matches",
  onProfileClick,
  onDashboardClick,
}: Readonly<Group1Props>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const showMatches = activeView === "matches";
  const showMatchDetail = showMatches && selectedMatchId !== null;
  const showMatchList = showMatches && selectedMatchId === null;
  const searchLeft = sidebarOpen
    ? 912
    : Math.round((DASHBOARD_FRAME_W - SEARCH_WIDTH) / 2);
  const filterLeft = searchLeft + SEARCH_WIDTH + TOOLBAR_GAP;
  const sortLeft = filterLeft + TOOLBAR_ICON_SIZE + TOOLBAR_ICON_GAP;

  const panelVars = {
    "--transform-inner-width": "1200",
    "--transform-inner-height": "19",
  } as CSSProperties;

  return (
    <div className="relative size-full">
      <Frame sidebarOpen={sidebarOpen} />
      <div className="absolute right-6 top-[29px] z-20">
        <UserAccountMenu
          onProfileClick={onProfileClick}
          onLogout={onLogout}
        />
      </div>
      {activeView === "profile" ? (
        <ProfileView sidebarOpen={sidebarOpen} />
      ) : null}
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-sidebar"
        aria-label={
          sidebarOpen ? "Collapse navigation panel" : "Expand navigation panel"
        }
        className="absolute top-[94px] flex size-[24px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 transition-[left,transform] duration-300 ease-out hover:bg-neutral-100"
        style={{ left: sidebarOpen ? 330 : 44, ...panelVars }}
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
            onClick={onDashboardClick}
            className="absolute left-[38px] top-[148px] z-10 h-[47px] w-[272px] cursor-pointer rounded-[10px] border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-80"
            aria-label="Matches"
          >
            <span className="absolute left-[20px] top-[10px] font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] text-[#1e1e1e]">
              Matches
            </span>
          </button>
          <div
            className="absolute left-[58px] top-[224px] flex w-[233px] content-stretch items-start pointer-events-none"
            data-name="Text"
          >
            <p className="relative shrink-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] not-italic text-[#1e1e1e]">
              Analysis
            </p>
          </div>
          <div
            className="absolute left-[58px] top-[286px] flex w-[233px] content-stretch items-start pointer-events-none"
            data-name="Text"
          >
            <p className="relative shrink-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] not-italic text-[#1e1e1e]">
              Metrics
            </p>
          </div>
        </>
      ) : null}
      {showMatchList ? (
        <>
          <div
            className="absolute top-[29px] min-w-[120px] w-[377px] rounded-[9999px] bg-white transition-[left] duration-300 ease-out"
            style={{ left: searchLeft, width: SEARCH_WIDTH }}
            data-name="Search"
          >
            <label
              htmlFor="dashboard-search"
              className="relative flex size-full cursor-text items-center gap-[8px] overflow-clip rounded-[inherit] px-[16px] py-[12px]"
            >
              <input
                id="dashboard-search"
                type="search"
                name="dashboard-search"
                placeholder="search"
                aria-label="Search"
                className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-none text-[#1e1e1e] caret-[#1e1e1e] outline-none placeholder:font-['Inter:Regular',sans-serif] placeholder:text-[#b3b3b3] placeholder:font-normal"
              />
              <div
                className="relative size-[16px] shrink-0 overflow-clip"
                data-name="Search"
              >
                <div className="absolute inset-[12.5%]" data-name="Icon">
                  <div className="absolute inset-[-6.67%]">
                    <svg
                      className="block size-full"
                      fill="none"
                      preserveAspectRatio="none"
                      viewBox="0 0 13.6 13.6"
                    >
                      <path
                        d={svgPaths.p8625680}
                        id="Icon"
                        stroke="var(--stroke-0, #1E1E1E)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </label>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-0.5px] rounded-[9999.5px] border border-solid border-[#d9d9d9]"
            />
          </div>
          <button
            type="button"
            aria-label="Filter matches"
            className="absolute top-[29px] flex size-[40px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#0a0a0a] transition-[left] duration-300 ease-out hover:bg-neutral-100"
            style={{ left: filterLeft }}
          >
            <Filter className="size-[22px]" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Sort matches"
            className="absolute top-[29px] flex size-[40px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#0a0a0a] transition-[left] duration-300 ease-out hover:bg-neutral-100"
            style={{ left: sortLeft }}
          >
            <ArrowUpDown className="size-[22px]" strokeWidth={2} aria-hidden />
          </button>
          <MatchesListView
            sidebarOpen={sidebarOpen}
            onMatchSelect={onMatchSelect}
          />
        </>
      ) : null}
      {showMatchDetail && selectedMatchId && onMatchBack ? (
        <MatchDetailView
          matchId={selectedMatchId}
          sidebarOpen={sidebarOpen}
          onBack={onMatchBack}
        />
      ) : null}
    </div>
  );
}
