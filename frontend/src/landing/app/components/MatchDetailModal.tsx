import { useEffect, useState } from "react";
import { fetchMatchDetail } from "../api/match";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MatchDetailModalProps {
  readonly matchId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
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
  return (
    <tr
      className={
        player.is_viewer
          ? "bg-[#f5f8ff] border-l-2 border-l-[#4a7fd4]"
          : "border-b border-[#eee]"
      }
    >
      <td className="py-2 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={championIconUrl(player.champion_name)}
            alt=""
            className="size-8 rounded shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1e1e1e] truncate">
              {player.riot_id ?? player.champion_name}
            </p>
            <p className="text-xs text-[#757575]">{player.position}</p>
          </div>
        </div>
      </td>
      <td className="py-2 text-sm text-center tabular-nums">
        {player.kills}/{player.deaths}/{player.assists}
      </td>
      <td className="py-2 text-sm text-right tabular-nums text-[#757575]">
        {player.cs}
      </td>
      <td className="py-2 text-sm text-right tabular-nums text-[#757575] hidden sm:table-cell">
        {formatNumber(player.gold_earned)}
      </td>
      <td className="py-2 text-sm text-right tabular-nums text-[#757575] hidden md:table-cell">
        {formatNumber(player.damage_to_champions)}
      </td>
      <td className="py-2 text-sm text-right tabular-nums text-[#757575] hidden lg:table-cell">
        {player.vision_score}
      </td>
      <td className="py-2 pl-2">
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
            {team.bans.map((champId) => (
              <span
                key={champId}
                className="text-xs px-2 py-1 rounded bg-[#eee] text-[#1e1e1e]"
                title={`Champion ${champId}`}
              >
                #{champId}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MatchDetailModal({
  matchId,
  open,
  onOpenChange,
  viewerPuuid,
}: Readonly<MatchDetailModalProps>) {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !matchId) {
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
  }, [open, matchId, viewerPuuid]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-4xl font-['Inter',sans-serif] bg-white border-[#d9d9d9] text-[#1e1e1e] p-0 gap-0"
        aria-describedby={match ? "match-detail-desc" : undefined}
      >
        <div className="p-6 pb-4 border-b border-[#eee] sticky top-0 bg-white z-10">
          <DialogHeader className="text-left gap-1">
            {loading && (
              <DialogTitle className="text-[#1e1e1e]">Loading match…</DialogTitle>
            )}
            {error && (
              <DialogTitle className="text-[#c44a4a]">{error}</DialogTitle>
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
                    <DialogTitle
                      className={`text-2xl font-semibold ${resultClass}`}
                    >
                      {resultLabel}
                    </DialogTitle>
                    <DialogDescription
                      id="match-detail-desc"
                      className="text-[#757575] text-sm"
                    >
                      {viewer.champion_name} · {viewer.kills}/{viewer.deaths}/
                      {viewer.assists} KDA
                    </DialogDescription>
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
              <DialogTitle className="text-[#1e1e1e]">Match details</DialogTitle>
            )}
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 flex flex-col gap-6">
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
                <h4 className="text-sm font-semibold text-[#1e1e1e] mb-3">
                  Objectives
                </h4>
                <ObjectivesRow teams={match.teams} />
              </section>
              <section>
                <h4 className="text-sm font-semibold text-[#1e1e1e] mb-3">
                  Bans
                </h4>
                <BansRow teams={match.teams} />
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
