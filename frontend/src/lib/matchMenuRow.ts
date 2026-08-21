import type {
  MatchDetail,
  MatchHistorySummary,
  ParticipantDetail,
} from "../types/match";

/** The six cells the match summary row draws, whichever shape they came from. */
export interface MatchMenuRowData {
  readonly win: boolean;
  readonly championName: string;
  readonly position: string;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly cs: number;
  readonly durationMinutes: number;
}

/** Row for a fully loaded match, from the signed-in player's point of view. */
export function menuRowFromDetail(
  match: MatchDetail,
  viewer: ParticipantDetail,
): MatchMenuRowData {
  return {
    win: viewer.win,
    championName: viewer.champion_name,
    position: viewer.position,
    kills: viewer.kills,
    deaths: viewer.deaths,
    assists: viewer.assists,
    cs: viewer.cs,
    durationMinutes: Math.max(1, Math.round(match.game_duration / 60)),
  };
}

/**
 * Row for a match history entry, which is already the viewer's own line, so the
 * replay list can draw all five games without fetching five match details.
 */
export function menuRowFromSummary(
  summary: MatchHistorySummary,
): MatchMenuRowData {
  return {
    win: summary.outcome === "Victory",
    championName: summary.champion_name,
    position: summary.position,
    kills: summary.kills,
    deaths: summary.deaths,
    assists: summary.assists,
    cs: summary.cs,
    durationMinutes: summary.duration_minutes,
  };
}
