import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { fetchMatchDetail } from "../api/match";
import { fetchMatchHistory } from "../api/matches";
import { fetchLiveMetrics } from "../api/user";
import AiCoachingBar from "../components/AiCoachingBar";
import LiveMetricsPanel from "../components/LiveMetricsPanel";
import MapAnalysisTable from "../components/MapAnalysisTable";
import MatchReplayToolbar, {
  type ReplayOverlayAction,
  type ReplayToolbarMode,
} from "../components/MatchReplayToolbar";
import {
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import { buildMapAnalysisRows } from "../lib/mapAnalysisRows";
import { buildMapAnalysisTips } from "../lib/replayCoaching";
import { mapMini } from "../assets/images/metrics";
import type {
  MatchDetail,
  ParticipantDetail,
  TeamDetail,
} from "../types/match";
import type { LiveMetrics } from "../types/profile";

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

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
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | undefined>();
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

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
      setElapsed(detail.game_duration);
      const { viewer } = viewerAndTeam(detail);
      setSelectedPuuids(viewer ? new Set([viewer.puuid]) : new Set());
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

  const rows = useMemo(
    () => buildMapAnalysisRows(viewer, team),
    [viewer, team],
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
    <div
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="metrics-view"
    >
      <div className="vp-scrollbar h-full overflow-auto px-4 py-2 sm:px-6">
        {loading ? (
          <p className="font-['Beaufort_for_LOL',serif] text-[16px] text-[#757575] device-dark:text-[#929292]">
            Loading metrics…
          </p>
        ) : null}
        {error ? (
          <p className="font-['Beaufort_for_LOL',serif] text-[16px] text-[#c44a4a] device-dark:text-[#e03b3b]">
            {error}
          </p>
        ) : null}

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
                <img
                  src={mapMini}
                  alt="Match minimap"
                  data-name="map_mini"
                  data-node-id="32:422"
                  className="size-[180px] shrink-0 rounded-[5px] object-cover shadow-[4px_4px_4px_0px_rgba(0,0,0,0.5)]"
                />
                <AiCoachingBar tips={tips} />
              </div>

              <MapAnalysisTable
                rows={rows}
                clock={formatClock(elapsed)}
                playing={playing}
                onTogglePlaying={() => setPlaying((value) => !value)}
                onRewind={() => setElapsed(0)}
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
      </div>
    </div>
  );
}
