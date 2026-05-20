import type { MatchHistorySummary } from "../types/match";

/** Summary row for dashboard match history cards (viewer's champion per game). */
export type MatchHistoryCard = MatchHistorySummary;

const MOCK_MATCH_HISTORY: readonly MatchHistoryCard[] = [
  {
    matchId: "EUW1_mock_1",
    champion_name: "Jinx",
    outcome: "Defeat",
    duration_minutes: 25,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
    kills: 4,
    deaths: 8,
    assists: 6,
    cs: 165,
    position: "BOTTOM",
  },
  {
    matchId: "EUW1_mock_2",
    champion_name: "Ahri",
    outcome: "Victory",
    duration_minutes: 30,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
    kills: 8,
    deaths: 3,
    assists: 6,
    cs: 210,
    position: "MIDDLE",
  },
  {
    matchId: "EUW1_mock_3",
    champion_name: "Garen",
    outcome: "Victory",
    duration_minutes: 40,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
    kills: 5,
    deaths: 2,
    assists: 4,
    cs: 198,
    position: "TOP",
  },
  {
    matchId: "EUW1_mock_4",
    champion_name: "LeeSin",
    outcome: "Defeat",
    duration_minutes: 20,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
    kills: 4,
    deaths: 5,
    assists: 12,
    cs: 142,
    position: "JUNGLE",
  },
  {
    matchId: "EUW1_mock_5",
    champion_name: "Caitlyn",
    outcome: "Victory",
    duration_minutes: 28,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
    kills: 11,
    deaths: 2,
    assists: 5,
    cs: 224,
    position: "BOTTOM",
  },
  {
    matchId: "EUW1_mock_6",
    champion_name: "Darius",
    outcome: "Defeat",
    duration_minutes: 22,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
    kills: 3,
    deaths: 7,
    assists: 2,
    cs: 156,
    position: "TOP",
  },
  {
    matchId: "EUW1_mock_7",
    champion_name: "Syndra",
    outcome: "Victory",
    duration_minutes: 35,
    map_label: "Summoner's Rift",
    played_on: "2025-04-18",
    kills: 9,
    deaths: 4,
    assists: 7,
    cs: 205,
    position: "MIDDLE",
  },
  {
    matchId: "EUW1_mock_8",
    champion_name: "Thresh",
    outcome: "Defeat",
    duration_minutes: 18,
    map_label: "Summoner's Rift",
    played_on: "2025-04-18",
    kills: 1,
    deaths: 6,
    assists: 14,
    cs: 28,
    position: "UTILITY",
  },
];

export interface DashboardMatchListItem extends MatchHistoryCard {
  readonly durationLabel: string;
  readonly kdaLabel: string;
  readonly csLabel: string;
  readonly roleLabel: string;
}

/** @deprecated Use DashboardMatchListItem */
export type DashboardMatchCard = DashboardMatchListItem;

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

function toDashboardListItem(match: MatchHistoryCard): DashboardMatchListItem {
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

function groupMatchesByDay(
  matches: readonly MatchHistoryCard[],
): MatchHistoryDayRow[] {
  const byDay = new Map<string, DashboardMatchListItem[]>();

  for (const match of matches) {
    const cards = byDay.get(match.played_on) ?? [];
    cards.push(toDashboardListItem(match));
    byDay.set(match.played_on, cards);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dayKey, dayMatches]) => ({
      dayKey,
      dateLabel: formatDayLabel(dayKey),
      matches: dayMatches,
    }));
}

export const MOCK_MATCH_HISTORY_BY_DAY: readonly MatchHistoryDayRow[] =
  groupMatchesByDay(MOCK_MATCH_HISTORY);
