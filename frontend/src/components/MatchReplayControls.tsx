import {
  iconPause,
  iconPlay,
  iconZoomIn,
  iconZoomOut,
} from "../assets/images/match-replay";

interface MatchReplayControlsProps {
  readonly playing: boolean;
  readonly progress: number;
  readonly zoomPercent: number;
  readonly onTogglePlaying: () => void;
  readonly onScrub: (progress: number) => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
}

/** Figma 26:1626 — Material linear determinate, 378×12 box with a 4px indicator. */
const TRACK_WIDTH = 378;
/** Material leaves a 4px gap between the active indicator and the track. */
const INDICATOR_GAP = 4;

function ProgressIndicator({
  progress,
  onScrub,
}: Readonly<{ progress: number; onScrub: (progress: number) => void }>) {
  const percent = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      className="relative h-[12px]"
      style={{ width: TRACK_WIDTH }}
      data-name="Linear-determinate progress indicator"
      data-node-id="26:1626"
    >
      <div className="absolute inset-x-0 top-[4px] h-[4px]">
        <div
          className="absolute inset-y-0 right-0 rounded-full bg-[#dddddd]"
          style={{ left: `calc(${percent}% + ${INDICATOR_GAP}px)` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#676767]"
          style={{ width: `${percent}%` }}
        />
        <div className="absolute right-0 top-0 size-[4px] rounded-full bg-[#676767]" />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(percent)}
        onChange={(event) => onScrub(Number(event.target.value) / 100)}
        aria-label="Replay progress"
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

/**
 * Figma "Map" 55:314 — transport row drawn over the minimap: pause at x8/y483,
 * the progress bar at x40/y489 and the zoom cluster at x424/y483.
 */
export default function MatchReplayControls({
  playing,
  progress,
  zoomPercent,
  onTogglePlaying,
  onScrub,
  onZoomIn,
  onZoomOut,
}: Readonly<MatchReplayControlsProps>) {
  return (
    <>
      <button
        type="button"
        onClick={onTogglePlaying}
        aria-label={playing ? "Pause replay" : "Play replay"}
        data-node-id="26:1655"
        className="absolute left-[8px] top-[483px] flex size-[24px] cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0"
      >
        <img
          src={playing ? iconPause : iconPlay}
          alt=""
          width={13.6}
          height={17.6}
        />
      </button>

      <div className="absolute left-[40px] top-[489px]">
        <ProgressIndicator progress={progress} onScrub={onScrub} />
      </div>

      <div
        data-name="Zoom controls"
        data-node-id="26:1335"
        className="absolute left-[424px] top-[483px] h-[24px] w-[85px]"
      >
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="absolute left-0 top-0 flex size-[24px] cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0"
        >
          <img src={iconZoomIn} alt="" width={20.5} height={20.5} />
        </button>
        <span className="absolute left-[31px] top-0 flex size-[24px] items-center justify-center font-['Beaufort_for_LOL',serif] text-[16px] font-bold leading-[1.4] tabular-nums text-white">
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
    </>
  );
}
