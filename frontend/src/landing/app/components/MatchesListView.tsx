import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import {
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import { fetchMatchHistory } from "../api/matches";
import {
  groupDashboardMatchesByDay,
  type DashboardMatchListItem,
  type MatchHistoryDayRow,
} from "../lib/matchHistoryGroup";
import {
  applyMatchListControls,
  matchListDaySortAscending,
} from "../lib/matchListQuery";
import {
  DEFAULT_MATCH_FILTER_ID,
  DEFAULT_MATCH_SORT_ID,
  type MatchFilterId,
  type MatchSortId,
} from "../lib/matchListControls";
import type { MatchHistorySummary } from "../types/match";
import MatchesListToolbar from "./MatchesListToolbar";

interface MatchesListViewProps {
  readonly sidebarOpen?: boolean;
}

function outcomeClass(outcome: "Victory" | "Defeat"): string {
  return outcome === "Victory" ? "text-[#1e7e34]" : "text-[#c44a4a]";
}

interface MatchHistoryListRowProps {
  readonly item: DashboardMatchListItem;
  readonly onOpenMatch: (matchId: string) => void;
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
  onOpenMatch,
}: Readonly<MatchHistoryListRowProps>) {
  return (
    <button
      type="button"
      onClick={() => onOpenMatch(item.matchId)}
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
  onOpenMatch,
}: Readonly<{
  dayRow: MatchHistoryDayRow;
  onOpenMatch: (matchId: string) => void;
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
            <MatchHistoryListRow item={item} onOpenMatch={onOpenMatch} />
          </li>
        ))}
        </ul>
      </div>
    </section>
  );
}

export default function MatchesListView(
  props: Readonly<MatchesListViewProps> = {}
) {
  const { sidebarOpen: sidebarOpenProp } = props;
  const navigate = useNavigate();
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const sidebarOpen = sidebarOpenProp ?? outlet?.sidebarOpen ?? true;

  const handleOpenMatch = (matchId: string) => {
    navigate(`/dashboard/matches/${encodeURIComponent(matchId)}`);
  };

  const [allMatches, setAllMatches] = useState<readonly MatchHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState<MatchFilterId>(DEFAULT_MATCH_FILTER_ID);
  const [sortId, setSortId] = useState<MatchSortId>(DEFAULT_MATCH_SORT_ID);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMatchHistory()
      .then((matches) => {
        if (!cancelled) {
          setAllMatches(matches);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load matches");
          setAllMatches([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dayRows = useMemo(
    () =>
      groupDashboardMatchesByDay(
        applyMatchListControls(allMatches, { filterId, sortId, searchQuery }),
        { oldestDaysFirst: matchListDaySortAscending(sortId) }
      ),
    [allMatches, filterId, searchQuery, sortId]
  );

  const hasNoMatches = !loading && !error && allMatches.length === 0;
  const hasNoVisibleMatches =
    !loading && !error && allMatches.length > 0 && dayRows.length === 0;

  const contentStyle = getDashboardContentStyle(sidebarOpen);

  return (
    <div
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="matches-list-view"
    >
      <div className="relative h-full overflow-auto px-10 pt-8 pb-8">
        {!loading && !error ? (
          <MatchesListToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            filterId={filterId}
            onFilterIdChange={setFilterId}
            sortId={sortId}
            onSortIdChange={setSortId}
          />
        ) : null}
        {loading ? (
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#757575]">
            Loading matches…
          </p>
        ) : null}
        {error ? (
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#c44a4a]">
            {error}
          </p>
        ) : null}
        {hasNoMatches ? (
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#757575]">
            No matches yet. Link your Riot ID or sign in with the seeded test account.
          </p>
        ) : null}
        {hasNoVisibleMatches ? (
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#757575]">
            No matches match your search or filters.
          </p>
        ) : null}
        <div className="flex flex-col gap-8">
          {dayRows.map((dayRow) => (
            <MatchHistoryDaySection
              key={dayRow.dayKey}
              dayRow={dayRow}
              onOpenMatch={handleOpenMatch}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
