import { apiFetch } from "./client";
import type { SuggestedPath } from "../types/suggestedPath";

/**
 * The route the coaching model recommends for one player in one match.
 *
 * Served by `/api/v1/matches/{match_id}/suggested-path`, which runs the match through
 * the KNN route model and keys each predicted position to the timeline frame it belongs
 * to. A match too short for the model to read a stride from answers 404 rather than an
 * empty path, so callers can say so rather than drawing a line with nothing in it.
 */
export function suggestedPathUrl(matchId: string, puuid: string): string {
  return `/api/v1/matches/${encodeURIComponent(matchId)}/suggested-path?puuid=${encodeURIComponent(puuid)}`;
}

export async function fetchSuggestedPath(
  matchId: string,
  puuid: string,
): Promise<SuggestedPath> {
  return apiFetch<SuggestedPath>(suggestedPathUrl(matchId, puuid));
}
