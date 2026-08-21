import {
  iconPause,
  iconPlay,
  iconZoomIn,
  iconZoomOut,
} from "../assets/images/match-replay";
import { REPLAY_STEP_MS } from "../lib/useReplayClock";
import ReplayStepIcon from "./ReplayStepIcon";

const STEP_BUTTON_CLASS =
  "flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-white/85 transition-colors hover:text-white";

interface MatchReplayControlsProps {
  readonly playing: boolean;
  readonly progress: number;
  readonly zoomPercent: number;
  readonly onTogglePlaying: () => void;
  readonly onScrub: (progress: number) => void;
  readonly onStepBackward: () => void;
  readonly onStepForward: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
}

/**
 * Figma drew this as a Material linear progress indicator, whose active half is a
 * translucent white on a translucent track. Over a lit minimap neither half was
 * legible, so the played part is solid white with a handle on its leading edge, and
 * the rest of the track is dark enough to hold that white apart from the terrain.
 */
function ProgressIndicator({
  progress,
  onScrub,
}: Readonly<{ progress: number; onScrub: (progress: number) => void }>) {
  const percent = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      className="group relative h-[16px] min-w-0 flex-1"
      data-name="Linear-determinate progress indicator"
      data-node-id="26:1626"
    >
      <div className="absolute inset-x-0 top-[6px] h-[4px] overflow-hidden rounded-full bg-black/55 ring-1 ring-inset ring-white/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          style={{ width: `${String(percent)}%` }}
        />
      </div>
      {/* Sits on the leading edge, so the position is readable at a glance even where
          the played bar runs over a pale part of the map. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-[3px] size-[10px] -translate-x-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.7)] ring-1 ring-black/30 transition-transform group-hover:scale-110"
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
  );
}

/**
 * Figma "Map" 55:314 draws the transport row over the minimap: pause at x8/y483,
 * the progress bar at x40/y489 and the zoom cluster at x424/y483. Those offsets
 * assume the 516px square, so the row is anchored to the map's bottom edge
 * instead and keeps the same insets at any map size.
 */
export default function MatchReplayControls({
  playing,
  progress,
  zoomPercent,
  onTogglePlaying,
  onScrub,
  onStepBackward,
  onStepForward,
  onZoomIn,
  onZoomOut,
}: Readonly<MatchReplayControlsProps>) {
  const stepLabel = `${String(Math.round(REPLAY_STEP_MS / 1000))} seconds`;

  return (
    <>
      {/* The row sits straight on the terrain, which is bright in places and dark in
          others. The wash gives every control the same ground to be read against. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[74px] bg-gradient-to-t from-black/80 via-black/45 to-transparent"
      />

      <div className="absolute inset-x-[8px] bottom-[9px] flex items-center gap-[12px]">
        <button
          type="button"
          onClick={onStepBackward}
          aria-label={`Back ${stepLabel}`}
          title={`Back ${stepLabel}`}
          className={STEP_BUTTON_CLASS}
        >
          <ReplayStepIcon direction="back" />
        </button>

        <button
          type="button"
          onClick={onTogglePlaying}
          aria-label={playing ? "Pause replay" : "Play replay"}
          data-node-id="26:1655"
          className="flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0"
        >
          <img
            src={playing ? iconPause : iconPlay}
            alt=""
            width={13.6}
            height={17.6}
          />
        </button>

        <button
          type="button"
          onClick={onStepForward}
          aria-label={`Forward ${stepLabel}`}
          title={`Forward ${stepLabel}`}
          className={STEP_BUTTON_CLASS}
        >
          <ReplayStepIcon direction="forward" />
        </button>

        <ProgressIndicator progress={progress} onScrub={onScrub} />

        <div
          data-name="Zoom controls"
          data-node-id="26:1335"
          className="relative h-[24px] w-[85px] shrink-0"
        >
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="absolute left-0 top-0 flex size-[24px] cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0"
          >
            <img src={iconZoomIn} alt="" width={20.5} height={20.5} />
          </button>
          <span className="absolute left-[31px] top-0 flex size-[24px] items-center justify-center text-[16px] font-bold leading-[1.4] tabular-nums text-white">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="absolute left-[61px] top-0 flex size-[24px] cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0"
          >
            <img src={iconZoomOut} alt="" width={20.5} height={20.5} />
          </button>
        </div>
      </div>
    </>
  );
}
