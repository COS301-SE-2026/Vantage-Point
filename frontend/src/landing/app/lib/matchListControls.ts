export type MatchFilterId =
  | "all"
  | "victory"
  | "defeat"
  | "top"
  | "jungle"
  | "mid"
  | "bot"
  | "support";

export type MatchSortId = "newest" | "oldest" | "duration" | "kda" | "cs";

export interface MatchListControlOption<T extends string> {
  readonly id: T;
  readonly label: string;
}

export const DEFAULT_MATCH_FILTER_ID: MatchFilterId = "all";
export const DEFAULT_MATCH_SORT_ID: MatchSortId = "newest";

export const MATCH_FILTER_OPTIONS: readonly MatchListControlOption<MatchFilterId>[] =
  [
    { id: "all", label: "All matches" },
    { id: "victory", label: "Wins only" },
    { id: "defeat", label: "Losses only" },
    { id: "top", label: "Top" },
    { id: "jungle", label: "Jungle" },
    { id: "mid", label: "Mid" },
    { id: "bot", label: "Bot" },
    { id: "support", label: "Support" },
  ];

export const MATCH_SORT_OPTIONS: readonly MatchListControlOption<MatchSortId>[] =
  [
    { id: "newest", label: "Newest first" },
    { id: "oldest", label: "Oldest first" },
    { id: "duration", label: "Duration" },
    { id: "kda", label: "KDA" },
    { id: "cs", label: "CS" },
  ];

export function matchFilterLabel(filterId: MatchFilterId): string {
  return (
    MATCH_FILTER_OPTIONS.find((option) => option.id === filterId)?.label ??
    "All matches"
  );
}

export function matchSortLabel(sortId: MatchSortId): string {
  return (
    MATCH_SORT_OPTIONS.find((option) => option.id === sortId)?.label ??
    "Newest first"
  );
}
