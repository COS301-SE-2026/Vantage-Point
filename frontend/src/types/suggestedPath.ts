/**
 * The route the coaching model thinks the player should have walked, against which the
 * replay draws the route they actually walked.
 *
 * Matches `SuggestedPathResponse` in the backend's `schemas/suggested_path.py`. The
 * first point is the player's own starting position rather than a prediction: the model
 * corrects a route from where the player actually began, so the two lines on the map
 * share an origin and diverge from there.
 */

import type { TimelinePosition } from "./timeline";

/** One recommended position, keyed to the timeline frame it belongs to. */
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
