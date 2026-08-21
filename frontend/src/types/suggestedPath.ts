/**
 * The route the coaching model thinks the player should have walked, against which the
 * replay draws the route they actually walked.
 *
 * PROVISIONAL: the backend endpoint does not exist yet. This mirrors what the pieces
 * already in the backend can produce — `pred_engine/ai_caller.get_knn_output` returns a
 * list of `[x, y]` map coordinates, one per timeline frame, and the frames it is fed
 * come from `/analytics/map_suggest_data/{match_id}`, which carries their timestamps.
 * Confirm the field names with whoever builds the route before treating this as fixed.
 */

import type { TimelinePosition } from "./timeline";

/** One predicted position, keyed to the timeline frame it belongs to. */
export interface SuggestedPathPoint {
  /** Milliseconds from the start of the game, matching a frame in `MatchTimeline`. */
  readonly timestamp_ms: number;
  /** Riot map units, the same space as `TimelineParticipantFrame.position`. */
  readonly position: TimelinePosition;
}

export interface SuggestedPath {
  readonly match_id: string;
  readonly puuid: string;
  readonly points: readonly SuggestedPathPoint[];
}
