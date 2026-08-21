import { useEffect, useState } from "react";
import { fetchSuggestedPath } from "../api/suggestedPath";
import type { SuggestedPath } from "../types/suggestedPath";

export interface SuggestedPathState {
  readonly path: SuggestedPath | null;
  readonly loading: boolean;
  readonly error: string | null;
}

const IDLE: SuggestedPathState = {
  path: null,
  loading: false,
  error: null,
};

/**
 * THE SEAM. Everything else on the replay screen consumes a `SuggestedPath` and does not
 * care where it came from.
 *
 * A match the model cannot read a route from answers 404, which lands here as an error
 * string the screen prints next to the legend.
 */
export function useSuggestedPath(
  matchId: string,
  puuid: string | undefined,
): SuggestedPathState {
  const [state, setState] = useState<SuggestedPathState>(IDLE);

  useEffect(() => {
    if (!puuid) {
      setState(IDLE);
      return;
    }

    let cancelled = false;
    setState({ path: null, loading: true, error: null });

    fetchSuggestedPath(matchId, puuid)
      .then((path) => {
        if (cancelled) return;
        setState({ path, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          path: null,
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
  }, [matchId, puuid]);

  return state;
}
