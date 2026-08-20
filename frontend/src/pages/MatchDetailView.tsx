import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { fetchMatchDetail } from "../api/match";
import { itemIconUrl, summonerSpellIconUrl } from "../lib/ddragon";
import {
  buildMapAnalysisTips,
  buildReplayCoachingNotes,
  type ReplayCoachingNote,
} from "../lib/replayCoaching";
import type {
  MatchDetail,
  ParticipantDetail,
  TeamDetail,
} from "../types/match";
import {
  ChampionIcon,
  ErrorNote,
  PageContainer,
  Panel,
  PanelHeader,
  StatTile,
} from "../components/dashboard/primitives";
import { GlowingEffect } from "../components/ui/aceternity/glowing-effect";

interface MatchDetailViewProps {
  readonly matchId?: string;
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

function viewerParticipant(
  match: MatchDetail,
  viewerPuuid?: string,
): ParticipantDetail | undefined {
  for (const team of match.teams) {
    const found = team.participants.find(
      (p) => p.is_viewer || (viewerPuuid && p.puuid === viewerPuuid),
    );
    if (found) return found;
  }
  return undefined;
}

function LoadingSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-hidden>
      <div className="h-16 rounded-xl border border-vp-line bg-vp-surface" />
      <div className="h-20 rounded-xl border border-vp-line bg-vp-surface" />
      <div className="h-72 rounded-xl border border-vp-line bg-vp-surface" />
      <div className="h-72 rounded-xl border border-vp-line bg-vp-surface" />
    </div>
  );
}

function roleLabel(position: string): string {
  const normalized = position.trim().toUpperCase();
  if (!normalized) return "UNKNOWN";
  if (normalized === "SUPPORT" || normalized === "UTILITY") return "UTILITY";
  if (normalized === "BOTTOM" || normalized === "BOT") return "BOTTOM";
  if (normalized === "MIDDLE" || normalized === "MID") return "MIDDLE";
  if (normalized === "JUNGLE" || normalized === "JGL") return "JUNGLE";
  return normalized;
}

function formatGold(n: number): string {
  return `${(n / 1000).toFixed(1)}k`;
}

/** Blue and red keep their in-game sides; everything else is the one accent. */
function teamAccent(teamId: number) {
  return teamId === 100
    ? { text: "text-[#5b9cff]", rule: "bg-[#5b9cff]" }
    : { text: "text-[#e2565c]", rule: "bg-[#e2565c]" };
}

function buildItemSlots(player: ParticipantDetail): (number | null)[] {
  const slots = player.items.slice(0, 7);
  while (slots.length < 7) {
    slots.push(null);
  }
  return slots;
}

/** Six item squares plus the trinket, then the two summoner spells. */
function BuildIcons({ player }: Readonly<{ player: ParticipantDetail }>) {
  const itemSlots = buildItemSlots(player);
  const spellSlots: (number | null)[] = [
    player.summoner_spells[0] ?? null,
    player.summoner_spells[1] ?? null,
  ];

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex flex-col gap-[3px]">
        {spellSlots.map((spellId, idx) => {
          const url = spellId ? summonerSpellIconUrl(spellId) : null;
          return url ? (
            <img
              key={`spell-${player.puuid}-${String(idx)}`}
              src={url}
              alt=""
              className="size-[15px] rounded-[3px] object-cover"
            />
          ) : (
            <span
              key={`spell-empty-${player.puuid}-${String(idx)}`}
              className="size-[15px] rounded-[3px] bg-vp-raised"
            />
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-[3px]">
        {itemSlots.map((itemId, idx) => {
          const url = itemId ? itemIconUrl(itemId) : null;
          return url ? (
            <img
              key={`item-${player.puuid}-${String(idx)}`}
              src={url}
              alt=""
              className="size-[18px] rounded-[3px] object-cover"
            />
          ) : (
            <span
              key={`item-empty-${player.puuid}-${String(idx)}`}
              className="size-[18px] rounded-[3px] border border-vp-line bg-vp-raised/60"
            />
          );
        })}
      </div>
    </div>
  );
}

const NUM_CELL = "px-2 text-right text-[12px] tabular-nums text-vp-dim";
const HEAD_CELL =
  "px-2 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-vp-faint";
const HEAD_NUM = `${HEAD_CELL} text-right`;

function ParticipantRow({ player }: Readonly<{ player: ParticipantDetail }>) {
  const isViewer = player.is_viewer;

  return (
    <tr
      className={`h-12 border-b border-vp-line last:border-b-0 ${
        isViewer ? "bg-vp-gold/[0.07]" : ""
      }`}
    >
      <td className="py-0 pl-3 pr-2">
        <div className="flex items-center gap-2.5">
          {/* The viewer's own line is marked with a gold rule, not a fill —
              the row still reads as part of the same table. */}
          <span
            aria-hidden
            className={`h-8 w-[2px] rounded-full ${isViewer ? "bg-vp-gold" : "bg-transparent"}`}
          />
          <ChampionIcon name={player.champion_name} size={30} />
          <div className="min-w-0">
            <p
              className={`truncate text-[13px] leading-tight ${
                isViewer ? "font-bold text-vp-gold" : "font-medium text-vp-ink"
              }`}
            >
              {player.riot_id ?? `${player.champion_name}#Player`}
            </p>
            <p className="text-[11px] leading-tight text-vp-faint">
              {roleLabel(player.position)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 text-center text-[13px] font-medium tabular-nums text-vp-ink">
        {player.kills}/{player.deaths}/{player.assists}
      </td>
      <td className={NUM_CELL}>{player.cs}</td>
      <td className={NUM_CELL}>{formatGold(player.gold_earned)}</td>
      <td className={NUM_CELL}>{formatGold(player.damage_to_champions)}</td>
      <td className={NUM_CELL}>{player.vision_score}</td>
      <td className="py-0 pl-2 pr-3">
        <BuildIcons player={player} />
      </td>
    </tr>
  );
}

function ObjectiveChips({ team }: Readonly<{ team: TeamDetail }>) {
  const rows = [
    { label: "Dragons", value: team.objectives.dragon },
    { label: "Baron", value: team.objectives.baron },
    { label: "Herald", value: team.objectives.rift_herald },
    { label: "Towers", value: team.objectives.tower },
    { label: "Inhibitors", value: team.objectives.inhibitor },
  ];

  return (
    <section aria-label="Objectives Completed">
      <h3 className="sr-only">Objectives Completed</h3>
      <ul className="flex flex-wrap gap-2 border-t border-vp-line px-3 py-3">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline gap-1.5 rounded-md bg-vp-raised px-2.5 py-1"
          >
            <span className="text-[11px] uppercase tracking-[0.1em] text-vp-faint">
              {row.label}
            </span>
            <span className="text-[13px] font-medium tabular-nums text-vp-ink">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TeamScoreboard({
  team,
  sideLabel,
}: Readonly<{ team: TeamDetail; sideLabel: string }>) {
  const accent = teamAccent(team.team_id);

  return (
    /* The objectives are a sibling <section>, not a child: the e2e suite counts
       sections containing "Objectives Completed" and expects one per team. */
    <div className="min-w-0 overflow-hidden rounded-xl border border-vp-line bg-vp-surface">
      <section>
        <div className="flex items-center gap-3 px-3 py-3">
          <span
            aria-hidden
            className={`h-4 w-[3px] rounded-full ${accent.rule}`}
          />
          <h3 className={`text-[13px] font-bold ${accent.text}`}>
            {sideLabel}
          </h3>
          <span
            className={`ml-auto rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] ${
              team.win
                ? "bg-vp-win/15 text-vp-win"
                : "bg-vp-loss/15 text-vp-loss"
            }`}
          >
            {team.win ? "Victory" : "Defeat"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] table-fixed text-left">
            <colgroup>
              <col />
              <col className="w-[74px]" />
              <col className="w-[52px]" />
              <col className="w-[58px]" />
              <col className="w-[58px]" />
              <col className="w-[46px]" />
              <col className="w-[132px]" />
            </colgroup>
            <thead>
              <tr className="border-y border-vp-line bg-vp-raised/50">
                <th className={`${HEAD_CELL} pl-3 text-left`}>Player</th>
                <th className={`${HEAD_CELL} text-center`}>KDA</th>
                <th className={HEAD_NUM}>CS</th>
                <th className={HEAD_NUM}>Gold</th>
                <th className={HEAD_NUM}>DMG</th>
                <th className={HEAD_NUM}>Vis</th>
                <th className={`${HEAD_NUM} pr-3`}>Build</th>
              </tr>
            </thead>
            <tbody>
              {team.participants.map((p) => (
                <ParticipantRow key={p.puuid} player={p} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ObjectiveChips team={team} />
    </div>
  );
}

function BansSection({ teams }: Readonly<{ teams: readonly TeamDetail[] }>) {
  const bans = teams.flatMap((team) => team.bans);
  if (bans.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
        Bans
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {bans.map((ban, idx) => (
          <span
            key={`${String(ban.champion_id)}-${String(idx)}`}
            title={ban.champion_name}
            className="relative inline-block"
          >
            <ChampionIcon name={ban.champion_name} size={32} />
            {/* Banned, so the portrait is struck through rather than just listed. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded bg-vp-canvas/45"
            />
          </span>
        ))}
      </div>
    </section>
  );
}

/**
 * Reads the same derived notes as the replay panel (lib/replayCoaching) rather
 * than carrying its own copy, so the two screens never disagree about a match.
 */
function MatchInsightsPanel({
  notes,
}: Readonly<{ notes: readonly ReplayCoachingNote[] }>) {
  if (notes.length === 0) return null;

  return (
    <aside
      className="relative w-full shrink-0 xl:w-[300px]"
      aria-label="AI coaching comments"
    >
      <div className="sticky top-20 flex flex-col gap-3">
        <PanelHeader title="What the coach saw" className="pb-1" />
        {notes.map((note) => (
          <div key={note.heading} className="relative rounded-xl">
            <GlowingEffect
              disabled={false}
              glow
              spread={36}
              proximity={64}
              borderWidth={1}
            />
            <Panel className="relative" padded={false}>
              <div className="p-4">
                <h3 className="text-[13px] font-bold text-vp-ink">
                  {note.heading}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-vp-dim">
                  {note.body}
                </p>
              </div>
            </Panel>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function MatchDetailView({
  matchId: matchIdProp,
  onBack: onBackProp,
  viewerPuuid,
}: Readonly<MatchDetailViewProps> = {}) {
  const navigate = useNavigate();
  const { matchId: matchIdParam } = useParams<{ matchId: string }>();
  const matchId = matchIdProp ?? matchIdParam ?? "";
  const onBack =
    onBackProp ?? (() => navigate("/dashboard/matches", { replace: false }));

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    fetchMatchDetail(matchId)
      .then((data) => {
        if (!cancelled) {
          if (!data.teams.length) {
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
  const blueTeam = match?.teams.find((t) => t.team_id === 100);
  const redTeam = match?.teams.find((t) => t.team_id === 200);

  // "Champion choices" / "Player Roles" read the scoreboard; the three tips
  // below them read the viewer's own line. Both come from lib/replayCoaching so
  // this panel stays in step with the replay screen.
  const coachingNotes =
    match && viewer
      ? [
          ...buildReplayCoachingNotes(match, viewer),
          ...buildMapAnalysisTips(match, viewer),
        ]
      : [];

  return (
    <PageContainer>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to matches"
        className="mb-5 flex cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent p-0 text-[13px] text-vp-dim transition-colors hover:text-vp-ink"
      >
        <ArrowLeft className="size-4 shrink-0" strokeWidth={1.9} aria-hidden />
        Back to matches
      </button>

      {loading ? <LoadingSkeleton /> : null}

      {error && !loading ? (
        <div>
          <h1 className="text-[20px] font-semibold text-vp-loss">{error}</h1>
          <p className="mt-2 text-[13px] text-vp-dim">
            Try again later or pick another match from your matches.
          </p>
        </div>
      ) : null}

      {match && !loading ? (
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {viewer ? (
              <header className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <ChampionIcon
                    name={viewer.champion_name}
                    size={52}
                    className="rounded-lg"
                  />
                  <div className="min-w-0">
                    <h1
                      className={`text-[22px] font-bold leading-tight ${
                        viewer.win ? "text-vp-win" : "text-vp-loss"
                      }`}
                    >
                      {viewer.win ? "Victory" : "Defeat"}
                    </h1>
                    <p
                      id="match-detail-desc"
                      className="text-[14px] text-vp-dim"
                    >
                      {viewer.champion_name} · {viewer.kills}/{viewer.deaths}/
                      {viewer.assists} KDA
                    </p>
                  </div>
                </div>

                <ul className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] text-vp-faint">
                  {[
                    formatDuration(match.game_duration),
                    match.queue_label,
                    match.map_label,
                    `v${match.game_version}`,
                    formatGameDate(match.game_creation),
                  ].map((chip, idx) => (
                    <li key={chip} className="flex items-center gap-2">
                      {idx > 0 ? <span aria-hidden>·</span> : null}
                      <span>{chip}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <StatTile
                    label="KDA"
                    value={`${String(viewer.kills)}/${String(viewer.deaths)}/${String(viewer.assists)}`}
                    tone="gold"
                  />
                  <StatTile label="CS" value={viewer.cs} />
                  <StatTile
                    label="Gold"
                    value={formatGold(viewer.gold_earned)}
                  />
                  <StatTile
                    label="Damage"
                    value={formatGold(viewer.damage_to_champions)}
                  />
                  <StatTile label="Vision" value={viewer.vision_score} />
                </div>
              </header>
            ) : (
              <h1 className="text-[20px] font-semibold text-vp-ink">
                Match details
              </h1>
            )}

            {blueTeam ? (
              <TeamScoreboard team={blueTeam} sideLabel="Blue Team" />
            ) : null}
            {redTeam ? (
              <TeamScoreboard team={redTeam} sideLabel="Red Team" />
            ) : null}

            <BansSection teams={match.teams} />
          </div>

          <MatchInsightsPanel notes={coachingNotes} />
        </div>
      ) : null}

      {!matchId && !loading && !error ? (
        <ErrorNote>No match selected.</ErrorNote>
      ) : null}
    </PageContainer>
  );
}
