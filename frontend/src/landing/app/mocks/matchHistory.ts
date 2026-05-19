import { championSplashUrl } from "../lib/ddragon";

/** Summary row for dashboard match history cards (viewer's champion per game). */
export interface MatchHistoryCard {
  readonly matchId: string;
  readonly champion_name: string;
  readonly outcome: "Victory" | "Defeat";
  readonly duration_minutes: number;
  readonly map_label: string;
  /** Calendar day for grouping rows (YYYY-MM-DD). */
  readonly played_on: string;
}

const MOCK_MATCH_HISTORY: readonly MatchHistoryCard[] = [
  {
    matchId: "EUW1_mock_1",
    champion_name: "Jinx",
    outcome: "Defeat",
    duration_minutes: 25,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
  },
  {
    matchId: "EUW1_mock_2",
    champion_name: "Ahri",
    outcome: "Victory",
    duration_minutes: 30,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
  },
  {
    matchId: "EUW1_mock_3",
    champion_name: "Garen",
    outcome: "Victory",
    duration_minutes: 40,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
  },
  {
    matchId: "EUW1_mock_4",
    champion_name: "LeeSin",
    outcome: "Defeat",
    duration_minutes: 20,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
  },
  {
    matchId: "EUW1_mock_5",
    champion_name: "Caitlyn",
    outcome: "Victory",
    duration_minutes: 28,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
  },
  {
    matchId: "EUW1_mock_6",
    champion_name: "Darius",
    outcome: "Defeat",
    duration_minutes: 22,
    map_label: "Summoner's Rift",
    played_on: "2025-04-19",
  },
  {
    matchId: "EUW1_mock_7",
    champion_name: "Syndra",
    outcome: "Victory",
    duration_minutes: 35,
    map_label: "Summoner's Rift",
    played_on: "2025-04-18",
  },
  {
    matchId: "EUW1_mock_8",
    champion_name: "Thresh",
    outcome: "Defeat",
    duration_minutes: 18,
    map_label: "Summoner's Rift",
    played_on: "2025-04-18",
  },
];

export interface DashboardMatchCard extends MatchHistoryCard {
  readonly imageUrl: string;
  readonly durationLabel: string;
  readonly mapLabel: string;
}

export interface MatchHistoryDayRow {
  readonly dayKey: string;
  readonly dateLabel: string;
  readonly matches: readonly DashboardMatchCard[];
}

function toDashboardCard(match: MatchHistoryCard): DashboardMatchCard {
  return {
    ...match,
    imageUrl: championSplashUrl(match.champion_name),
    durationLabel: `Duration - ${match.duration_minutes}min`,
    mapLabel: match.map_label,
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
  const byDay = new Map<string, DashboardMatchCard[]>();

  for (const match of matches) {
    const cards = byDay.get(match.played_on) ?? [];
    cards.push(toDashboardCard(match));
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
