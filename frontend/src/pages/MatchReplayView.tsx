import { useEffect, useMemo, useState } from "react";
import { Pause, ZoomIn, ZoomOut } from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { fetchMatchDetail } from "../api/match";
import { fetchMatchHistory } from "../api/matches";
import MatchReplayToolbar, {
  type ReplayOverlayAction,
  type ReplayToolbarMode,
} from "../components/MatchReplayToolbar";
import {
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import mapDefault from "../assets/images/match-replay/map-default.png";
import type { MatchDetail, ParticipantDetail } from "../types/match";

function formatDurationMinutes(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

function roleShort(position: string): string {
  const normalized = position.trim().toUpperCase();
  if (normalized === "BOTTOM" || normalized === "BOT") return "BOT";
  if (normalized === "MIDDLE" || normalized === "MID") return "MID";
  if (normalized === "JUNGLE" || normalized === "JGL") return "JGL";
  if (normalized === "SUPPORT" || normalized === "UTILITY") return "SUP";
  if (normalized === "TOP") return "TOP";
  return normalized.slice(0, 3) || "—";
}

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
  const [progress, setProgress] = useState(0.22);

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
    };

    load()
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load replay");
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

  const players = useMemo(
    () => (match ? allParticipants(match) : []),
    [match],
  );

  const viewer = players.find((p) => p.is_viewer);

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
      if (toolbarMode === "collapsed") {
        setToolbarMode("expanded");
        setPlayersOpen(true);
        return;
      }
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
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 font-['Inter',sans-serif] transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="match-replay-view"
    >
      <div className="relative flex h-full flex-col gap-2 overflow-hidden px-4 py-3 sm:px-6">
        {loading ? (
          <p className="text-[16px] text-[#757575]">Loading match replay…</p>
        ) : null}
        {error ? (
          <p className="text-[16px] text-[#c44a4a]">{error}</p>
        ) : null}

        {match && viewer && !loading ? (
          <>
            {/* Figma MatchMenu / MatchHistoryListRow (22:788) */}
            <div
              data-name="MatchMenu"
              className="flex h-[30px] w-full max-w-[820px] items-center gap-6 rounded-[8px] border border-[#d9d9d9] bg-white px-2"
            >
              <span
                className={`text-[13px] font-semibold ${
                  viewer.win ? "text-[#1e7e34]" : "text-[#c44a4a]"
                }`}
              >
                {viewer.win ? "Victory" : "Defeat"}
              </span>
              <span className="text-[12px] text-[#1e1e1e]">
                {viewer.champion_name}
              </span>
              <span className="ml-auto text-[12px] uppercase text-[#676767]">
                {roleShort(viewer.position)}
              </span>
              <span className="text-[12px] tabular-nums text-[#1e1e1e]">
                {viewer.kills}/{viewer.deaths}/{viewer.assists}
              </span>
              <span className="text-[12px] tabular-nums text-[#676767]">
                {viewer.cs}
              </span>
              <span className="text-[12px] tabular-nums text-[#676767]">
                {formatDurationMinutes(match.game_duration)}
              </span>
            </div>

            <div
              data-name="Map view"
              className="flex min-h-0 flex-1 items-start gap-3 overflow-hidden"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div
                  data-name="map_default 1"
                  className="relative aspect-square max-h-[min(516px,calc(100%-32px))] w-full max-w-[776px] overflow-hidden rounded-[8px] bg-[#1a1a1a]"
                >
                  <img
                    src={mapDefault}
                    alt="Summoner's Rift map"
                    className="h-full w-full object-cover transition-transform duration-200"
                    style={{
                      transform: `scale(${1 + zoomPercent / 100})`,
                    }}
                  />
                  {activeActions.has("kills") ? (
                    <span className="absolute left-[28%] top-[34%] size-3 rounded-full bg-[#e11d2e] ring-2 ring-white/80" />
                  ) : null}
                  {activeActions.has("deaths") ? (
                    <span className="absolute left-[58%] top-[48%] size-3 rounded-full bg-[#525252] ring-2 ring-white/80" />
                  ) : null}
                  {activeActions.has("path") ? (
                    <span className="pointer-events-none absolute inset-[18%] rounded-full border-2 border-dashed border-[#07f]/70" />
                  ) : null}
                </div>

                {/* Figma Map Controls (26:1657) */}
                <div
                  data-name="Map Controls"
                  className="flex max-w-[776px] items-center gap-3"
                >
                  <button
                    type="button"
                    aria-label="Pause replay"
                    className="flex size-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-[#525252] hover:bg-[#ececec]"
                  >
                    <Pause className="size-5" fill="currentColor" />
                  </button>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[#dadada]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#757575]"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(progress * 100)}
                      onChange={(e) =>
                        setProgress(Number(e.target.value) / 100)
                      }
                      aria-label="Replay progress"
                      className="absolute inset-0 w-full cursor-pointer opacity-0"
                    />
                  </div>
                  <div
                    data-name="Zoom controls"
                    className="flex items-center gap-1"
                  >
                    <button
                      type="button"
                      aria-label="Zoom in"
                      onClick={() =>
                        setZoomPercent((z) => Math.min(100, z + 10))
                      }
                      className="flex size-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-[#525252] hover:bg-[#ececec]"
                    >
                      <ZoomIn className="size-5" />
                    </button>
                    <span className="w-8 text-center text-[12px] tabular-nums text-[#676767]">
                      {zoomPercent}%
                    </span>
                    <button
                      type="button"
                      aria-label="Zoom out"
                      onClick={() =>
                        setZoomPercent((z) => Math.max(0, z - 10))
                      }
                      className="flex size-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-[#525252] hover:bg-[#ececec]"
                    >
                      <ZoomOut className="size-5" />
                    </button>
                  </div>
                </div>
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
          </>
        ) : null}

        {!loading && !error && match && !viewer ? (
          <p className="text-[16px] text-[#757575]">
            Match loaded, but no viewer participant was found.
          </p>
        ) : null}
      </div>
    </div>
  );
}
