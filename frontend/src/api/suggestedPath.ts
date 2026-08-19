import { apiFetch } from "./client";
import type { SuggestedPath } from "../types/suggestedPath";

/**
 * The AI's recommended route for one player in one match.
 *
 * NOT LIVE YET. The backend has the model (`pred_engine/ai_caller.get_knn_output`) and
 * the feature payload that feeds it (`/analytics/map_suggest_data/{match_id}`), but no
 * route joins the two. Until one exists, `SUGGESTED_PATH_ENDPOINT_LIVE` stays false and
 * callers fall back to locally derived preview data — see `lib/useSuggestedPath.ts`.
 *
 * To hook up the real thing: flip the flag below, correct the path and the response
 * shape in `types/suggestedPath.ts` if the backend named things differently, and delete
 * the stub branch in the hook. Nothing else in the replay screen needs to change.
 */
export const SUGGESTED_PATH_ENDPOINT_LIVE = false;

/** The path we expect to call. Kept here so there is one place to correct it. */
export function suggestedPathUrl(matchId: string, puuid: string): string {
  return `/api/v1/matches/${encodeURIComponent(matchId)}/suggested-path?puuid=${encodeURIComponent(puuid)}`;
}

export async function fetchSuggestedPath(
  matchId: string,
  puuid: string,
): Promise<SuggestedPath> {
  return apiFetch<SuggestedPath>(suggestedPathUrl(matchId, puuid));
}
