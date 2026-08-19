import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchMatchDetail } from "../api/match";
import { fetchMatchHistory } from "../api/matches";
import { fetchLiveMetrics } from "../api/user";
import { fetchMatchTimeline } from "../api/timeline";
import AiCoachingBar from "../components/AiCoachingBar";
import LiveMetricsPanel from "../components/LiveMetricsPanel";
import MapAnalysisTable from "../components/MapAnalysisTable";
import MatchReplayMapOverlay from "../components/MatchReplayMapOverlay";
import MatchReplayToolbar, {
  type ReplayOverlayAction,
  type ReplayToolbarMode,
} from "../components/MatchReplayToolbar";
import { PageContainer } from "../components/dashboard/primitives";
import { buildMapAnalysisRows } from "../lib/mapAnalysisRows";
import { buildMapAnalysisTips } from "../lib/replayCoaching";
import { buildAnalysisSnapshot, formatTimelineClock } from "../lib/timeline";
import { useReplayClock } from "../lib/useReplayClock";
import { mapMini } from "../assets/images/metrics";
import type {
  MatchDetail,
  ParticipantDetail,
  TeamDetail,
} from "../types/match";
import type { LiveMetrics } from "../types/profile";
import type { MatchTimeline } from "../types/timeline";

function viewerAndTeam(match: MatchDetail): {
  viewer?: ParticipantDetail;
  team?: TeamDetail;
} {
  for (const team of match.teams) {
    const viewer = team.participants.find((p) => p.is_viewer);
    if (viewer) return { viewer, team };
  }
  return {};
}

export default function MetricsView() {
  const navigate = useNavigate();
  const { matchId: matchIdParam } = useParams<{ matchId?: string }>();

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
  const [timeline, setTimeline] = useState<MatchTimeline | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | undefined>();
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // The table reads the frame at this clock, so it starts at kick-off rather than at
  // the final whistle and the transport row below it actually moves the numbers.
  const clock = useReplayClock(timeline?.game_duration_ms ?? 0);

  // Independent of the selected match: these are averages over the account's recent
  // games, so they load in parallel and a Riot outage must not blank the page.
  useEffect(() => {
    let cancelled = false;
    setMetricsLoading(true);
    setMetricsError(null);
    // One Riot call per match analysed, so keep the window small — a Riot dev key
    // only allows 100 requests per two minutes across the whole app.
    fetchLiveMetrics(5)
      .then((metrics) => {
        if (!cancelled) setLiveMetrics(metrics);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setMetricsError(
            err instanceof Error ? err.message : "Could not read live metrics",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setMetricsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          navigate(`/dashboard/metrics/${encodeURIComponent(id)}`, {
            replace: true,
          });
          return;
        }
        throw new Error("No matches available for metrics");
      }
      const detail = await fetchMatchDetail(id);
      if (cancelled) return;
      setMatch(detail);
      const { viewer } = viewerAndTeam(detail);
      setSelectedPuuids(viewer ? new Set([viewer.puuid]) : new Set());

      // Per-frame rows need the timeline, but the rest of the page does not, so its
      // absence only costs those rows their values (see buildMapAnalysisRows).
      setTimeline(null);
      try {
        const frames = await fetchMatchTimeline(id);
        if (!cancelled) setTimeline(frames);
      } catch {
        // Riot has no timeline for this match; the table falls back to "—".
      }
    };

    load()
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load metrics",
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

  const { viewer, team } = useMemo(
    () => (match ? viewerAndTeam(match) : {}),
    [match],
  );

  const players = useMemo(
    () => (match ? match.teams.flatMap((t) => [...t.participants]) : []),
    [match],
  );

  const teamIdByPuuid = useMemo(() => {
    const byPuuid = new Map<string, number>();
    for (const matchTeam of match?.teams ?? []) {
      for (const participant of matchTeam.participants) {
        byPuuid.set(participant.puuid, matchTeam.team_id);
      }
    }
    return byPuuid;
  }, [match]);

  const snapshot = useMemo(() => {
    if (!timeline) return undefined;
    return buildAnalysisSnapshot(
      timeline,
      viewer?.puuid,
      team ? team.participants.map((p) => p.puuid) : [],
      team?.team_id,
      clock.elapsedMs,
    );
  }, [timeline, viewer, team, clock.elapsedMs]);

  const rows = useMemo(
    () => buildMapAnalysisRows(viewer, team, snapshot),
    [viewer, team, snapshot],
  );

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

  const tips = useMemo(
    () => (match ? buildMapAnalysisTips(match, viewer) : []),
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
    <div data-name="metrics-view">
      <PageContainer>
        {loading ? (
          <p className="text-[16px] text-vp-dim">Loading metrics…</p>
        ) : null}
        {error ? <p className="text-[16px] text-vp-loss">{error}</p> : null}

        {match && !loading ? (
          <div
            data-name="MapAnalysisView"
            data-node-id="32:961"
            className="mx-auto flex w-full max-w-[var(--vp-content-max)] items-start gap-[8px]"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
              <LiveMetricsPanel
                metrics={liveMetrics}
                loading={metricsLoading}
                error={metricsError}
              />

              <div className="flex items-start gap-[24px]">
                <div
                  data-name="map_mini"
                  data-node-id="32:422"
                  className="relative size-[180px] shrink-0 overflow-hidden rounded-[5px] shadow-[4px_4px_4px_0px_rgba(0,0,0,0.5)]"
                >
                  <img
                    src={mapMini}
                    alt="Match minimap"
                    className="size-full object-cover"
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
                <AiCoachingBar tips={tips} />
              </div>

              <MapAnalysisTable
                rows={rows}
                clock={formatTimelineClock(clock.elapsedMs)}
                playing={clock.playing}
                onTogglePlaying={clock.togglePlaying}
                onRewind={clock.rewind}
              />
            </div>

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
          </div>
        ) : null}
      </PageContainer>
    </div>
  );
}
