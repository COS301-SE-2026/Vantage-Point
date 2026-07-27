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
import MatchesListToolbar from "../components/MatchesListToolbar";

interface MatchesListViewProps {
  readonly sidebarOpen?: boolean;
}

function outcomeClass(outcome: "Victory" | "Defeat"): string {
  return outcome === "Victory"
    ? "text-[#1e7e34] device-dark:text-[#18c840]"
    : "text-[#c44a4a] device-dark:text-[#e03b3b]";
}

interface MatchHistoryListRowProps {
  readonly item: DashboardMatchListItem;
  readonly onOpenMatch: (matchId: string) => void;
}

const MATCH_ROW_GRID =
  "grid h-[30px] w-full grid-cols-[56px_minmax(0,1fr)_52px_59px_60px_80px_20px] items-center gap-x-2 px-3";

const STAT_LABEL_CLASS =
  "font-['Beaufort_for_LOL',serif] text-[10px] font-medium uppercase tracking-[0.275px] text-[#757575] device-dark:text-[#929292]";

const STAT_VALUE_CLASS =
  "font-['Beaufort_for_LOL',serif] text-[12px] text-[#1e1e1e] device-dark:text-white tabular-nums";

function matchRowAriaLabel(item: DashboardMatchListItem): string {
  return `View match as ${item.champion_name}, ${item.outcome}, role ${item.roleLabel}, KDA ${item.kdaLabel}, ${item.cs} creep score, ${item.duration_minutes} minutes`;
}

function MatchStatCell({
  children,
  className = "",
  align = "start",
}: Readonly<{
  children: ReactNode;
  className?: string;
  align?: "start" | "end";
}>) {
  const alignment = align === "end" ? "text-right" : "text-left";
  return (
    <div className={`block min-w-0 ${alignment} ${className}`}>{children}</div>
  );
}

function MatchHistoryListHeader() {
  return (
    <div className="grid h-[20px] w-full grid-cols-[56px_minmax(0,1fr)_52px_59px_60px_80px_20px] items-center gap-x-2 border-b border-[#eee] device-dark:border-[#929292] px-3">
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        Result
      </span>
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        Champion
      </span>
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        Role
      </span>
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        KDA
      </span>
      <span role="columnheader" className={STAT_LABEL_CLASS}>
        CS
      </span>
      <span role="columnheader" className={`${STAT_LABEL_CLASS} text-right`}>
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
      className={`${MATCH_ROW_GRID} cursor-pointer rounded-[8px] border border-solid border-[#d9d9d9] bg-white text-left transition-colors hover:border-[#b3b3b3] hover:bg-[#fafafa] device-dark:border-[#181818] device-dark:bg-[#3a3939] device-dark:hover:border-[#5a5959] device-dark:hover:bg-[#454444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a7fd4]`}
    >
      <MatchStatCell>
        <span
          className={`font-['Beaufort_for_LOL',serif] text-[13px] font-bold ${outcomeClass(item.outcome)}`}
        >
          {item.outcome}
        </span>
      </MatchStatCell>
      <MatchStatCell>
        <span className="truncate font-['Beaufort_for_LOL',serif] text-[12px] font-medium text-[#1e1e1e] device-dark:text-white">
          {item.champion_name}
        </span>
      </MatchStatCell>
      <MatchStatCell>
        <span className={`${STAT_VALUE_CLASS} uppercase`}>
          {item.roleLabel}
        </span>
      </MatchStatCell>
      <MatchStatCell>
        <span className="font-['Beaufort_for_LOL',serif] text-[12px] font-bold text-[#1e1e1e] device-dark:text-white tabular-nums">
          {item.kdaLabel}
        </span>
      </MatchStatCell>
      <MatchStatCell>
        <span className={STAT_VALUE_CLASS}>{item.cs}</span>
      </MatchStatCell>
      <MatchStatCell align="end">
        <span className={STAT_VALUE_CLASS}>{item.durationLabel}</span>
      </MatchStatCell>
      <ChevronRight
        className="size-4 shrink-0 justify-self-end text-[#757575] device-dark:text-white"
        strokeWidth={1.8}
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
    <section
      className="flex flex-col gap-1.5"
      aria-label={`Matches on ${dayRow.dateLabel}`}
    >
      <h2 className="font-['Beaufort_for_LOL',serif] text-[14px] font-medium leading-[22.4px] text-[#1e1e1e] device-dark:text-white">
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
  props: Readonly<MatchesListViewProps> = {},
) {
  const { sidebarOpen: sidebarOpenProp } = props;
  const navigate = useNavigate();
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const sidebarOpen = sidebarOpenProp ?? outlet?.sidebarOpen ?? true;

  const handleOpenMatch = (matchId: string) => {
    navigate(`/dashboard/matches/${encodeURIComponent(matchId)}`);
  };

  const [allMatches, setAllMatches] = useState<readonly MatchHistorySummary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState<MatchFilterId>(
    DEFAULT_MATCH_FILTER_ID,
  );
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
          setError(
            err instanceof Error ? err.message : "Failed to load matches",
          );
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
        { oldestDaysFirst: matchListDaySortAscending(sortId) },
      ),
    [allMatches, filterId, searchQuery, sortId],
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
      <div className="vp-scrollbar relative h-full overflow-auto px-0 pb-5 pt-3">
        {!loading && !error ? (
          <div className="mx-auto w-full max-w-[var(--vp-content-max)]">
            <MatchesListToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              filterId={filterId}
              onFilterIdChange={setFilterId}
              sortId={sortId}
              onSortIdChange={setSortId}
            />
          </div>
        ) : null}
        {loading ? (
          <p className="mx-auto w-full max-w-[var(--vp-content-max)] font-['Inter:Regular',sans-serif] text-[16px] text-[#757575] device-dark:text-[#929292]">
            Loading matches…
          </p>
        ) : null}
        {error ? (
          <p className="mx-auto w-full max-w-[var(--vp-content-max)] font-['Inter:Regular',sans-serif] text-[16px] text-[#c44a4a] device-dark:text-[#e03b3b]">
            {error}
          </p>
        ) : null}
        {hasNoMatches ? (
          <p className="mx-auto w-full max-w-[var(--vp-content-max)] font-['Inter:Regular',sans-serif] text-[16px] text-[#757575] device-dark:text-[#929292]">
            No matches yet. Link your Riot ID or sign in with the seeded test
            account.
          </p>
        ) : null}
        {hasNoVisibleMatches ? (
          <p className="mx-auto w-full max-w-[var(--vp-content-max)] font-['Inter:Regular',sans-serif] text-[16px] text-[#757575] device-dark:text-[#929292]">
            No matches match your search or filters.
          </p>
        ) : null}
        <div className="mx-auto flex w-full max-w-[var(--vp-content-max)] flex-col gap-4">
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
