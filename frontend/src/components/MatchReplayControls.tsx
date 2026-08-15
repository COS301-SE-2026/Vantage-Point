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

/** Material leaves a 4px gap between the active indicator and the track. */
const INDICATOR_GAP = 4;

function ProgressIndicator({
  progress,
  onScrub,
}: Readonly<{ progress: number; onScrub: (progress: number) => void }>) {
  const percent = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      className="relative h-[12px] min-w-0 flex-1"
      data-name="Linear-determinate progress indicator"
      data-node-id="26:1626"
    >
      <div className="absolute inset-x-0 top-[4px] h-[4px]">
        {/* Drawn over the minimap, so Figma keeps the same track in both themes. */}
        <div
          className="absolute inset-y-0 right-0 rounded-full bg-vp-raised"
          style={{ left: `calc(${percent}% + ${INDICATOR_GAP}px)` }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-vp-line-strong"
          style={{ width: `${percent}%` }}
        />
        <div className="absolute right-0 top-0 size-[4px] rounded-full bg-vp-line-strong" />
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
  onZoomIn,
  onZoomOut,
}: Readonly<MatchReplayControlsProps>) {
  return (
    <div className="absolute inset-x-[8px] bottom-[9px] flex items-center gap-[16px]">
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
        <span className="absolute left-[31px] top-0 flex size-[24px] items-center justify-center text-[16px] font-bold leading-[1.4] tabular-nums text-vp-ink">
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
  );
}
