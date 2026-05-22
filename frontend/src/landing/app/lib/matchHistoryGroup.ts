import type { MatchHistorySummary } from "../types/match";

export interface DashboardMatchListItem extends MatchHistorySummary {
  readonly durationLabel: string;
  readonly kdaLabel: string;
  readonly csLabel: string;
  readonly roleLabel: string;
}

export interface MatchHistoryDayRow {
  readonly dayKey: string;
  readonly dateLabel: string;
  readonly matches: readonly DashboardMatchListItem[];
}

const ROLE_LABELS: Record<string, string> = {
  TOP: "TOP",
  JUNGLE: "JGL",
  MIDDLE: "MID",
  BOTTOM: "BOT",
  UTILITY: "SUP",
};

function formatRoleLabel(position: string): string {
  return ROLE_LABELS[position] ?? position.slice(0, 3).toUpperCase();
}

export function toDashboardListItem(match: MatchHistorySummary): DashboardMatchListItem {
  return {
    ...match,
    durationLabel: `${match.duration_minutes} min`,
    kdaLabel: `${match.kills}/${match.deaths}/${match.assists}`,
    csLabel: `${match.cs} CS`,
    roleLabel: formatRoleLabel(match.position),
  };
}

function formatDayLabel(playedOn: string): string {
  const [year, month, day] = playedOn.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

export function groupDashboardMatchesByDay(
  matches: readonly DashboardMatchListItem[],
  options?: { readonly oldestDaysFirst?: boolean }
): MatchHistoryDayRow[] {
  const byDay = new Map<string, DashboardMatchListItem[]>();

  for (const match of matches) {
    const cards = byDay.get(match.played_on) ?? [];
    cards.push(match);
    byDay.set(match.played_on, cards);
  }

  const daySort = options?.oldestDaysFirst
    ? (a: string, b: string) => a.localeCompare(b)
    : (a: string, b: string) => b.localeCompare(a);

  return [...byDay.entries()]
    .sort(([a], [b]) => daySort(a, b))
    .map(([dayKey, dayMatches]) => ({
      dayKey,
      dateLabel: formatDayLabel(dayKey),
      matches: dayMatches,
    }));
}

export function groupMatchesByDay(
  matches: readonly MatchHistorySummary[]
): MatchHistoryDayRow[] {
  return groupDashboardMatchesByDay(matches.map(toDashboardListItem));
}
