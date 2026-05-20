import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  DASHBOARD_CONTENT_LEFT_OPEN,
  DASHBOARD_CONTENT_WIDTH_OPEN,
  DASHBOARD_FRAME_W,
} from "../../imports/Group14/Group14";
import {
  MOCK_MATCH_HISTORY_BY_DAY,
  type DashboardMatchListItem,
  type MatchHistoryDayRow,
} from "../mocks/matchHistory";

interface MatchesListViewProps {
  readonly sidebarOpen?: boolean;
  readonly onMatchSelect?: (matchId: string) => void;
}

function outcomeClass(outcome: "Victory" | "Defeat"): string {
  return outcome === "Victory" ? "text-[#1e7e34]" : "text-[#c44a4a]";
}

interface MatchHistoryListRowProps {
  readonly item: DashboardMatchListItem;
  readonly onMatchSelect?: (matchId: string) => void;
}

const MATCH_ROW_GRID =
  "grid w-full grid-cols-[88px_minmax(0,1fr)_72px_80px_20px] items-center gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[88px_minmax(0,1fr)_52px_72px_72px_80px_20px]";

const STAT_LABEL_CLASS =
  "font-['Inter:Regular',sans-serif] text-[11px] font-medium uppercase tracking-wide text-[#757575]";

const STAT_VALUE_CLASS =
  "font-['Inter:Regular',sans-serif] text-[14px] text-[#1e1e1e] tabular-nums";

function matchRowAriaLabel(item: DashboardMatchListItem): string {
  return `View match as ${item.champion_name}, ${item.outcome}, role ${item.roleLabel}, KDA ${item.kdaLabel}, ${item.cs} creep score, ${item.duration_minutes} minutes`;
}

function MatchStatCell({
  children,
  className = "",
  hideOnMobile = false,
  align = "start",
}: Readonly<{
  children: ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  align?: "start" | "end";
}>) {
  const visibility = hideOnMobile ? "hidden sm:block" : "block";
  const alignment = align === "end" ? "text-right" : "text-left";
  return (
    <div className={`${visibility} min-w-0 ${alignment} ${className}`}>
      {children}
    </div>
  );
}

function MatchHistoryListHeader() {
  return (
    <div className={`${MATCH_ROW_GRID} border-b border-[#eee] py-2`} role="row">
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        Result
      </span>
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        Champion
      </span>
      <span
        role="columnheader"
        className={`${STAT_LABEL_CLASS} hidden sm:inline`}
      >
        Role
      </span>
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        KDA
      </span>
      <span
        role="columnheader"
        className={`${STAT_LABEL_CLASS} hidden sm:inline`}
      >
        CS
      </span>
      <span
        role="columnheader"
        className={`${STAT_LABEL_CLASS} text-right`}
      >
        Duration
      </span>
      <span role="columnheader" aria-hidden />
    </div>
  );
}

function MatchHistoryListRow({
  item,
  onMatchSelect,
}: Readonly<MatchHistoryListRowProps>) {
  return (
    <button
      type="button"
      onClick={() => onMatchSelect?.(item.matchId)}
      aria-label={matchRowAriaLabel(item)}
      className={`${MATCH_ROW_GRID} cursor-pointer rounded-[8px] border border-solid border-[#d9d9d9] bg-white text-left transition-colors hover:border-[#b3b3b3] hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a7fd4]`}
    >
      <MatchStatCell>
        <span
          className={`font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold ${outcomeClass(item.outcome)}`}
        >
          {item.outcome}
        </span>
      </MatchStatCell>
      <MatchStatCell>
        <span className="truncate font-['Inter:Regular',sans-serif] text-[16px] text-[#1e1e1e]">
          {item.champion_name}
        </span>
      </MatchStatCell>
      <MatchStatCell hideOnMobile>
        <span className={`${STAT_VALUE_CLASS} font-medium uppercase`}>
          {item.roleLabel}
        </span>
      </MatchStatCell>
      <MatchStatCell>
        <span className="font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold text-[#1e1e1e] tabular-nums">
          {item.kdaLabel}
        </span>
      </MatchStatCell>
      <MatchStatCell hideOnMobile>
        <span className={STAT_VALUE_CLASS}>{item.cs}</span>
      </MatchStatCell>
      <MatchStatCell align="end">
        <span className={STAT_VALUE_CLASS}>{item.durationLabel}</span>
      </MatchStatCell>
      <ChevronRight
        className="size-5 shrink-0 justify-self-end text-[#757575]"
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}

function MatchHistoryDaySection({
  dayRow,
  onMatchSelect,
}: Readonly<{
  dayRow: MatchHistoryDayRow;
  onMatchSelect?: (matchId: string) => void;
}>) {
  return (
    <section className="flex flex-col gap-3" aria-label={`Matches on ${dayRow.dateLabel}`}>
      <h2 className="font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] text-[#1e1e1e]">
        {dayRow.dateLabel}
      </h2>
      <div role="table" className="flex flex-col gap-2">
        <MatchHistoryListHeader />
        <ul className="flex flex-col gap-2" role="rowgroup">
        {dayRow.matches.map((item) => (
          <li key={item.matchId}>
            <MatchHistoryListRow item={item} onMatchSelect={onMatchSelect} />
          </li>
        ))}
        </ul>
      </div>
    </section>
  );
}

export default function MatchesListView({
  sidebarOpen = true,
  onMatchSelect,
}: Readonly<MatchesListViewProps>) {
  const contentLeft = sidebarOpen ? DASHBOARD_CONTENT_LEFT_OPEN : 0;
  const contentWidth = sidebarOpen ? DASHBOARD_CONTENT_WIDTH_OPEN : DASHBOARD_FRAME_W;

  return (
    <div
      className="absolute top-[94px] transition-[left,width] duration-300 ease-out"
      style={{ left: contentLeft, width: contentWidth, height: 840 }}
      data-name="matches-list-view"
    >
      <div className="relative h-full overflow-auto px-10 pt-16 pb-8">
        <div className="flex flex-col gap-8">
          {MOCK_MATCH_HISTORY_BY_DAY.map((dayRow) => (
            <MatchHistoryDaySection
              key={dayRow.dayKey}
              dayRow={dayRow}
              onMatchSelect={onMatchSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
