import { apiFetch } from "./client";
import type { MatchHistorySummary } from "../types/match";

interface MatchHistorySummaryApi {
  readonly match_id: string;
  readonly champion_name: string;
  readonly outcome: "Victory" | "Defeat";
  readonly duration_minutes: number;
  readonly map_label: string;
  readonly played_on: string;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly cs: number;
  readonly position: string;
}

function mapHistoryRow(row: MatchHistorySummaryApi): MatchHistorySummary {
  return {
    matchId: row.match_id,
    champion_name: row.champion_name,
    outcome: row.outcome,
    duration_minutes: row.duration_minutes,
    map_label: row.map_label,
    played_on: row.played_on,
    kills: row.kills,
    deaths: row.deaths,
    assists: row.assists,
    cs: row.cs,
    position: row.position,
  };
}

export async function fetchMatchHistory(): Promise<MatchHistorySummary[]> {
  const rows = await apiFetch<MatchHistorySummaryApi[]>("/api/v1/matches");
  return rows.map(mapHistoryRow);
}
