import { useCallback, useEffect, useMemo, useState } from "react";

/** Game time per real second. At 60x a 25-minute game replays in 25 seconds. */
export const DEFAULT_REPLAY_SPEED = 60;

const TICK_MS = 100;

export interface ReplayClock {
  /** Position in the match, in milliseconds of game time. */
  readonly elapsedMs: number;
  readonly playing: boolean;
  /** 0-1, for the scrub bar. */
  readonly progress: number;
  readonly togglePlaying: () => void;
  readonly seekToProgress: (progress: number) => void;
  readonly rewind: () => void;
}

/**
 * Drives replay playback for a match of `durationMs`.
 *
 * Playback stops at the final whistle rather than looping, and any change of match
 * rewinds to the start — carrying one match's clock into another would put the scrub
 * bar somewhere meaningless.
 */
export function useReplayClock(
  durationMs: number,
  { speed = DEFAULT_REPLAY_SPEED, autoPlay = false } = {},
): ReplayClock {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);

  useEffect(() => {
    setElapsedMs(0);
    setPlaying(autoPlay);
  }, [durationMs, autoPlay]);

  useEffect(() => {
    if (!playing || durationMs <= 0) return undefined;

    const timer = globalThis.setInterval(() => {
      setElapsedMs((current) => {
        const next = current + TICK_MS * speed;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
    }, TICK_MS);

    return () => globalThis.clearInterval(timer);
  }, [playing, durationMs, speed]);

  const togglePlaying = useCallback(() => {
    setPlaying((current) => {
      // Pressing play at the final whistle starts the match again from the top.
      if (!current && elapsedMs >= durationMs && durationMs > 0) {
        setElapsedMs(0);
      }
      return !current;
    });
  }, [elapsedMs, durationMs]);

  const seekToProgress = useCallback(
    (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      setElapsedMs(clamped * durationMs);
    },
    [durationMs],
  );

  const rewind = useCallback(() => {
    setElapsedMs(0);
    setPlaying(false);
  }, []);

  const progress = durationMs > 0 ? elapsedMs / durationMs : 0;

  return useMemo(
    () => ({
      elapsedMs,
      playing,
      progress,
      togglePlaying,
      seekToProgress,
      rewind,
    }),
    [elapsedMs, playing, progress, togglePlaying, seekToProgress, rewind],
  );
}
