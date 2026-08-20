import { useMemo, useState } from "react";
import AiCoachingComments from "../../components/AiCoachingComments";
import MatchReplayControls from "../../components/MatchReplayControls";
import MatchReplayMapOverlay from "../../components/MatchReplayMapOverlay";
import MatchReplayMenuRow from "../../components/MatchReplayMenuRow";
import { menuRowFromDetail } from "../../lib/matchMenuRow";
import MatchReplayToolbar, {
  type ReplayOverlayAction,
  type ReplayToolbarMode,
} from "../../components/MatchReplayToolbar";
import { mapDefault } from "../../assets/images/match-replay";
import { formatTimelineClock } from "../../lib/timeline";
import { useMapPan } from "../../lib/useMapPan";
import { useReplayClock } from "../../lib/useReplayClock";
import {
  SAMPLE_COACHING_NOTES,
  SAMPLE_MATCH,
  SAMPLE_PLAYERS,
  SAMPLE_TEAM_BY_PUUID,
  SAMPLE_TIMELINE,
  SAMPLE_VIEWER,
} from "../replaySample";

/**
 * The Match Replay screen, running on a fabricated match, so the landing page
 * shows the product itself instead of a screenshot that goes stale the moment
 * the dashboard changes. Every part of it is the component the dashboard
 * renders: the summary row, the tool bar, the map overlay, the transport
 * controls and the coaching panel.
 *
 * The differences are that nothing is fetched, the map is sized by the card it
 * sits in rather than by the viewport, and "Show Analysis" and "Change Map"
 * light up without navigating anywhere.
 */
export default function ReplayPreview() {
  const [toolbarMode, setToolbarMode] =
    useState<ReplayToolbarMode>("collapsed");
  const [playersOpen, setPlayersOpen] = useState(false);
  const [activeActions, setActiveActions] = useState<Set<ReplayOverlayAction>>(
    () => new Set<ReplayOverlayAction>(["deaths", "path"]),
  );
  const [selectedPuuids, setSelectedPuuids] = useState<Set<string>>(
    () => new Set([SAMPLE_VIEWER.puuid]),
  );
  const [zoomPercent, setZoomPercent] = useState(0);

  const clock = useReplayClock(SAMPLE_TIMELINE.game_duration_ms, {
    autoPlay: true,
  });
  const {
    attach: attachMap,
    transform: mapTransform,
    dragging,
    pannable,
    handlers: panHandlers,
  } = useMapPan(1 + zoomPercent / 100);

  const overlayToggles = useMemo(
    () => ({
      kills: activeActions.has("kills"),
      deaths: activeActions.has("deaths"),
      path: activeActions.has("path"),
      // The recommended route is offered on the replay screen only.
      suggestedPath: false,
    }),
    [activeActions],
  );

  const handleToggleMode = () => {
    setToolbarMode((mode) => {
      if (mode === "expanded") {
        setPlayersOpen(false);
        return "collapsed";
      }
      return "expanded";
    });
  };

  const handleActionClick = (action: ReplayOverlayAction) => {
    if (action === "players") {
      setPlayersOpen((open) => !open);
      return;
    }

    setActiveActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
  };

  const handleTogglePlayer = (puuid: string) => {
    setSelectedPuuids((prev) => {
      const next = new Set(prev);
      if (next.has(puuid)) next.delete(puuid);
      else next.add(puuid);
      return next;
    });
  };

  return (
    <div
      data-name="replay-preview"
      className="flex h-full w-full flex-col gap-[8px] overflow-hidden rounded-xl bg-vp-canvas p-[8px] text-left"
    >
      <MatchReplayMenuRow
        row={menuRowFromDetail(SAMPLE_MATCH, SAMPLE_VIEWER)}
      />

      {/* Same row the Match Replay screen draws: the tool rail, then the square
          map, then the coaching panel. The map is driven by the height left in
          the card rather than by the viewport, so the whole thing fits the
          fixed-height showcase frame. */}
      <div className="flex min-h-0 flex-1 items-start justify-center gap-[10px]">
        <MatchReplayToolbar
          mode={toolbarMode}
          playersOpen={playersOpen}
          activeActions={activeActions}
          players={SAMPLE_PLAYERS}
          selectedPuuids={selectedPuuids}
          onToggleMode={handleToggleMode}
          onActionClick={handleActionClick}
          onTogglePlayer={handleTogglePlayer}
        />

        <div
          data-name="Map"
          className="relative aspect-square h-full shrink-0 overflow-hidden rounded-[8px] bg-[#1a1a1a]"
        >
          <div
            ref={attachMap}
            {...panHandlers}
            /* `touch-none` only once there is something to pan to: at 1x it would
               swallow the vertical swipe that scrolls the page. */
            className={`absolute inset-0 ${pannable ? "touch-none" : ""} ${
              dragging ? "cursor-grabbing" : "transition-transform duration-200"
            } ${pannable && !dragging ? "cursor-grab" : ""}`}
            style={{ transform: mapTransform }}
          >
            <img
              src={mapDefault}
              alt="Summoner's Rift map"
              className="size-full object-cover"
              draggable={false}
            />
            <MatchReplayMapOverlay
              timeline={SAMPLE_TIMELINE}
              players={SAMPLE_PLAYERS}
              teamIdByPuuid={SAMPLE_TEAM_BY_PUUID}
              selectedPuuids={selectedPuuids}
              elapsedMs={clock.elapsedMs}
              toggles={overlayToggles}
            />
          </div>

          <div className="absolute left-[8px] top-[8px] flex items-center gap-2 rounded-[6px] bg-black/55 px-[8px] py-[3px]">
            <span className="text-[14px] font-bold tabular-nums text-white">
              {formatTimelineClock(clock.elapsedMs)}
            </span>
          </div>

          <MatchReplayControls
            playing={clock.playing}
            progress={clock.progress}
            zoomPercent={zoomPercent}
            onTogglePlaying={clock.togglePlaying}
            onScrub={clock.seekToProgress}
            onStepBackward={clock.stepBackward}
            onStepForward={clock.stepForward}
            onZoomIn={() => setZoomPercent((z) => Math.min(100, z + 10))}
            onZoomOut={() => setZoomPercent((z) => Math.max(0, z - 10))}
          />
        </div>

        <div className="ml-[6px] hidden h-full min-w-0 max-w-[288px] flex-1 overflow-hidden sm:flex">
          <AiCoachingComments notes={SAMPLE_COACHING_NOTES} />
        </div>
      </div>
    </div>
  );
}
