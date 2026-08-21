import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { fetchMatchDetail } from "../api/match";
import { fetchMatchTimeline } from "../api/timeline";
import AiCoachingComments from "./AiCoachingComments";
import MatchReplayControls from "./MatchReplayControls";
import MatchReplayMapOverlay from "./MatchReplayMapOverlay";
import MatchReplayToolbar, {
  type ReplayOverlayAction,
} from "./MatchReplayToolbar";
import { buildReplayCoachingNotes } from "../lib/replayCoaching";
import { formatTimelineClock } from "../lib/timeline";
import { useMapPan } from "../lib/useMapPan";
import { useReplayClock } from "../lib/useReplayClock";
import { useSuggestedPath } from "../lib/useSuggestedPath";
import { mapDefault } from "../assets/images/match-replay";
import type { MatchDetail, ParticipantDetail } from "../types/match";
import type { MatchTimeline } from "../types/timeline";

/**
 * Figma "Map view" 26:1008 is 820 wide: 40 toolbar, 10, 516 map, 24, 230 panel.
 * The toolbar is no longer part of that width: it runs across the top now, so the map
 * starts at the left edge and the whole 40 + 10 the rail used to hold goes back into
 * the square. 516 stays the floor, below which the coaching column wraps under the map
 * rather than squeezing it further.
 */
const MAP_MIN_SIZE = 516;

/** Gap between the tool bar and the map under it. */
const TOOLBAR_GAP = 10;

/**
 * The map and the coaching column split the row evenly, so the square is as wide as
 * half of whatever the screen gives it. Past this the halves stop growing: a map much
 * larger than the frame Figma drew reads as a zoomed image rather than as a minimap,
 * and there is no more detail in it to see.
 */
const ROW_MAX_WIDTH = 1656;

interface MatchReplayPanelProps {
  readonly matchId: string;
}

function allParticipants(match: MatchDetail): ParticipantDetail[] {
  return match.teams.flatMap((team) => [...team.participants]);
}

/**
 * One expanded match on the replay screen: the tool rail, the map and the
 * coaching column, with its own clock, overlays and player selection. Each row
 * in the list mounts its own panel, so opening a second match does not disturb
 * where the first one is paused.
 */
export default function MatchReplayPanel({
  matchId,
}: Readonly<MatchReplayPanelProps>) {
  const navigate = useNavigate();

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playersOpen, setPlayersOpen] = useState(false);
  const [activeActions, setActiveActions] = useState<Set<ReplayOverlayAction>>(
    () => new Set(),
  );
  const [selectedPuuids, setSelectedPuuids] = useState<Set<string>>(
    () => new Set(),
  );
  const [zoomPercent, setZoomPercent] = useState(0);
  const [timeline, setTimeline] = useState<MatchTimeline | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const clock = useReplayClock(timeline?.game_duration_ms ?? 0);
  const {
    attach: attachMap,
    transform: mapTransform,
    dragging,
    pannable,
    handlers: panHandlers,
  } = useMapPan(1 + zoomPercent / 100);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      const detail = await fetchMatchDetail(matchId);
      if (cancelled) return;
      setMatch(detail);
      const viewer = allParticipants(detail).find((p) => p.is_viewer);
      setSelectedPuuids(viewer ? new Set([viewer.puuid]) : new Set());

      // The scoreboard is enough to render the screen, so the timeline loads after it
      // and its absence only costs the map overlay. The backend has to reach Riot for
      // it the first time any match is opened.
      setTimeline(null);
      setTimelineError(null);
      try {
        const frames = await fetchMatchTimeline(matchId);
        if (!cancelled) setTimeline(frames);
      } catch (err: unknown) {
        if (!cancelled) {
          setTimelineError(
            err instanceof Error
              ? err.message
              : "No replay data available for this match",
          );
        }
      }
    };

    load()
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load replay",
          );
          setMatch(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const players = useMemo(() => (match ? allParticipants(match) : []), [match]);

  const teamIdByPuuid = useMemo(() => {
    const byPuuid = new Map<string, number>();
    for (const team of match?.teams ?? []) {
      for (const participant of team.participants) {
        byPuuid.set(participant.puuid, team.team_id);
      }
    }
    return byPuuid;
  }, [match]);

  const overlayToggles = useMemo(
    () => ({
      kills: activeActions.has("kills"),
      deaths: activeActions.has("deaths"),
      path: activeActions.has("path"),
      suggestedPath: activeActions.has("suggested-path"),
    }),
    [activeActions],
  );

  const viewer = players.find((p) => p.is_viewer);

  // The recommendation is about one player, and the replay is opened from that player's
  // own history, so it follows the viewer rather than the toolbar's selection.
  const suggested = useSuggestedPath(matchId, viewer?.puuid, timeline);
  const showingSuggestedPath = activeActions.has("suggested-path");

  const coachingNotes = useMemo(
    () => (match && viewer ? buildReplayCoachingNotes(match, viewer) : []),
    [match, viewer],
  );

  const handleActionClick = (action: ReplayOverlayAction) => {
    if (action === "players") {
      setPlayersOpen((open) => !open);
      return;
    }

    // Analysis is a destination, not an overlay: it opens the metrics view for the
    // match being replayed. That view used to be reachable from the sidebar instead.
    if (action === "analysis") {
      navigate(`/dashboard/metrics/${encodeURIComponent(matchId)}`);
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

  if (loading) {
    return <p className="text-[16px] text-vp-dim">Loading match replay…</p>;
  }

  if (error) {
    return <p className="text-[16px] text-vp-loss">{error}</p>;
  }

  if (!match) return null;

  if (!viewer) {
    return (
      <p className="text-[16px] text-vp-dim">
        Match loaded, but no viewer participant was found.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <MatchReplayToolbar
        playersOpen={playersOpen}
        activeActions={activeActions}
        players={players}
        selectedPuuids={selectedPuuids}
        onActionClick={handleActionClick}
        onTogglePlayer={handleTogglePlayer}
        orientation="horizontal"
      />

      <div
        className="flex flex-wrap items-start gap-[16px]"
        style={{ marginTop: TOOLBAR_GAP, maxWidth: ROW_MAX_WIDTH }}
      >
        <div
          data-name="Map"
          data-node-id="55:314"
          className="relative aspect-square min-w-0 flex-1 basis-0 overflow-hidden rounded-[8px] bg-[#1a1a1a]"
          style={{ minWidth: MAP_MIN_SIZE }}
        >
          {/* The overlay shares this transform so markers stay pinned to the
            terrain under them as the map is zoomed, and travel with it as it is
            dragged. The transition is dropped mid-drag: easing every pointer move
            would make the map trail the cursor. */}
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
              data-name="map_default 1"
            />
            {timeline ? (
              <MatchReplayMapOverlay
                timeline={timeline}
                players={players}
                teamIdByPuuid={teamIdByPuuid}
                selectedPuuids={selectedPuuids}
                elapsedMs={clock.elapsedMs}
                toggles={overlayToggles}
                suggestedPath={suggested.path}
              />
            ) : null}
          </div>

          <div className="absolute left-[8px] top-[8px] flex items-center gap-2 rounded-[6px] bg-black/55 px-[8px] py-[3px]">
            <span className="text-[14px] font-bold tabular-nums text-white">
              {formatTimelineClock(clock.elapsedMs)}
            </span>
            {timeline ? null : (
              <span className="text-[12px] text-white/70">
                {timelineError ?? "Loading replay data…"}
              </span>
            )}
          </div>

          {showingSuggestedPath ? (
            <div className="absolute right-[8px] top-[8px] flex max-w-[230px] flex-col items-end gap-1">
              <span className="flex items-center gap-2 rounded-[6px] bg-black/55 px-[8px] py-[3px] text-[12px] text-white">
                <span
                  aria-hidden
                  className="h-0 w-[18px] border-t-2 border-dashed border-vp-gold"
                />
                AI path
              </span>
              {suggested.preview ? (
                <span className="rounded-[6px] bg-black/55 px-[8px] py-[3px] text-right text-[11px] leading-[14px] text-vp-gold">
                  Preview shape only, not a model prediction
                </span>
              ) : null}
              {suggested.loading ? (
                <span className="rounded-[6px] bg-black/55 px-[8px] py-[3px] text-[11px] text-white/70">
                  Loading recommended path…
                </span>
              ) : null}
              {suggested.error ? (
                <span className="rounded-[6px] bg-black/55 px-[8px] py-[3px] text-right text-[11px] leading-[14px] text-white/70">
                  {suggested.error}
                </span>
              ) : null}
            </div>
          ) : null}

          <MatchReplayControls
            playing={clock.playing}
            progress={clock.progress}
            zoomPercent={zoomPercent}
            onTogglePlaying={clock.togglePlaying}
            onScrub={clock.seekToProgress}
            onStepBackward={clock.stepBackward}
            onStepForward={clock.stepForward}
            onZoomIn={() => {
              setZoomPercent((z) => Math.min(100, z + 10));
            }}
            onZoomOut={() => {
              setZoomPercent((z) => Math.max(0, z - 10));
            }}
          />
        </div>

        {/* Half the row each, and the coaching column runs down to the bottom edge
            of the square. The panel used to stop at 380px wide and at the height of
            its last note, which left the right third of the screen empty. */}
        <div className="flex min-w-[300px] flex-1 basis-0 self-stretch">
          <AiCoachingComments notes={coachingNotes} />
        </div>
      </div>
    </div>
  );
}
