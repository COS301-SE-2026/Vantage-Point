import { useState, type CSSProperties } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
} from "lucide-react";
import ProfileView from "../../app/components/ProfileView";
import {
  MOCK_MATCH_HISTORY_BY_DAY,
  type DashboardMatchCard,
  type MatchHistoryDayRow,
} from "../../app/mocks/matchHistory";
import svgPaths from "./svg-a7h301bhtl";
import imgRectangle2 from "./798001aef0b2686ac929f8c349135d3326ab65bb.webp";

/** Fixed artboard width used by this screen (px). */
const DASHBOARD_FRAME_W = 1512;

/** Collapsed grid: card track width (incl. horizontal padding) + gap between columns. */
const COLLAPSED_CARD_TRACK_PX = 278;
const COLLAPSED_COL_GAP_PX = 22;
const SIDEBAR_OPEN_CARD_TRACK_PX = 261;
const CARDS_PER_PAGE = 4;
const MATCH_ROW_CARD_TOPS = [133, 608] as const;
const MATCH_ROW_DATE_TOPS = [104, 560] as const;

export type DashboardView = "matches" | "profile";

interface Group1Props {
  readonly onLogout?: () => void;
  readonly onMatchSelect?: (matchId: string) => void;
  readonly activeView?: DashboardView;
  readonly onProfileClick?: () => void;
  readonly onDashboardClick?: () => void;
}

interface FrameProps {
  readonly onLogout?: () => void;
  readonly onMatchSelect?: (matchId: string) => void;
  readonly sidebarOpen: boolean;
  readonly onProfileClick?: () => void;
}

interface ProductCardBodyProps {
  readonly outcome: string;
  readonly durationLabel: string;
  readonly mapLabel: string;
}

function ProductCardImage({
  src,
  championName,
}: Readonly<{ src: string; championName: string }>) {
  return (
    <div className="h-[247px] relative shrink-0 w-full" data-name="Image">
      <img
        alt={championName}
        className="absolute inset-0 max-w-none object-cover object-top pointer-events-none size-full"
        src={src}
      />
    </div>
  );
}

function ProductCardBody({
  outcome,
  durationLabel,
  mapLabel,
}: Readonly<ProductCardBodyProps>) {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[208px]"
      data-name="Body"
    >
      <div
        className="content-stretch flex items-start relative shrink-0 w-full"
        data-name="Text"
      >
        <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-w-px not-italic relative text-[#1e1e1e] text-[16px]">
          Match #
        </p>
      </div>
      <div
        className="content-stretch flex items-start relative shrink-0"
        data-name="Text Strong"
      >
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.4] not-italic relative shrink-0 text-[#1e1e1e] text-[16px] whitespace-nowrap">
          {outcome}
        </p>
      </div>
      <div
        className="content-stretch flex items-start relative shrink-0 w-full"
        data-name="Text Small"
      >
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#757575] text-[14px] whitespace-nowrap">
          {durationLabel}
        </p>
      </div>
      <div
        className="content-stretch flex items-start relative shrink-0 w-full"
        data-name="Text Small"
      >
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#757575] text-[14px] whitespace-nowrap">
          {mapLabel}
        </p>
      </div>
    </div>
  );
}

function collapsedCardColumnLefts(): [number, number, number, number] {
  const gridW = 4 * COLLAPSED_CARD_TRACK_PX + 3 * COLLAPSED_COL_GAP_PX;
  const start = Math.round((DASHBOARD_FRAME_W - gridW) / 2);
  return [
    start,
    start + (COLLAPSED_CARD_TRACK_PX + COLLAPSED_COL_GAP_PX),
    start + 2 * (COLLAPSED_CARD_TRACK_PX + COLLAPSED_COL_GAP_PX),
    start + 3 * (COLLAPSED_CARD_TRACK_PX + COLLAPSED_COL_GAP_PX),
  ];
}

function sidebarOpenCardColumnLefts(): [number, number, number, number] {
  return [411, 672, 933, 1194];
}

interface MatchHistoryDayRowSectionProps {
  readonly dayRow: MatchHistoryDayRow;
  readonly rowIndex: number;
  readonly sidebarOpen: boolean;
  readonly cardWidthClass: string;
  readonly onMatchSelect?: (matchId: string) => void;
}

function MatchHistoryDayRowSection({
  dayRow,
  rowIndex,
  sidebarOpen,
  cardWidthClass,
  onMatchSelect,
}: Readonly<MatchHistoryDayRowSectionProps>) {
  const [page, setPage] = useState(0);
  const cardTop = MATCH_ROW_CARD_TOPS[rowIndex] ?? MATCH_ROW_CARD_TOPS[0];
  const dateTop = MATCH_ROW_DATE_TOPS[rowIndex] ?? MATCH_ROW_DATE_TOPS[0];
  const columnLefts = sidebarOpen
    ? sidebarOpenCardColumnLefts()
    : collapsedCardColumnLefts();
  const cardTrackPx = sidebarOpen
    ? SIDEBAR_OPEN_CARD_TRACK_PX
    : COLLAPSED_CARD_TRACK_PX;
  const gridStart = columnLefts[0];
  const gridEnd = columnLefts[3] + cardTrackPx;

  const totalPages = Math.max(
    1,
    Math.ceil(dayRow.matches.length / CARDS_PER_PAGE),
  );
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * CARDS_PER_PAGE;
  const visibleMatches = dayRow.matches.slice(
    pageStart,
    pageStart + CARDS_PER_PAGE,
  );
  const canPageBack = safePage > 0;
  const canPageForward = safePage < totalPages - 1;
  const arrowTop = cardTop + 175;

  return (
    <>
      <p
        className="absolute whitespace-nowrap font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] not-italic text-[#1e1e1e] transition-[left] duration-300 ease-out"
        style={{ left: gridStart, top: dateTop }}
      >
        {dayRow.dateLabel}
      </p>
      <button
        type="button"
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={!canPageBack}
        aria-label={`Previous matches on ${dayRow.dateLabel}`}
        className="absolute flex size-[36px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#525252] transition-[left,opacity] duration-300 ease-out hover:bg-neutral-100 disabled:cursor-default disabled:opacity-30"
        style={{ left: gridStart - 48, top: arrowTop }}
      >
        <ChevronLeft className="size-[28px]" strokeWidth={2} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        disabled={!canPageForward}
        aria-label={`Next matches on ${dayRow.dateLabel}`}
        className="absolute flex size-[36px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[#525252] transition-[left,opacity] duration-300 ease-out hover:bg-neutral-100 disabled:cursor-default disabled:opacity-30"
        style={{ left: gridEnd + 12, top: arrowTop }}
      >
        <ChevronRight className="size-[28px]" strokeWidth={2} aria-hidden />
      </button>
      {visibleMatches.map((card, col) => {
        const column = col as 0 | 1 | 2 | 3;
        return (
          <MatchHistoryCardButton
            key={`dashboard-match-${dayRow.dayKey}-${card.matchId}`}
            card={card}
            left={columnLefts[column]}
            top={cardTop}
            cardWidthClass={cardWidthClass}
            onMatchSelect={onMatchSelect}
          />
        );
      })}
    </>
  );
}

interface MatchHistoryCardButtonProps {
  readonly card: DashboardMatchCard;
  readonly left: number;
  readonly top: number;
  readonly cardWidthClass: string;
  readonly onMatchSelect?: (matchId: string) => void;
}

function MatchHistoryCardButton({
  card,
  left,
  top,
  cardWidthClass,
  onMatchSelect,
}: Readonly<MatchHistoryCardButtonProps>) {
  return (
    <button
      type="button"
      onClick={() => onMatchSelect?.(card.matchId)}
      className={`absolute flex flex-col content-stretch items-start gap-[16px] rounded-[8px] bg-white p-[16px] transition-[left,width] duration-300 ease-out cursor-pointer text-left hover:border-[#b3b3b3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a7fd4] ${cardWidthClass}`}
      style={{ left, top }}
      data-name="Product Info Card"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[8px] border border-solid border-[#d9d9d9]"
      />
      <ProductCardImage
        src={card.imageUrl}
        championName={card.champion_name}
      />
      <ProductCardBody
        outcome={card.outcome}
        durationLabel={card.durationLabel}
        mapLabel={card.mapLabel}
      />
    </button>
  );
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

function ProfileAvatar() {
  return (
    <div className="relative size-[48px] shrink-0">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle cx="24" cy="24" fill="#D9D9D9" r="24" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-['Sora:Regular',sans-serif] text-[14px] font-normal leading-normal tracking-[-0.28px] text-[#0a0a0a]">
        UN
      </span>
    </div>
  );
}

function Frame({
  onLogout,
  onMatchSelect,
  sidebarOpen,
  onProfileClick,
}: Readonly<FrameProps>) {
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
          <button
            type="button"
            onClick={onProfileClick}
            className="absolute left-[46px] top-[345px] flex cursor-pointer flex-col items-start gap-1 rounded-lg border-0 bg-transparent p-0 transition-opacity hover:opacity-80"
            aria-label="Open profile"
          >
            <ProfileAvatar />
            <span className="font-['Sora:Regular',sans-serif] text-[14px] font-normal leading-normal tracking-[-0.28px] text-[#737373]">
              Username
            </span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="absolute left-[232px] top-[427px] flex cursor-pointer items-center gap-2 rounded-md py-0.5 transition-opacity hover:opacity-80"
            data-name="Logout Button"
          >
            <LogOut
              className="size-[18px] shrink-0 text-[#525252]"
              strokeWidth={2}
              aria-hidden
            />
            <span className="whitespace-nowrap font-['Sora:Regular',sans-serif] text-[14px] font-normal leading-normal tracking-[-0.28px] text-[#0a0a0a]">
              Logout
            </span>
          </button>
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
  activeView = "matches",
  onProfileClick,
  onDashboardClick,
}: Readonly<Group1Props>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const showMatches = activeView === "matches";
  const searchLeft = sidebarOpen
    ? 912
    : Math.round((DASHBOARD_FRAME_W - 377) / 2);
  const filterLeft = 1336;
  const sortLeft = 1394;
  const cardWidthClass = sidebarOpen
    ? "min-w-[240px]"
    : "w-[278px] min-w-0 shrink-0";

  const panelVars = {
    "--transform-inner-width": "1200",
    "--transform-inner-height": "19",
  } as CSSProperties;

  return (
    <div className="relative size-full">
      <Frame
        onLogout={onLogout}
        onMatchSelect={onMatchSelect}
        sidebarOpen={sidebarOpen}
        onProfileClick={onProfileClick}
      />
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
      {showMatches ? (
      <>
      <div
        className="absolute top-[29px] min-w-[120px] w-[377px] rounded-[9999px] bg-white transition-[left] duration-300 ease-out"
        style={{ left: searchLeft }}
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
          className="pointer-events-none absolute inset-[-0.5px] rounded-[9999.5px] border border-solid border-[#d9d9d9] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
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
      {MOCK_MATCH_HISTORY_BY_DAY.map((dayRow, rowIndex) => (
        <MatchHistoryDayRowSection
          key={dayRow.dayKey}
          dayRow={dayRow}
          rowIndex={rowIndex}
          sidebarOpen={sidebarOpen}
          cardWidthClass={cardWidthClass}
          onMatchSelect={onMatchSelect}
        />
      ))}
      </>
      ) : null}
    </div>
  );
}
