import type { MatchHistorySummary } from "../types/match";
import type { DashboardMatchListItem } from "./matchHistoryGroup";
import { toDashboardListItem } from "./matchHistoryGroup";
import type { MatchFilterId, MatchSortId } from "./matchListControls";

const FILTER_POSITION: Record<
  "top" | "jungle" | "mid" | "bot" | "support",
  string
> = {
  top: "TOP",
  jungle: "JUNGLE",
  mid: "MIDDLE",
  bot: "BOTTOM",
  support: "UTILITY",
};

export interface MatchListQueryOptions {
  readonly filterId: MatchFilterId;
  readonly sortId: MatchSortId;
  readonly searchQuery: string;
}

function kdaRatio(match: MatchHistorySummary): number {
  return (match.kills + match.assists) / Math.max(match.deaths, 1);
}

function compareNewest(
  a: MatchHistorySummary,
  b: MatchHistorySummary
): number {
  const dayCompare = b.played_on.localeCompare(a.played_on);
  if (dayCompare !== 0) {
    return dayCompare;
  }
  return b.matchId.localeCompare(a.matchId);
}

function compareOldest(
  a: MatchHistorySummary,
  b: MatchHistorySummary
): number {
  return -compareNewest(a, b);
}

function sortComparator(sortId: MatchSortId) {
  switch (sortId) {
    case "oldest":
      return compareOldest;
    case "duration":
      return (a, b) => b.duration_minutes - a.duration_minutes;
    case "kda":
      return (a, b) => kdaRatio(b) - kdaRatio(a);
    case "cs":
      return (a, b) => b.cs - a.cs;
    case "newest":
    default:
      return compareNewest;
  }
}

export function filterMatches(
  matches: readonly MatchHistorySummary[],
  filterId: MatchFilterId
): MatchHistorySummary[] {
  if (filterId === "all") {
    return [...matches];
  }
  if (filterId === "victory") {
    return matches.filter((match) => match.outcome === "Victory");
  }
  if (filterId === "defeat") {
    return matches.filter((match) => match.outcome === "Defeat");
  }
  const position = FILTER_POSITION[filterId];
  return matches.filter((match) => match.position === position);
}

export function sortMatches(
  matches: readonly MatchHistorySummary[],
  sortId: MatchSortId
): MatchHistorySummary[] {
  return [...matches].sort(sortComparator(sortId));
}

export function searchMatches(
  items: readonly DashboardMatchListItem[],
  searchQuery: string
): DashboardMatchListItem[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return [...items];
  }
  return items.filter((item) => {
    const haystack = [
      item.champion_name,
      item.roleLabel,
      item.outcome,
      item.kdaLabel,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function applyMatchListControls(
  matches: readonly MatchHistorySummary[],
  options: MatchListQueryOptions
): DashboardMatchListItem[] {
  const filtered = filterMatches(matches, options.filterId);
  const sorted = sortMatches(filtered, options.sortId);
  const dashboardItems = sorted.map(toDashboardListItem);
  return searchMatches(dashboardItems, options.searchQuery);
}

export function matchListDaySortAscending(sortId: MatchSortId): boolean {
  return sortId === "oldest";
}
