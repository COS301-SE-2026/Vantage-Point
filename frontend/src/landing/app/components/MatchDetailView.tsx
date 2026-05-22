import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { fetchMatchDetail } from "../api/match";
import {
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import {
  championIconUrl,
  itemIconUrl,
  summonerSpellIconUrl,
} from "../lib/ddragon";
import type {
  MatchDetail,
  ParticipantDetail,
  TeamDetail,
} from "../types/match";

interface MatchDetailViewProps {
  readonly matchId?: string;
  readonly sidebarOpen?: boolean;
  readonly onBack?: () => void;
  readonly viewerPuuid?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatGameDate(epochMs: number): string {
  return new Date(epochMs).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function viewerParticipant(
  match: MatchDetail,
  viewerPuuid?: string
): ParticipantDetail | undefined {
  for (const team of match.teams) {
    const found = team.participants.find(
      (p) => p.is_viewer || (viewerPuuid && p.puuid === viewerPuuid)
    );
    if (found) return found;
  }
  return undefined;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-[#e8e8e8]" />
      <div className="h-4 w-full rounded bg-[#f0f0f0]" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 rounded bg-[#f0f0f0]" />
        <div className="h-64 rounded bg-[#f0f0f0]" />
      </div>
    </div>
  );
}

function ParticipantRow({
  player,
}: Readonly<{ player: ParticipantDetail }>) {
  const isViewer = player.is_viewer;
  const rowBg = isViewer ? "bg-[#dce8fc]" : "";
  const cellBase = `py-2 ${rowBg}`;

  return (
    <tr className={isViewer ? "shadow-[inset_0_0_0_1px_#9bb8e8]" : "border-b border-[#eee]"}>
      <td
        className={`${cellBase} pr-2 ${
          isViewer
            ? "border-l-4 border-l-[#2f6fd4] pl-2"
            : "pl-2"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={championIconUrl(player.champion_name)}
            alt=""
            className={`rounded shrink-0 ${isViewer ? "size-9 ring-2 ring-[#4a7fd4]/40" : "size-8"}`}
          />
          <div className="min-w-0">
            <p
              className={`text-sm truncate ${
                isViewer
                  ? "font-semibold text-[#1a3d6e]"
                  : "font-medium text-[#1e1e1e]"
              }`}
            >
              {player.riot_id ?? player.champion_name}
            </p>
            <p className="text-xs text-[#757575]">{player.position}</p>
          </div>
        </div>
      </td>
      <td
        className={`${cellBase} text-sm text-center tabular-nums ${
          isViewer ? "font-semibold text-[#1a3d6e]" : ""
        }`}
      >
        {player.kills}/{player.deaths}/{player.assists}
      </td>
      <td
        className={`${cellBase} text-sm text-right tabular-nums ${
          isViewer ? "font-medium text-[#2a4a6e]" : "text-[#757575]"
        }`}
      >
        {player.cs}
      </td>
      <td
        className={`${cellBase} text-sm text-right tabular-nums hidden sm:table-cell ${
          isViewer ? "font-medium text-[#2a4a6e]" : "text-[#757575]"
        }`}
      >
        {formatNumber(player.gold_earned)}
      </td>
      <td
        className={`${cellBase} text-sm text-right tabular-nums hidden md:table-cell ${
          isViewer ? "font-medium text-[#2a4a6e]" : "text-[#757575]"
        }`}
      >
        {formatNumber(player.damage_to_champions)}
      </td>
      <td
        className={`${cellBase} text-sm text-right tabular-nums hidden lg:table-cell ${
          isViewer ? "font-medium text-[#2a4a6e]" : "text-[#757575]"
        }`}
      >
        {player.vision_score}
      </td>
      <td className={`${cellBase} pl-2 pr-2`}>
        <div className="flex items-center gap-0.5 justify-end flex-wrap max-w-[140px]">
          {player.summoner_spells.map((spellId) => {
            const url = summonerSpellIconUrl(spellId);
            return url ? (
              <img
                key={`spell-${spellId}`}
                src={url}
                alt=""
                className="size-5 rounded"
              />
            ) : (
              <span
                key={`spell-${spellId}`}
                className="size-5 rounded bg-[#eee] text-[8px] flex items-center justify-center"
              >
                {spellId}
              </span>
            );
          })}
          {player.items.map((itemId, i) => {
            const url = itemIconUrl(itemId);
            if (!url) {
              return (
                <span
                  key={`item-empty-${i}`}
                  className="size-6 rounded bg-[#f0f0f0] border border-[#ddd]"
                />
              );
            }
            return (
              <img
                key={`item-${itemId}-${i}`}
                src={url}
                alt=""
                className="size-6 rounded"
              />
            );
          })}
        </div>
      </td>
    </tr>
  );
}

function TeamScoreboard({
  team,
  sideLabel,
}: Readonly<{ team: TeamDetail; sideLabel: string }>) {
  const sideColor = team.team_id === 100 ? "text-[#4a7fd4]" : "text-[#c44a4a]";

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className={`text-sm font-semibold ${sideColor}`}>{sideLabel}</h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            team.win ? "bg-[#e6f4ea] text-[#1e7e34]" : "bg-[#fce8e8] text-[#c44a4a]"
          }`}
        >
          {team.win ? "Victory" : "Defeat"}
        </span>
      </div>
      <div className="overflow-x-auto rounded border border-[#d9d9d9]">
        <table className="w-full text-left min-w-[480px]">
          <thead>
            <tr className="text-xs text-[#757575] border-b border-[#eee] bg-[#fafafa]">
              <th className="py-2 pl-2 font-medium">Player</th>
              <th className="py-2 font-medium text-center">KDA</th>
              <th className="py-2 font-medium text-right">CS</th>
              <th className="py-2 font-medium text-right hidden sm:table-cell">
                Gold
              </th>
              <th className="py-2 font-medium text-right hidden md:table-cell">
                DMG
              </th>
              <th className="py-2 font-medium text-right hidden lg:table-cell">
                Vis
              </th>
              <th className="py-2 pr-2 font-medium text-right">Build</th>
            </tr>
          </thead>
          <tbody>
            {team.participants.map((p) => (
              <ParticipantRow key={p.puuid} player={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ObjectivesRow({ teams }: Readonly<{ teams: readonly TeamDetail[] }>) {
  const labels: { key: keyof TeamDetail["objectives"]; label: string }[] = [
    { key: "dragon", label: "Dragons" },
    { key: "baron", label: "Baron" },
    { key: "rift_herald", label: "Herald" },
    { key: "tower", label: "Towers" },
    { key: "inhibitor", label: "Inhibitors" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {teams.map((team) => (
        <div
          key={team.team_id}
          className="rounded border border-[#d9d9d9] p-3 bg-[#fafafa]"
        >
          <p className="text-xs font-semibold text-[#757575] mb-2">
            {team.team_id === 100 ? "Blue" : "Red"} objectives
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#1e1e1e]">
            {labels.map(({ key, label }) => (
              <li key={key} className="flex justify-between">
                <span className="text-[#757575]">{label}</span>
                <span className="tabular-nums font-medium">
                  {team.objectives[key]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function BansRow({ teams }: Readonly<{ teams: readonly TeamDetail[] }>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {teams.map((team) => (
        <div key={team.team_id}>
          <p className="text-xs font-semibold text-[#757575] mb-2">
            {team.team_id === 100 ? "Blue" : "Red"} bans
          </p>
          <div className="flex flex-wrap gap-1">
            {team.bans.map((ban) => (
              <img
                key={ban.champion_id}
                src={championIconUrl(ban.champion_name)}
                alt={ban.champion_name}
                title={ban.champion_name}
                className="size-8 rounded shrink-0 grayscale opacity-70"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MatchDetailView({
  matchId: matchIdProp,
  sidebarOpen: sidebarOpenProp,
  onBack: onBackProp,
  viewerPuuid,
}: Readonly<MatchDetailViewProps> = {}) {
  const navigate = useNavigate();
  const { matchId: matchIdParam } = useParams<{ matchId: string }>();
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const matchId = matchIdProp ?? matchIdParam ?? "";
  const sidebarOpen = sidebarOpenProp ?? outlet?.sidebarOpen ?? true;
  const onBack =
    onBackProp ?? (() => navigate("/dashboard/matches", { replace: false }));

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentStyle = getDashboardContentStyle(sidebarOpen);

  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMatch(null);

    fetchMatchDetail(matchId, viewerPuuid)
      .then((data) => {
        if (!cancelled) {
          if (!data.teams?.length) {
            setError("Could not load match");
          } else {
            setMatch(data);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load match");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [matchId, viewerPuuid]);

  const viewer = match ? viewerParticipant(match, viewerPuuid) : undefined;
  const resultLabel = viewer
    ? viewer.win
      ? "Victory"
      : "Defeat"
    : null;
  const resultClass = viewer?.win
    ? "text-[#1e7e34]"
    : "text-[#c44a4a]";

  const blueTeam = match?.teams.find((t) => t.team_id === 100);
  const redTeam = match?.teams.find((t) => t.team_id === 200);

  return (
    <div
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 font-['Inter',sans-serif] transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="match-detail-view"
    >
      <div className="relative h-full overflow-auto px-10 py-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to matches"
          className="mb-6 flex cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent p-0 text-[#525252] transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="font-['Inter:Regular',sans-serif] text-[14px] font-normal text-[#1e1e1e]">
            Back to matches
          </span>
        </button>

        <header className="mb-6 border-b border-[#eee] pb-4">
            {loading && (
              <h1 className="text-[#1e1e1e] text-xl font-semibold">Loading match…</h1>
            )}
            {error && (
              <h1 className="text-[#c44a4a] text-xl font-semibold">{error}</h1>
            )}
            {match && viewer && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <img
                    src={championIconUrl(viewer.champion_name)}
                    alt=""
                    className="size-12 rounded"
                  />
                  <div>
                    <h1
                      className={`text-2xl font-semibold ${resultClass}`}
                    >
                      {resultLabel}
                    </h1>
                    <p
                      id="match-detail-desc"
                      className="text-[#757575] text-sm"
                    >
                      {viewer.champion_name} · {viewer.kills}/{viewer.deaths}/
                      {viewer.assists} KDA
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#757575] mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{formatDuration(match.game_duration)}</span>
                  <span>·</span>
                  <span>{match.queue_label}</span>
                  <span>·</span>
                  <span>{match.map_label}</span>
                  <span>·</span>
                  <span>v{match.game_version}</span>
                  <span>·</span>
                  <span>{formatGameDate(match.game_creation)}</span>
                </p>
              </>
            )}
            {match && !viewer && (
              <h1 className="text-[#1e1e1e] text-xl font-semibold">Match details</h1>
            )}
        </header>

        <div className="flex flex-col gap-6">
          {loading && <LoadingSkeleton />}
          {error && !loading && (
            <p className="text-sm text-[#757575]">
              Try again later or pick another match from your matches.
            </p>
          )}
          {match && blueTeam && redTeam && !loading && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamScoreboard team={blueTeam} sideLabel="Blue Team" />
                <TeamScoreboard team={redTeam} sideLabel="Red Team" />
              </div>
              <section>
                <h2 className="text-sm font-semibold text-[#1e1e1e] mb-3">
                  Objectives
                </h2>
                <ObjectivesRow teams={match.teams} />
              </section>
              <section>
                <h2 className="text-sm font-semibold text-[#1e1e1e] mb-3">
                  Bans
                </h2>
                <BansRow teams={match.teams} />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
