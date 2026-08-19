import { useEffect, useState } from "react";
import {
  SUGGESTED_PATH_ENDPOINT_LIVE,
  fetchSuggestedPath,
} from "../api/suggestedPath";
import { buildPreviewSuggestedPath } from "./suggestedPath";
import type { MatchTimeline } from "../types/timeline";
import type { SuggestedPath } from "../types/suggestedPath";

export interface SuggestedPathState {
  readonly path: SuggestedPath | null;
  /** True while the line on the map is preview data rather than a model output. */
  readonly preview: boolean;
  readonly loading: boolean;
  readonly error: string | null;
}

const IDLE: SuggestedPathState = {
  path: null,
  preview: false,
  loading: false,
  error: null,
};

/**
 * THE SEAM. Everything else on the replay screen consumes a `SuggestedPath` and does not
 * care where it came from.
 *
 * While `SUGGESTED_PATH_ENDPOINT_LIVE` is false this returns a locally derived preview
 * route so the overlay can be built and reviewed. When the backend route ships, flip the
 * flag in `api/suggestedPath.ts` and delete the preview branch below — the overlay, the
 * toolbar toggle and the legend keep working untouched.
 */
export function useSuggestedPath(
  matchId: string,
  puuid: string | undefined,
  timeline: MatchTimeline | null,
): SuggestedPathState {
  const [state, setState] = useState<SuggestedPathState>(IDLE);

  useEffect(() => {
    if (!puuid) {
      setState(IDLE);
      return;
    }

    // --- preview branch: delete once the endpoint is live -------------------
    if (!SUGGESTED_PATH_ENDPOINT_LIVE) {
      if (!timeline) {
        setState(IDLE);
        return;
      }
      setState({
        path: buildPreviewSuggestedPath(timeline, puuid),
        preview: true,
        loading: false,
        error: null,
      });
      return;
    }
    // -----------------------------------------------------------------------

    let cancelled = false;
    setState({ path: null, preview: false, loading: true, error: null });

    fetchSuggestedPath(matchId, puuid)
      .then((path) => {
        if (cancelled) return;
        setState({ path, preview: false, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          path: null,
          preview: false,
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : "No recommended path for this match",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [matchId, puuid, timeline]);

  return state;
}
