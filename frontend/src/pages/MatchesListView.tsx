import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { fetchMatchHistory, syncMatchHistory } from "../api/matches";
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
import {
  Button,
  ChampionIcon,
  EmptyState,
  ErrorNote,
  PageContainer,
  StatTile,
} from "../components/dashboard/primitives";

/**
 * The row grid. Every column is a fixed track except the champion, so the
 * numbers stay in the same place from row to row and can be read down a column
 * rather than hunted for.
 */
const MATCH_ROW_GRID =
  "grid w-full grid-cols-[3px_28px_minmax(0,1fr)_46px_78px_56px_66px_16px] items-center gap-x-3 pl-0 pr-3";

const COL_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.16em] text-vp-faint";

function matchRowAriaLabel(item: DashboardMatchListItem): string {
  return `View match as ${item.champion_name}, ${item.outcome}, role ${item.roleLabel}, KDA ${item.kdaLabel}, ${item.cs} creep score, ${item.duration_minutes} minutes`;
}

/**
 * Column captions only. Each row below is a button whose aria-label already
 * names every value (see matchRowAriaLabel), so repeating the captions to
 * assistive tech would just double up the announcement.
 */
function MatchHistoryListHeader() {
  return (
    <div
      className={`${MATCH_ROW_GRID} h-7 border-b border-vp-line`}
      aria-hidden
    >
      <span />
      <span />
      <span className={COL_LABEL}>Champion</span>
      <span className={COL_LABEL}>Role</span>
      <span className={COL_LABEL}>KDA</span>
      <span className={`${COL_LABEL} text-right`}>CS</span>
      <span className={`${COL_LABEL} text-right`}>Duration</span>
      <span />
    </div>
  );
}

function MatchHistoryListRow({
  item,
  onOpenMatch,
}: Readonly<{
  item: DashboardMatchListItem;
  onOpenMatch: (matchId: string) => void;
}>) {
  const won = item.outcome === "Victory";

  return (
    <button
      type="button"
      onClick={() => onOpenMatch(item.matchId)}
      aria-label={matchRowAriaLabel(item)}
      className={`${MATCH_ROW_GRID} group h-12 cursor-pointer overflow-hidden rounded-lg border border-vp-line bg-vp-surface text-left transition-colors hover:border-vp-line-strong hover:bg-vp-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vp-gold`}
    >
      {/* Result is a rule down the row's leading edge. It reads at a glance
          scanning the column, and leaves the word "Victory" out of the grid. */}
      <span
        aria-hidden
        className={`h-full w-[3px] ${won ? "bg-vp-win" : "bg-vp-loss"}`}
      />
      <ChampionIcon name={item.champion_name} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-medium text-vp-ink">
          {item.champion_name}
        </span>
        <span
          className={`text-[11px] leading-tight ${won ? "text-vp-win" : "text-vp-loss"}`}
        >
          {item.outcome}
        </span>
      </span>
      <span className="text-[11px] uppercase tracking-[0.08em] text-vp-dim">
        {item.roleLabel}
      </span>
      <span className="text-[13px] font-medium tabular-nums text-vp-ink">
        {item.kdaLabel}
      </span>
      <span className="text-right text-[13px] tabular-nums text-vp-dim">
        {item.cs}
      </span>
      <span className="text-right text-[13px] tabular-nums text-vp-dim">
        {item.durationLabel}
      </span>
      <ChevronRight
        className="size-4 shrink-0 justify-self-end text-vp-faint transition-colors group-hover:text-vp-gold"
        strokeWidth={1.8}
        aria-hidden
      />
    </button>
  );
}

/** Pulls the linked Riot account's latest games into the backend, then reloads. */
function SyncMatchesButton({
  syncing,
  onSync,
  label,
  variant = "ghost",
}: Readonly<{
  syncing: boolean;
  onSync: () => void;
  label: string;
  variant?: "primary" | "ghost";
}>) {
  return (
    <Button onClick={onSync} disabled={syncing} variant={variant}>
      <RefreshCw
        className={`size-4 shrink-0 ${syncing ? "animate-spin" : ""}`}
        strokeWidth={1.8}
        aria-hidden
      />
      {syncing ? "Syncing…" : label}
    </Button>
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
      className="flex flex-col gap-2"
      aria-label={`Matches on ${dayRow.dateLabel}`}
    >
      <div className="flex items-baseline gap-3">
        <h2 className="text-[13px] font-medium text-vp-ink">
          {dayRow.dateLabel}
        </h2>
        <span className="text-[11px] tabular-nums text-vp-faint">
          {dayRow.matches.length} match
          {dayRow.matches.length === 1 ? "" : "es"}
        </span>
      </div>
      <MatchHistoryListHeader />
      <ul className="flex flex-col gap-1.5">
        {dayRow.matches.map((item) => (
          <li key={item.matchId}>
            <MatchHistoryListRow item={item} onOpenMatch={onOpenMatch} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Skeleton rows, so the first paint has the shape of the list to come. */
function LoadingRows() {
  return (
    <div className="flex flex-col gap-1.5">
      {/* The skeleton is decoration; this is what the load actually announces. */}
      <p role="status" className="sr-only">
        Loading matches…
      </p>
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="h-12 animate-pulse rounded-lg border border-vp-line bg-vp-surface"
          style={{ animationDelay: `${String(row * 90)}ms` }}
        />
      ))}
    </div>
  );
}

/** The headline numbers for whatever is currently in the list. */
function summarise(matches: readonly MatchHistorySummary[]) {
  if (matches.length === 0) return null;
  const wins = matches.filter((m) => m.outcome === "Victory").length;
  const kills = matches.reduce((sum, m) => sum + m.kills, 0);
  const deaths = matches.reduce((sum, m) => sum + m.deaths, 0);
  const assists = matches.reduce((sum, m) => sum + m.assists, 0);
  const minutes = matches.reduce((sum, m) => sum + m.duration_minutes, 0);
  const cs = matches.reduce((sum, m) => sum + m.cs, 0);

  return {
    played: matches.length,
    wins,
    losses: matches.length - wins,
    winRate: Math.round((wins / matches.length) * 100),
    kda: deaths === 0 ? "Perfect" : ((kills + assists) / deaths).toFixed(2),
    csPerMin: minutes === 0 ? "0.0" : (cs / minutes).toFixed(1),
  };
}

export default function MatchesListView() {
  const navigate = useNavigate();

  const handleOpenMatch = (matchId: string) => {
    navigate(`/dashboard/matches/${encodeURIComponent(matchId)}`);
  };

  const [allMatches, setAllMatches] = useState<readonly MatchHistorySummary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
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

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);
    setError(null);
    try {
      const result = await syncMatchHistory();
      setAllMatches(await fetchMatchHistory());
      if (result.imported > 0) {
        setSyncMessage(`Imported ${result.imported} new match(es) from Riot.`);
      } else if (result.total > 0) {
        setSyncMessage("Already up to date with Riot.");
      } else {
        setSyncMessage("Riot returned no recent matches for this account.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not sync with Riot");
    } finally {
      setSyncing(false);
    }
  }, []);

  const visibleMatches = useMemo(
    () => applyMatchListControls(allMatches, { filterId, sortId, searchQuery }),
    [allMatches, filterId, searchQuery, sortId],
  );

  const dayRows = useMemo(
    () =>
      groupDashboardMatchesByDay(visibleMatches, {
        oldestDaysFirst: matchListDaySortAscending(sortId),
      }),
    [visibleMatches, sortId],
  );

  const stats = useMemo(() => summarise(visibleMatches), [visibleMatches]);

  const hasNoMatches = !loading && !error && allMatches.length === 0;
  const hasNoVisibleMatches =
    !loading && !error && allMatches.length > 0 && dayRows.length === 0;

  return (
    <PageContainer className="max-w-[1180px]">
      {stats ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Matches"
            value={stats.played}
            sub={`${String(stats.wins)}W · ${String(stats.losses)}L`}
          />
          <StatTile
            label="Win rate"
            value={`${String(stats.winRate)}%`}
            tone={stats.winRate >= 50 ? "win" : "loss"}
          />
          <StatTile label="KDA" value={stats.kda} tone="gold" />
          <StatTile label="CS / min" value={stats.csPerMin} />
        </div>
      ) : null}

      {!loading ? (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <SyncMatchesButton
            syncing={syncing}
            onSync={() => void handleSync()}
            label="Sync with Riot"
          />
          <div className="min-w-0 flex-1">
            <MatchesListToolbar
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              filterId={filterId}
              onFilterIdChange={setFilterId}
              sortId={sortId}
              onSortIdChange={setSortId}
            />
          </div>
        </div>
      ) : null}

      {error ? <ErrorNote className="mb-4">{error}</ErrorNote> : null}

      {syncMessage ? (
        <p className="mb-4 rounded-lg border border-vp-line bg-vp-surface px-4 py-2.5 text-[13px] text-vp-dim">
          {syncMessage}
        </p>
      ) : null}

      {loading ? <LoadingRows /> : null}

      {hasNoMatches ? (
        <EmptyState
          title="No matches stored yet"
          body="Pull your recent games from Riot to fill the dashboard. Everything after that happens automatically."
          action={
            <SyncMatchesButton
              syncing={syncing}
              onSync={() => void handleSync()}
              label="Import my matches"
              variant="primary"
            />
          }
        />
      ) : null}

      {hasNoVisibleMatches ? (
        <EmptyState
          title="No matches match your search or filters."
          body="Clear the search box or switch the filter back to all matches."
        />
      ) : null}

      <div className="flex flex-col gap-7">
        {dayRows.map((dayRow) => (
          <MatchHistoryDaySection
            key={dayRow.dayKey}
            dayRow={dayRow}
            onOpenMatch={handleOpenMatch}
          />
        ))}
      </div>
    </PageContainer>
  );
}
