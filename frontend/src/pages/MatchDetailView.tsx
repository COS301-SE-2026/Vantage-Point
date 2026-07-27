import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
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

const SCOREBOARD_WIDTH = "w-full min-w-0";
const FONT = "font-['Beaufort_for_LOL',serif]";

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
    <div className="animate-pulse flex flex-col gap-3">
      <div className="h-[73px] w-full rounded bg-[#e3e3e3] device-dark:bg-[#2a2a2a]" />
      <div className="h-[332px] w-full rounded-[8px] bg-[#ececec] device-dark:bg-[#2a2a2a]" />
      <div className="h-[118px] w-full rounded-[4px] bg-[#ececec] device-dark:bg-[#2a2a2a]" />
      <div className="h-[332px] w-full rounded-[8px] bg-[#ececec] device-dark:bg-[#2a2a2a]" />
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

/** Figma 22:209 / 22:482 — the dark badges thin the tint and warm the label. */
function scoreTagClass(win: boolean): string {
  return win
    ? "bg-[rgba(34,197,94,0.45)] text-[#1e7e34] device-dark:bg-[rgba(34,197,94,0.32)] device-dark:text-[#18c840]"
    : "bg-[rgba(255,112,114,0.47)] text-[#c44a4a] device-dark:bg-[rgba(244,67,70,0.28)] device-dark:text-[#c73737]";
}

function teamHeadingClass(teamId: number): string {
  return teamId === 100
    ? "text-[#07f]"
    : "text-[#c44a4a] device-dark:text-[#e03b3b]";
}

function buildItemSlots(player: ParticipantDetail): (number | null)[] {
  const slots = player.items.slice(0, 7);
  while (slots.length < 7) {
    slots.push(null);
  }
  return slots;
}

function BuildIcons({ player }: Readonly<{ player: ParticipantDetail }>) {
  const itemSlots = buildItemSlots(player);
  const spellSlots: (number | null)[] = [
    player.summoner_spells[0] ?? null,
    player.summoner_spells[1] ?? null,
  ];

  return (
    <div className="relative h-[50px] w-[140px]">
      {spellSlots.map((spellId, idx) => {
        const url = spellId ? summonerSpellIconUrl(spellId) : null;
        const left = 20 + idx * 22;
        return url ? (
          <img
            key={`spell-${player.puuid}-${idx}`}
            src={url}
            alt=""
            className="absolute top-[2px] size-5 rounded-[4px] object-cover"
            style={{ left }}
          />
        ) : (
          <span
            key={`spell-empty-${player.puuid}-${idx}`}
            className="absolute top-[2px] size-5 rounded-[4px] bg-[#dadada] device-dark:bg-[#2a2a2a]"
            style={{ left }}
          />
        );
      })}
      {itemSlots.map((itemId, idx) => {
        const url = itemId ? itemIconUrl(itemId) : null;
        const topRow = idx < 3;
        const col = topRow ? idx : idx - 3;
        const left = topRow ? 64 + col * 26 : 38 + col * 26;
        const top = topRow ? 0 : 26;
        return url ? (
          <img
            key={`item-${player.puuid}-${idx}`}
            src={url}
            alt=""
            className="absolute size-6 rounded-[4px] object-cover"
            style={{ left, top }}
          />
        ) : (
          <span
            key={`item-empty-${player.puuid}-${idx}`}
            className="absolute size-6 rounded-[4px] border border-solid border-[#dadada] device-dark:border-[#2c2c2c] bg-[#dadada] device-dark:bg-[#2a2a2a]"
            style={{ left, top }}
          />
        );
      })}
    </div>
  );
}

function ParticipantRow({ player }: Readonly<{ player: ParticipantDetail }>) {
  const isViewer = player.is_viewer;

  return (
    /* Figma 22:502 — dark rows sit straight on the page, only the viewer is tinted. */
    <tr
      className={`h-[55px] border-b border-[#dadada] device-dark:border-[#2c2c2c] ${
        isViewer
          ? "bg-[#dfe9ff] device-dark:bg-[rgba(115,149,229,0.56)] border-l-2 border-l-[#07f]"
          : "bg-white device-dark:bg-transparent"
      }`}
    >
      <td className="px-2 py-0">
        <div className="flex h-[55px] items-center gap-2">
          <img
            src={championIconUrl(player.champion_name)}
            alt=""
            className="size-8 rounded-[4px] object-cover"
          />
          <div className="min-w-0">
            <p
              className={`${FONT} truncate text-[14px] leading-[20px] text-[#1e1e1e] device-dark:text-white ${
                isViewer ? "font-bold" : "font-medium"
              }`}
            >
              {player.riot_id ?? `${player.champion_name}#Player`}
            </p>
            <p
              className={`${FONT} text-[12px] leading-[16px] text-[#676767] device-dark:text-[#929292]`}
            >
              {roleLabel(player.position)}
            </p>
          </div>
        </div>
      </td>
      <td
        className={`${FONT} text-center text-[12px] leading-[55px] text-[#1e1e1e] device-dark:text-white`}
      >
        {player.kills}/{player.deaths}/{player.assists}
      </td>
      <td
        className={`${FONT} text-right text-[12px] font-medium leading-[55px] text-[#676767] device-dark:text-[#929292]`}
      >
        {player.cs}
      </td>
      <td
        className={`${FONT} text-right text-[12px] font-medium leading-[55px] text-[#676767] device-dark:text-[#929292]`}
      >
        {formatGold(player.gold_earned)}
      </td>
      <td
        className={`${FONT} text-right text-[12px] font-medium leading-[55px] text-[#676767] device-dark:text-[#929292]`}
      >
        {formatGold(player.damage_to_champions)}
      </td>
      <td
        className={`${FONT} text-right text-[12px] font-medium leading-[55px] text-[#676767] device-dark:text-[#929292]`}
      >
        {player.vision_score}
      </td>
      <td className="py-0 pr-2">
        <div className="flex h-[55px] items-center justify-end">
          <BuildIcons player={player} />
        </div>
      </td>
    </tr>
  );
}

function TeamScoreboard({
  team,
  sideLabel,
}: Readonly<{ team: TeamDetail; sideLabel: string }>) {
  return (
    <section className={`${SCOREBOARD_WIDTH} min-w-0`}>
      <div className="mb-[7px] flex h-[17px] items-center justify-between">
        <h3
          className={`${FONT} text-[13px] font-bold leading-[20px] ${teamHeadingClass(team.team_id)}`}
        >
          {sideLabel}
        </h3>
        <span
          className={`${FONT} rounded-[4px] px-[6px] py-[2px] text-[13px] leading-[16px] ${scoreTagClass(team.win)}`}
        >
          {team.win ? "Victory" : "Defeat"}
        </span>
      </div>
      <div className="overflow-x-auto rounded-[4px] border border-[#dadada] device-dark:border-[#2c2c2c] bg-white device-dark:bg-[#181818]">
        <table className="w-full min-w-[554px] table-fixed text-left">
          <colgroup>
            <col />
            <col className="w-[52px]" />
            <col className="w-[30px]" />
            <col className="w-[43px]" />
            <col className="w-[43px]" />
            <col className="w-[30px]" />
            <col className="w-[150px]" />
          </colgroup>
          <thead>
            <tr className="h-[32.5px] border-b border-[#dadada] device-dark:border-[#2c2c2c] bg-[#f0f0f0] device-dark:bg-[#3a3939]">
              <th
                className={`${FONT} pl-2 text-[11px] font-medium text-[#676767] device-dark:text-white`}
              >
                Player
              </th>
              <th
                className={`${FONT} text-center text-[11px] font-medium text-[#676767] device-dark:text-white`}
              >
                KDA
              </th>
              <th
                className={`${FONT} text-right text-[11px] font-medium text-[#676767] device-dark:text-white`}
              >
                CS
              </th>
              <th
                className={`${FONT} text-right text-[11px] font-medium text-[#676767] device-dark:text-white`}
              >
                Gold
              </th>
              <th
                className={`${FONT} text-right text-[11px] font-medium text-[#676767] device-dark:text-white`}
              >
                DMG
              </th>
              <th
                className={`${FONT} text-right text-[11px] font-medium text-[#676767] device-dark:text-white`}
              >
                Vis
              </th>
              <th
                className={`${FONT} pr-3 text-right text-[11px] font-medium text-[#676767] device-dark:text-white`}
              >
                Build
              </th>
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
  );
}

function ObjectivesCard({ team }: Readonly<{ team: TeamDetail }>) {
  const rows: ReadonlyArray<{
    label: string;
    value: number;
  }> = [
    { label: "Dragons", value: team.objectives.dragon },
    { label: "Baron", value: team.objectives.baron },
    { label: "Herald", value: team.objectives.rift_herald },
    { label: "Towers", value: team.objectives.tower },
    { label: "Inhibitors", value: team.objectives.inhibitor },
  ];

  return (
    <section
      className={`${SCOREBOARD_WIDTH} rounded-[4px] border border-solid border-[#dadada] device-dark:border-[#2c2c2c] bg-[#f0f0f0] device-dark:bg-[#2a2a2a] px-[13px] pb-px pt-[13px]`}
    >
      <h2
        className={`${FONT} mb-2 text-[15px] font-medium leading-[16px] text-[#1e1e1e] device-dark:text-white`}
      >
        Objectives Completed
      </h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-[4px]">
        {rows.map((row) => (
          <li key={row.label} className="flex h-5 items-center justify-between">
            <span
              className={`${FONT} text-[14px] leading-[20px] text-[#676767] device-dark:text-[#929292]`}
            >
              {row.label}
            </span>
            <span
              className={`${FONT} text-[14px] leading-[20px] tabular-nums text-[#1e1e1e] device-dark:text-white`}
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BansSection({ teams }: Readonly<{ teams: readonly TeamDetail[] }>) {
  const bans = teams.flatMap((team) => team.bans);

  return (
    <section className={`${SCOREBOARD_WIDTH} flex flex-col gap-2`}>
      <h2
        className={`${FONT} text-[15px] font-medium leading-[16px] text-[#1e1e1e] device-dark:text-white`}
      >
        Bans
      </h2>
      <div className="flex flex-wrap gap-[4px]">
        {bans.map((ban, idx) => (
          <span
            key={`${ban.champion_id}-${idx}`}
            title={ban.champion_name}
            className={`${FONT} inline-flex h-6 items-center rounded-[4px] bg-[#f0f0f0] device-dark:bg-[#2c2c2c] px-2 text-[12px] leading-[16px] text-[#1e1e1e] device-dark:text-white`}
          >
            #{ban.champion_id}
          </span>
        ))}
      </div>
    </section>
  );
}

function viewerDisplayName(viewer: ParticipantDetail): string {
  return viewer.riot_id ?? `Summoner#${viewer.champion_name}`;
}

function MatchInsightsPanel({
  viewer,
  teammateHint,
}: Readonly<{
  viewer?: ParticipantDetail;
  teammateHint?: string;
}>) {
  if (!viewer) return null;

  const playerName = viewerDisplayName(viewer);
  const cards = [
    {
      title: "Champion choices",
      body: `${playerName}'s playstyle is better suited to play ${viewer.champion_name}`,
      expanded: true,
    },
    {
      title: "Player Roles",
      body:
        teammateHint ??
        "A teammate was playing more like a Support than a Jungler",
      expanded: true,
    },
    {
      title: "General Tip",
      body:
        viewer.deaths > viewer.kills
          ? "Try to reduce isolated deaths before key objective spawns."
          : "Keep timing recalls around objective windows to convert leads.",
      expanded: true,
    },
  ] as const;

  return (
    // Figma 17:171 — parent panel for AI coaching cards
    <aside
      className="flex h-full min-h-[320px] w-[230px] shrink-0 flex-col self-stretch overflow-hidden rounded-[15px] bg-[#f0f0f0] device-dark:bg-[#3a3939]"
      data-name="Rectangle 5"
      aria-label="AI coaching comments"
    >
      <div
        className="vp-scrollbar flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto px-[15px] py-[12px]"
        data-name="AI Coaching comments"
      >
        {cards.map((card) => (
          <section
            key={card.title}
            data-name="AI Reccomendation"
            className={`relative w-full rounded-[15px] bg-[#dadada] device-dark:bg-[#2a2a2a] ${
              card.expanded
                ? "min-h-[109px] px-3 pb-3 pt-2"
                : "h-[45px] px-3 py-2"
            }`}
          >
            <h3
              className={`${FONT} px-5 text-center text-[16px] font-bold leading-[1.2] text-[#1e1e1e] device-dark:text-white`}
            >
              {card.title}
            </h3>
            <ChevronDown
              className="absolute right-3 top-2 size-[18px] shrink-0 text-[#525252] device-dark:text-white"
              strokeWidth={2}
              aria-hidden
            />
            {card.expanded ? (
              <p
                className={`${FONT} mt-2 text-[13px] leading-[1.35] text-[#525252] device-dark:text-white`}
              >
                {card.body}
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </aside>
  );
}

function matchHeaderResultClass(win: boolean): string {
  return win
    ? "text-[#1e7e34] device-dark:text-[#18c840]"
    : "text-[#c44a4a] device-dark:text-[#e03b3b]";
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

    fetchMatchDetail(matchId)
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
  const resultLabel = viewer ? (viewer.win ? "Victory" : "Defeat") : null;
  const blueTeam = match?.teams.find((t) => t.team_id === 100);
  const redTeam = match?.teams.find((t) => t.team_id === 200);

  const teammateHint = (() => {
    if (!match || !viewer) return undefined;
    const viewerTeam = match.teams.find((t) =>
      t.participants.some((p) => p.puuid === viewer.puuid),
    );
    const mate = viewerTeam?.participants.find(
      (p) => p.puuid !== viewer.puuid && roleLabel(p.position) === "UTILITY",
    );
    if (!mate) return undefined;
    const name = mate.riot_id ?? mate.champion_name;
    return `${name} was playing more like a Support than a Jungler`;
  })();

  return (
    <div
      className={`absolute top-[var(--vp-dashboard-header)] min-w-0 ${FONT} transition-[left,width] duration-300 ease-out`}
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="match-detail-view"
    >
      <div className="relative mx-auto flex h-full w-full max-w-[var(--vp-content-max)] flex-col items-stretch gap-[10px] overflow-hidden px-4 py-2 sm:px-6 xl:flex-row xl:px-8">
        <div className="vp-scrollbar min-w-0 flex-1 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to matches"
            className="mb-4 flex cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent p-0 text-[#525252] device-dark:text-[#929292] transition-opacity hover:opacity-80"
          >
            <ArrowLeft
              className="size-4 shrink-0"
              strokeWidth={2}
              aria-hidden
            />
            <span
              className={`${FONT} text-[13px] font-normal text-[#676767] device-dark:text-[#929292]`}
            >
              Back to matches
            </span>
          </button>

          {loading && <LoadingSkeleton />}
          {error && !loading && (
            <div>
              <h1
                className={`${FONT} text-xl font-semibold text-[#c44a4a] device-dark:text-[#e03b3b]`}
              >
                {error}
              </h1>
              <p className="mt-2 text-sm text-[#757575] device-dark:text-[#929292]">
                Try again later or pick another match from your matches.
              </p>
            </div>
          )}

          {match && !loading && (
            <div className="flex flex-col gap-[6px]">
              {viewer ? (
                <header className="mb-1 w-full border-b border-[#eee] device-dark:border-[#2c2c2c] pb-1">
                  <div className="flex h-[52px] items-start gap-[12px]">
                    <img
                      src={championIconUrl(viewer.champion_name)}
                      alt=""
                      className="mt-[2px] size-12 rounded-[4px] object-cover"
                    />
                    <div className="min-w-0">
                      <h1
                        className={`${FONT} text-[20px] font-bold leading-[32px] ${matchHeaderResultClass(viewer.win)}`}
                      >
                        {resultLabel}
                      </h1>
                      <p
                        id="match-detail-desc"
                        className={`${FONT} text-[15px] leading-[20px] text-[#757575] device-dark:text-[#929292]`}
                      >
                        {viewer.champion_name} · {viewer.kills}/{viewer.deaths}/
                        {viewer.assists} KDA
                      </p>
                    </div>
                  </div>
                  <p
                    className={`${FONT} mt-px flex flex-wrap gap-x-[12px] gap-y-1 text-[12px] leading-[20px] text-[#757575] device-dark:text-[#929292]`}
                  >
                    <span>{formatDuration(match.game_duration)}</span>
                    <span aria-hidden>·</span>
                    <span>{match.queue_label}</span>
                    <span aria-hidden>·</span>
                    <span>{match.map_label}</span>
                    <span aria-hidden>·</span>
                    <span>v{match.game_version}</span>
                    <span aria-hidden>·</span>
                    <span>{formatGameDate(match.game_creation)}</span>
                  </p>
                </header>
              ) : (
                <h1
                  className={`${FONT} text-xl font-semibold text-[#1e1e1e] device-dark:text-white`}
                >
                  Match details
                </h1>
              )}

              {blueTeam ? (
                <>
                  <TeamScoreboard team={blueTeam} sideLabel="Blue Team" />
                  <ObjectivesCard team={blueTeam} />
                </>
              ) : null}

              {redTeam ? (
                <>
                  <TeamScoreboard team={redTeam} sideLabel="Red Team" />
                  <ObjectivesCard team={redTeam} />
                </>
              ) : null}

              <BansSection teams={match.teams} />
            </div>
          )}
        </div>

        {match && !loading ? (
          <MatchInsightsPanel viewer={viewer} teammateHint={teammateHint} />
        ) : null}
      </div>
    </div>
  );
}
