/** Queries over an AI recommended path. */

import type { SuggestedPath, SuggestedPathPoint } from "../types/suggestedPath";

/** The recommended route up to `elapsedMs`, so it grows with the replay clock. */
export function suggestedPathUpTo(
  path: SuggestedPath,
  elapsedMs: number,
): SuggestedPathPoint[] {
  return path.points.filter((point) => point.timestamp_ms <= elapsedMs);
}
