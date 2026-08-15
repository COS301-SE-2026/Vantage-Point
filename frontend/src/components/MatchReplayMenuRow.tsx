import { iconCollapse, iconCollapseDark } from "../assets/images/match-replay";
import type { MatchDetail, ParticipantDetail } from "../types/match";
import ThemedIcon from "./ThemedIcon";

interface MatchReplayMenuRowProps {
  readonly match: MatchDetail;
  readonly viewer: ParticipantDetail;
}

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

/**
 * Figma "MatchMenu" 22:804 / "MatchHistoryListRow" 22:788 — 820×30 summary row.
 * Columns land on the Figma x offsets 8 / 72 / 561 / 620 / 683 / 792, with CS and
 * duration sharing the last wide cell (duration right-aligned to x790).
 *
 * The 1px rule is an inset shadow rather than a border: a border would come out
 * of the 820px content box and pull every column 2px left of its Figma offset.
 */
export default function MatchReplayMenuRow({
  match,
  viewer,
}: Readonly<MatchReplayMenuRowProps>) {
  return (
    <div
      data-name="MatchMenu"
      data-node-id="22:788"
      className="grid h-[34px] w-full shrink-0 grid-cols-[64px_minmax(0,1fr)_59px_63px_109px_20px] items-center rounded-lg border border-vp-line bg-vp-surface px-[10px]"
    >
      <span
        className={`w-[43px] text-center text-[13px] font-bold leading-[21px] ${
          viewer.win ? "text-vp-win" : "text-vp-loss"
        }`}
      >
        {viewer.win ? "Victory" : "Defeat"}
      </span>
      <span className="truncate text-[12px] font-medium leading-[24px] text-vp-ink">
        {viewer.champion_name}
      </span>
      <span className="text-[12px] uppercase leading-[21px] text-vp-ink">
        {roleShort(viewer.position)}
      </span>
      <span className="text-[12px] font-bold leading-[21px] tabular-nums text-vp-ink">
        {viewer.kills}/{viewer.deaths}/{viewer.assists}
      </span>
      <span className="flex items-center justify-between pr-[2px] text-[12px] leading-[21px] tabular-nums text-vp-ink">
        <span>{viewer.cs}</span>
        <span>{formatDurationMinutes(match.game_duration)}</span>
      </span>
      {/* Wrapped so the light/dark pair stays a single grid item. */}
      <span className="flex size-[20px] justify-self-end">
        <ThemedIcon
          light={iconCollapse}
          dark={iconCollapseDark}
          width={20}
          height={20}
          name="Icon"
        />
      </span>
    </div>
  );
}
