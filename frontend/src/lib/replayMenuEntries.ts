import type {
  MatchDetail,
  MatchHistorySummary,
  ParticipantDetail,
} from "../types/match";

/**
 * The scoreline a replay summary row draws, whichever source it came from: the
 * loaded match detail for the game on the map, or the history row for the games
 * that are only listed beside it.
 */
export interface ReplayMenuEntry {
  readonly matchId: string;
  readonly win: boolean;
  readonly championName: string;
  readonly position: string;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly cs: number;
  readonly durationMinutes: number;
}

export function menuEntryFromDetail(
  match: MatchDetail,
  viewer: ParticipantDetail,
): ReplayMenuEntry {
  return {
    matchId: match.match_id,
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

export function menuEntryFromSummary(
  summary: MatchHistorySummary,
): ReplayMenuEntry {
  return {
    matchId: summary.matchId,
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
