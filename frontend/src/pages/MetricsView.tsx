import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Play, Rewind } from "lucide-react";
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
import { itemIconUrl } from "../lib/ddragon";
import mapMini from "../assets/images/metrics/map-mini-export.png";
import bootsItemIcon from "../assets/images/metrics/boots-item.png";
import type {
  MatchDetail,
  ParticipantDetail,
  TeamDetail,
} from "../types/match";

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

function TipCard({
  title,
  body,
}: Readonly<{ title: string; body: string }>) {
  return (
    <section
      data-name="AI Reccomendation"
      className="relative h-[158px] w-[150px] shrink-0 rounded-[15px] bg-[#dadada] px-3 pb-3 pt-2"
    >
      <div className="flex items-start justify-between gap-1">
        <h3 className="font-['Inter',sans-serif] text-[14px] font-semibold leading-[1.2] text-[#1e1e1e]">
          {title}
        </h3>
        <ChevronDown
          className="mt-0.5 size-[18px] shrink-0 text-[#525252]"
          strokeWidth={2}
          aria-hidden
        />
      </div>
      <p className="mt-2 font-['Inter',sans-serif] text-[12px] leading-[1.35] text-[#525252]">
        {body}
      </p>
    </section>
  );
}

/** Label (102) + value (51) pair inside a 153px table column — Figma 32:512 */
function MetricPair({
  label,
  value,
  multiline = false,
}: Readonly<{
  label: string;
  value: string | number;
  multiline?: boolean;
}>) {
  return (
    <div className="relative flex h-[55px] w-[153px] shrink-0">
      <div className="flex w-[102px] items-center border-l border-solid border-[#f0f0f0] pl-[6px] pr-[5px]">
        {multiline ? (
          <span className="font-['Inter',sans-serif] text-[16px] leading-[1.4] text-[#1e1e1e]">
            {label.split(" ").map((part) => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
          </span>
        ) : (
          <span className="font-['Inter',sans-serif] text-[16px] leading-[1.4] whitespace-nowrap text-[#1e1e1e]">
            {label}
          </span>
        )}
      </div>
      <div className="flex w-[51px] items-center justify-center">
        <span className="font-['Inter',sans-serif] text-[16px] leading-[1.4] tabular-nums text-[#1e1e1e]">
          {value}
        </span>
      </div>
    </div>
  );
}

function ItemPair({
  label,
  itemId,
}: Readonly<{ label: string; itemId: number }>) {
  const src = itemIconUrl(itemId) ?? bootsItemIcon;
  return (
    <div className="relative flex h-[55px] w-[153px] shrink-0">
      <div className="flex w-[102px] items-center border-l border-solid border-[#f0f0f0] pl-[6px] pr-[5px]">
        <span className="font-['Inter',sans-serif] text-[16px] leading-[1.4] text-[#1e1e1e]">
          {label}
        </span>
      </div>
      <div className="flex w-[51px] items-center justify-center">
        <div className="relative size-[45px] overflow-hidden rounded-[10px] border border-solid border-[#0056b9]">
          <img
            src={src}
            alt=""
            className="size-full object-contain"
            data-name="Poison"
          />
        </div>
      </div>
    </div>
  );
}

function SkillsTransport({
  clock,
}: Readonly<{ clock: string }>) {
  return (
    <div
      data-name="Table Cell"
      className="flex h-[54px] w-[153px] shrink-0 items-center justify-center gap-2 border-l border-solid border-[#f0f0f0] bg-[#b7b7b7] pl-[6px] pr-[5px]"
    >
      <button
        type="button"
        aria-label="Play"
        className="flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#525252]"
      >
        <Play className="size-5" fill="currentColor" />
      </button>
      <span className="font-['Inter',sans-serif] text-[24px] leading-[1.4] tabular-nums text-[#1e1e1e]">
        {clock}
      </span>
      <button
        type="button"
        aria-label="Rewind"
        className="flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#525252]"
      >
        <Rewind className="size-5" fill="currentColor" />
      </button>
    </div>
  );
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

  const itemSlots = useMemo(() => {
    const slots = [...(viewer?.items ?? [])].slice(0, 5);
    while (slots.length < 5) slots.push(0);
    return slots;
  }, [viewer]);

  const tipBody =
    viewer != null
      ? `${viewer.riot_id ?? viewer.champion_name}'s profile shows room to tighten objective timing.`
      : "[Insert vague but useful tip here]";

  return (
    <div
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 font-['Inter',sans-serif] transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="metrics-view"
    >
      <div className="relative flex h-full gap-3 overflow-hidden px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-[16px] text-[#757575]">Loading metrics…</p>
          ) : null}
          {error ? (
            <p className="text-[16px] text-[#c44a4a]">{error}</p>
          ) : null}

          {match && !loading ? (
            <div
              data-name="MapAnalysisView"
              className="flex w-full max-w-[835px] flex-col gap-[18px]"
            >
              <div className="flex flex-wrap items-start gap-[36px]">
                <img
                  src={mapMini}
                  alt="Map mini"
                  data-name="map_mini"
                  className="size-[180px] shrink-0 rounded-[8px] object-cover"
                />

                <aside
                  data-name="AI Coaching bar"
                  className="flex h-[180px] w-full max-w-[569px] items-center gap-[38px] overflow-x-auto rounded-[5px] border border-solid border-[#dadada] bg-[#f0f0f0] px-[22px]"
                >
                  <TipCard title="General Tip" body={tipBody} />
                  <TipCard
                    title="Skill recommendation"
                    body="Prioritize leveling your primary damage skill earlier in this matchup."
                  />
                  <TipCard
                    title="Item recommendation"
                    body="Look for boots earlier so you can rotate to mid-game objectives."
                  />
                </aside>
              </div>

              <section
                data-name="Table Body"
                data-node-id="32:512"
                className="flex w-[765px] max-w-full flex-col items-center gap-[2px] overflow-hidden rounded-[10px] pb-[5px]"
              >
                <div
                  data-name="HeaderRow"
                  className="relative flex h-[30px] w-full max-w-[765px] shrink-0 border-b border-solid border-[#dadada]"
                >
                  {(
                    [
                      "Team Stats",
                      "Player Stats",
                      "Skills",
                      "Last 5 Items",
                      "Objectives",
                    ] as const
                  ).map((heading) => (
                    <div
                      key={heading}
                      data-name="Table Cell"
                      className="flex h-[30px] w-[153px] shrink-0 items-center px-[10px]"
                    >
                      <span className="font-['Inter',sans-serif] text-[16px] font-medium leading-[1.4] whitespace-nowrap text-[#1e1e1e]">
                        {heading}
                      </span>
                    </div>
                  ))}
                </div>

                {(
                  [
                    {
                      teamLabel: "Health",
                      teamValue: 50,
                      playerLabel: "Health",
                      playerValue: Math.max(
                        1,
                        100 - (viewer?.deaths ?? 0) * 8,
                      ),
                      skill: "SkillSlot_1",
                      skillLevel: "Lvl 1",
                      itemLabel: "Item_1",
                      itemId: itemSlots[0] ?? 0,
                      objLabel: "Towers",
                      objValue: team?.objectives.tower ?? 0,
                      multiline: false,
                    },
                    {
                      teamLabel: "Damage",
                      teamValue: 50,
                      playerLabel: "Damage",
                      playerValue: 50,
                      skill: "SkillSlot_2",
                      skillLevel: "Lvl 1",
                      itemLabel: "Item_2",
                      itemId: itemSlots[1] ?? 0,
                      objLabel: "Dragons",
                      objValue: team?.objectives.dragon ?? 0,
                      multiline: false,
                    },
                    {
                      teamLabel: "Armor",
                      teamValue: 50,
                      playerLabel: "Armor",
                      playerValue: 50,
                      skill: "SkillSlot_3",
                      skillLevel: "Lvl 1",
                      itemLabel: "Item_3",
                      itemId: itemSlots[2] ?? 0,
                      objLabel: "Baron",
                      objValue: team?.objectives.baron ?? 0,
                      multiline: false,
                    },
                    {
                      teamLabel: "Movement Speed",
                      teamValue: 50,
                      playerLabel: "Movement Speed",
                      playerValue: 50,
                      skill: "SkillSlot_4",
                      skillLevel: "Lvl 1",
                      itemLabel: "Item_4",
                      itemId: itemSlots[3] ?? 0,
                      objLabel: "Inhibitor",
                      objValue: team?.objectives.inhibitor ?? 0,
                      multiline: true,
                    },
                  ] as const
                ).map((row) => (
                  <div
                    key={row.teamLabel}
                    data-name="ParticipantRow"
                    className="relative flex h-[55px] w-full max-w-[765px] shrink-0 rounded-[5px] border-b border-solid border-[#dadada] bg-[#ddd]"
                  >
                    <MetricPair
                      label={row.teamLabel}
                      value={row.teamValue}
                      multiline={row.multiline}
                    />
                    <MetricPair
                      label={row.playerLabel}
                      value={row.playerValue}
                      multiline={row.multiline}
                    />
                    <MetricPair label={row.skill} value={row.skillLevel} />
                    <ItemPair label={row.itemLabel} itemId={row.itemId} />
                    <MetricPair label={row.objLabel} value={row.objValue} />
                  </div>
                ))}

                <div
                  data-name="ParticipantRow"
                  className="relative flex h-[55px] w-full max-w-[765px] shrink-0 rounded-[5px] border-b border-solid border-[#dadada] bg-[#ddd]"
                >
                  <MetricPair label="Level" value={50} />
                  <MetricPair label="Level" value={50} />
                  <SkillsTransport clock={formatClock(match.game_duration)} />
                  <ItemPair label="Item_5" itemId={itemSlots[4] ?? 0} />
                  <MetricPair
                    label="Rift Herald"
                    value={
                      (team?.objectives.rift_herald ?? 0) > 0 ? "Killed" : "0"
                    }
                  />
                </div>
              </section>
            </div>
          ) : null}
        </div>

        {match && !loading ? (
          <MatchReplayToolbar
            mode={toolbarMode}
            playersOpen={playersOpen}
            activeActions={activeActions}
            players={players}
            selectedPuuids={selectedPuuids}
            panelRadiusPx={5}
            onToggleMode={() => {
              setToolbarMode((mode) => {
                if (mode === "expanded") {
                  setPlayersOpen(false);
                  return "collapsed";
                }
                return "expanded";
              });
            }}
            onActionClick={(action) => {
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
            }}
            onTogglePlayer={(puuid) => {
              setSelectedPuuids((prev) => {
                const next = new Set(prev);
                if (next.has(puuid)) next.delete(puuid);
                else next.add(puuid);
                return next;
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
