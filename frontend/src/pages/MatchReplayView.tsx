import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { fetchMatchDetail } from "../api/match";
import { fetchMatchHistory } from "../api/matches";
import { fetchMatchTimeline } from "../api/timeline";
import AiCoachingComments from "../components/AiCoachingComments";
import MatchReplayControls from "../components/MatchReplayControls";
import MatchReplayMapOverlay from "../components/MatchReplayMapOverlay";
import MatchReplayMenuRow from "../components/MatchReplayMenuRow";
import MatchReplayToolbar, {
  type ReplayOverlayAction,
  type ReplayToolbarMode,
} from "../components/MatchReplayToolbar";
import {
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import { buildReplayCoachingNotes } from "../lib/replayCoaching";
import { formatTimelineClock } from "../lib/timeline";
import { useReplayClock } from "../lib/useReplayClock";
import { mapDefault } from "../assets/images/match-replay";
import type { MatchDetail, ParticipantDetail } from "../types/match";
import type { MatchTimeline } from "../types/timeline";

/**
 * Figma "Map view" 26:1008 — 820 wide: 40 toolbar, 10, 516 map, 24, 230 panel.
 * The map now takes the slack in the region instead, capped so its square still
 * fits the viewport height; 516 stays the floor.
 */
const MAP_MIN_SIZE = 516;

function allParticipants(match: MatchDetail): ParticipantDetail[] {
  return match.teams.flatMap((team) => [...team.participants]);
}

export default function MatchReplayView() {
  const navigate = useNavigate();
  const { matchId: matchIdParam } = useParams<{ matchId?: string }>();
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const sidebarOpen = outlet?.sidebarOpen ?? true;
  const contentStyle = getDashboardContentStyle(sidebarOpen);

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toolbarMode, setToolbarMode] =
    useState<ReplayToolbarMode>("collapsed");
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      let id = matchIdParam ?? "";
      if (!id) {
        const history = await fetchMatchHistory();
        id = history[0]?.matchId ?? "";
        if (id) {
          navigate(`/dashboard/replay/${encodeURIComponent(id)}`, {
            replace: true,
          });
          return;
        }
        throw new Error("No matches available for replay");
      }
      const detail = await fetchMatchDetail(id);
      if (cancelled) return;
      setMatch(detail);
      const viewer = allParticipants(detail).find((p) => p.is_viewer);
      setSelectedPuuids(viewer ? new Set([viewer.puuid]) : new Set());

      // The scoreboard is enough to render the screen, so the timeline loads after it
      // and its absence only costs the map overlay — the backend has to reach Riot for
      // it the first time any match is opened.
      setTimeline(null);
      setTimelineError(null);
      try {
        const frames = await fetchMatchTimeline(id);
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
  }, [matchIdParam, navigate]);

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
    }),
    [activeActions],
  );

  const viewer = players.find((p) => p.is_viewer);

  const coachingNotes = useMemo(
    () => (match && viewer ? buildReplayCoachingNotes(match, viewer) : []),
    [match, viewer],
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
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="match-replay-view"
    >
      <div className="vp-scrollbar h-full overflow-auto px-4 py-2 sm:px-6">
        {loading ? (
          <p className="font-['Beaufort_for_LOL',serif] text-[16px] text-[#757575] device-dark:text-[#929292]">
            Loading match replay…
          </p>
        ) : null}
        {error ? (
          <p className="font-['Beaufort_for_LOL',serif] text-[16px] text-[#c44a4a] device-dark:text-[#e03b3b]">
            {error}
          </p>
        ) : null}

        {match && viewer && !loading ? (
          /* Figma "Map view" 26:1008 — 820×557, an 11px gutter under MatchMenu. */
          <div
            data-name="Map view"
            data-node-id="26:1008"
            className="mx-auto flex w-full max-w-[var(--vp-content-max)] flex-col gap-[8px]"
          >
            <MatchReplayMenuRow match={match} viewer={viewer} />

            <div className="flex items-start">
              <MatchReplayToolbar
                mode={toolbarMode}
                playersOpen={playersOpen}
                activeActions={activeActions}
                players={players}
                selectedPuuids={selectedPuuids}
                onToggleMode={handleToggleMode}
                onActionClick={handleActionClick}
                onTogglePlayer={handleTogglePlayer}
              />

              <div
                data-name="Map"
                data-node-id="55:314"
                className="relative ml-[10px] aspect-square min-w-0 flex-1 overflow-hidden rounded-[8px] bg-[#1a1a1a]"
                style={{
                  minWidth: MAP_MIN_SIZE,
                  maxWidth: "calc(100vh - 210px)",
                }}
              >
                {/* The overlay shares this transform so markers stay pinned to the
                    terrain under them as the map is zoomed. */}
                <div
                  className="absolute inset-0 transition-transform duration-200"
                  style={{ transform: `scale(${1 + zoomPercent / 100})` }}
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
                    />
                  ) : null}
                </div>

                <div className="absolute left-[8px] top-[8px] flex items-center gap-2 rounded-[6px] bg-black/55 px-[8px] py-[3px]">
                  <span className="font-['Beaufort_for_LOL',serif] text-[14px] font-bold tabular-nums text-white">
                    {formatTimelineClock(clock.elapsedMs)}
                  </span>
                  {timeline ? null : (
                    <span className="font-['Beaufort_for_LOL',serif] text-[12px] text-white/70">
                      {timelineError ?? "Loading replay data…"}
                    </span>
                  )}
                </div>

                <MatchReplayControls
                  playing={clock.playing}
                  progress={clock.progress}
                  zoomPercent={zoomPercent}
                  onTogglePlaying={clock.togglePlaying}
                  onScrub={clock.seekToProgress}
                  onZoomIn={() => setZoomPercent((z) => Math.min(100, z + 10))}
                  onZoomOut={() => setZoomPercent((z) => Math.max(0, z - 10))}
                />
              </div>

              <div className="ml-[24px] flex min-w-[230px] max-w-[320px] flex-1 self-stretch">
                <AiCoachingComments notes={coachingNotes} />
              </div>
            </div>
          </div>
        ) : null}

        {!loading && !error && match && !viewer ? (
          <p className="font-['Beaufort_for_LOL',serif] text-[16px] text-[#757575] device-dark:text-[#929292]">
            Match loaded, but no viewer participant was found.
          </p>
        ) : null}
      </div>
    </div>
  );
}
