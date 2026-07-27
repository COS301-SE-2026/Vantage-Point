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
      className="grid h-[30px] w-[820px] shrink-0 grid-cols-[64px_minmax(0,1fr)_59px_63px_109px_20px] items-center rounded-[8px] bg-white device-dark:bg-[#2c2c2c] px-[8px] shadow-[inset_0_0_0_1px_#d9d9d9] device-dark:shadow-[inset_0_0_0_1px_#2c2c2c]"
    >
      <span
        className={`w-[43px] text-center font-['Beaufort_for_LOL',serif] text-[13px] font-bold leading-[21px] ${
          viewer.win
            ? "text-[#1e7e34] device-dark:text-[#18c840]"
            : "text-[#c44a4a] device-dark:text-[#e03b3b]"
        }`}
      >
        {viewer.win ? "Victory" : "Defeat"}
      </span>
      <span className="truncate font-['Beaufort_for_LOL',serif] text-[12px] font-medium leading-[24px] text-[#1e1e1e] device-dark:text-white">
        {viewer.champion_name}
      </span>
      <span className="font-['Beaufort_for_LOL',serif] text-[12px] uppercase leading-[21px] text-[#1e1e1e] device-dark:text-white">
        {roleShort(viewer.position)}
      </span>
      <span className="font-['Beaufort_for_LOL',serif] text-[12px] font-bold leading-[21px] tabular-nums text-[#1e1e1e] device-dark:text-white">
        {viewer.kills}/{viewer.deaths}/{viewer.assists}
      </span>
      <span className="flex items-center justify-between pr-[2px] font-['Beaufort_for_LOL',serif] text-[12px] leading-[21px] tabular-nums text-[#1e1e1e] device-dark:text-white">
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
