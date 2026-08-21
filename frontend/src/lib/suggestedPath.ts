/**
 * Queries over an AI recommended path, plus the stand-in used while the backend route
 * is still being built.
 */

import type { MapBounds, MatchTimeline } from "../types/timeline";
import type { SuggestedPath, SuggestedPathPoint } from "../types/suggestedPath";

/** The recommended route up to `elapsedMs`, so it grows with the replay clock. */
export function suggestedPathUpTo(
  path: SuggestedPath,
  elapsedMs: number,
): SuggestedPathPoint[] {
  return path.points.filter((point) => point.timestamp_ms <= elapsedMs);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * How far the preview route strays from the walked one, in Riot map units. Summoner's
 * Rift is about 15000 across, so this reads as a visible but not absurd detour.
 */
const PREVIEW_OFFSET_UNITS = 700;

/**
 * Smoothed neighbours of a frame, which is what makes the preview route look like a
 * decision rather than a copy of the walked path with a wobble on it.
 */
function smoothed(values: readonly number[], index: number): number {
  const before = values[index - 1] ?? values[index];
  const after = values[index + 1] ?? values[index];
  return (before + values[index] + after) / 3;
}

/**
 * A placeholder recommended route, shaped from the player's own frames.
 *
 * This is NOT a prediction and must never be presented as one. It exists so the overlay,
 * the toggle and the legend can be built and reviewed before the endpoint lands. Callers
 * surface it behind a "preview" label. It is deterministic: the same match always draws
 * the same line, so screenshots and tests are stable.
 */
export function buildPreviewSuggestedPath(
  timeline: MatchTimeline,
  puuid: string,
): SuggestedPath {
  const bounds: MapBounds = timeline.map_bounds;

  const walked = timeline.frames.flatMap((frame) => {
    const participant = frame.participants.find((p) => p.puuid === puuid);
    if (!participant) return [];
    return [
      { timestamp_ms: frame.timestamp_ms, position: participant.position },
    ];
  });

  const xs = walked.map((point) => point.position.x);
  const ys = walked.map((point) => point.position.y);

  const points = walked.map((point, index) => ({
    timestamp_ms: point.timestamp_ms,
    position: {
      x: clamp(
        smoothed(xs, index) + Math.sin(index * 0.9) * PREVIEW_OFFSET_UNITS,
        bounds.min_x,
        bounds.max_x,
      ),
      y: clamp(
        smoothed(ys, index) + Math.cos(index * 0.9) * PREVIEW_OFFSET_UNITS,
        bounds.min_y,
        bounds.max_y,
      ),
    },
  }));

  return { match_id: timeline.match_id, puuid, points };
}
