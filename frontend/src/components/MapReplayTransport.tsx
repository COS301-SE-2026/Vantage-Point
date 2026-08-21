import {
  iconPause,
  iconPauseWhite,
  iconPlay,
  iconPlayWhite,
  iconRewind,
  iconRewindWhite,
} from "../assets/images/metrics";
import { REPLAY_STEP_MS } from "../lib/useReplayClock";
import ReplayStepIcon from "./ReplayStepIcon";
import ThemedIcon from "./ThemedIcon";

interface MapReplayTransportProps {
  readonly clock: string;
  readonly playing: boolean;
  readonly progress: number;
  readonly onTogglePlaying: () => void;
  readonly onStepBackward: () => void;
  readonly onStepForward: () => void;
  readonly onRewind: () => void;
  readonly onScrub: (progress: number) => void;
}

const BUTTON_CLASS =
  "flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-solid border-vp-line bg-vp-raised p-0 text-vp-ink transition-colors hover:border-vp-gold hover:text-vp-gold";

/**
 * Descended from Figma "Table Cell" 32:822, which put a play toggle and a rewind
 * arrow inside the Skills column of the table's last row.
 *
 * Two glyphs in a table cell could not say which way the clock would move: the
 * rewind arrow was the only thing pointing anywhere, so the row read as a back
 * button and nothing else. The transport is its own bar now, with the four moves
 * named and in the order they run (restart, back, play, forward) and a scrub bar
 * beside them. That also gives the Skills column back to the fifth row, which is
 * where the champion's ultimate had been dropping out of the table.
 */
export default function MapReplayTransport({
  clock,
  playing,
  progress,
  onTogglePlaying,
  onStepBackward,
  onStepForward,
  onRewind,
  onScrub,
}: Readonly<MapReplayTransportProps>) {
  const stepLabel = `${String(Math.round(REPLAY_STEP_MS / 1000))} seconds`;
  const percent = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      data-name="MapReplayTransport"
      className="flex w-full flex-wrap items-center gap-[12px] rounded-[5px] bg-vp-surface px-[12px] py-[10px]"
      role="group"
      aria-label="Replay transport"
    >
      <div className="flex items-center gap-[8px]">
        <button
          type="button"
          onClick={onRewind}
          aria-label="Rewind replay"
          title="Back to the start"
          className={BUTTON_CLASS}
        >
          <ThemedIcon
            light={iconRewind}
            dark={iconRewindWhite}
            width={18.6}
            height={13.4}
          />
        </button>

        <button
          type="button"
          onClick={onStepBackward}
          aria-label={`Back ${stepLabel}`}
          title={`Back ${stepLabel}`}
          className={BUTTON_CLASS}
        >
          <ReplayStepIcon direction="back" />
        </button>

        <button
          type="button"
          onClick={onTogglePlaying}
          aria-label={playing ? "Pause replay" : "Play replay"}
          title={playing ? "Pause" : "Play"}
          className={`${BUTTON_CLASS} border-vp-gold text-vp-gold`}
        >
          <ThemedIcon
            light={playing ? iconPause : iconPlay}
            dark={playing ? iconPauseWhite : iconPlayWhite}
            width={13.4}
            height={16.9}
          />
        </button>

        <button
          type="button"
          onClick={onStepForward}
          aria-label={`Forward ${stepLabel}`}
          title={`Forward ${stepLabel}`}
          className={BUTTON_CLASS}
        >
          <ReplayStepIcon direction="forward" />
        </button>
      </div>

      <span className="shrink-0 text-[24px] leading-[1.4] tabular-nums text-vp-ink">
        {clock}
      </span>

      {/* Same shape as the bar over the replay map: a solid played half with a
          handle on its leading edge, over a track dark enough to hold it apart. */}
      <div className="group relative h-[16px] min-w-[160px] flex-1">
        <div className="absolute inset-x-0 top-[6px] h-[4px] overflow-hidden rounded-full bg-vp-canvas ring-1 ring-inset ring-vp-line">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-vp-gold"
            style={{ width: `${String(percent)}%` }}
          />
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute top-[3px] size-[10px] -translate-x-1/2 rounded-full bg-vp-gold ring-1 ring-vp-canvas transition-transform group-hover:scale-110"
          style={{ left: `${String(percent)}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(percent)}
          onChange={(event) => {
            onScrub(Number(event.target.value) / 100);
          }}
          aria-label="Replay progress"
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
