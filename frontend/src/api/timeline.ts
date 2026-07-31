import { apiFetch } from "./client";
import type { MatchTimeline } from "../types/timeline";

/**
 * Positions and events over the course of a match.
 *
 * The backend fetches this from Riot the first time it is asked for and caches it, so
 * the first call for a given match is slower than the rest. It 404s when Riot has no
 * timeline for the match — callers should treat that as "no replay data" rather than
 * as an error worth showing.
 */
export async function fetchMatchTimeline(
  matchId: string,
): Promise<MatchTimeline> {
  return apiFetch<MatchTimeline>(
    `/api/v1/matches/${encodeURIComponent(matchId)}/timeline`,
  );
}
