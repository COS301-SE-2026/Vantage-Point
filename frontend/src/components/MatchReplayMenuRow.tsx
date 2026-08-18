import { iconCollapse, iconCollapseDark } from "../assets/images/match-replay";
import type { MatchMenuRowData } from "../lib/matchMenuRow";
import ThemedIcon from "./ThemedIcon";

interface MatchReplayMenuRowProps {
  readonly row: MatchMenuRowData;
  /** Only meaningful with `onToggle`: rotates the chevron and drives aria. */
  readonly expanded?: boolean;
  /** Makes the row the dropdown control for a replay panel below it. */
  readonly onToggle?: () => void;
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
  row,
  expanded = false,
  onToggle,
}: Readonly<MatchReplayMenuRowProps>) {
  const cells = (
    <>
      <span
        className={`w-[43px] text-center text-[13px] font-bold leading-[21px] ${
          row.win ? "text-vp-win" : "text-vp-loss"
        }`}
      >
        {row.win ? "Victory" : "Defeat"}
      </span>
      <span className="truncate text-left text-[12px] font-medium leading-[24px] text-vp-ink">
        {row.championName}
      </span>
      <span className="text-[12px] uppercase leading-[21px] text-vp-ink">
        {roleShort(row.position)}
      </span>
      <span className="text-[12px] font-bold leading-[21px] tabular-nums text-vp-ink">
        {row.kills}/{row.deaths}/{row.assists}
      </span>
      <span className="flex items-center justify-between pr-[2px] text-[12px] leading-[21px] tabular-nums text-vp-ink">
        <span>{row.cs}</span>
        <span>{row.durationMinutes} min</span>
      </span>
      {/* Wrapped so the light/dark pair stays a single grid item. */}
      <span className="flex size-[20px] justify-self-end">
        <ThemedIcon
          light={iconCollapse}
          dark={iconCollapseDark}
          width={20}
          height={20}
          name="Icon"
          className={`transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </span>
    </>
  );

  const layout =
    "grid h-[34px] w-full shrink-0 grid-cols-[64px_minmax(0,1fr)_59px_63px_109px_20px] items-center rounded-lg border border-vp-line bg-vp-surface px-[10px]";

  if (!onToggle) {
    return (
      <div data-name="MatchMenu" data-node-id="22:788" className={layout}>
        {cells}
      </div>
    );
  }

  return (
    <button
      type="button"
      data-name="MatchMenu"
      data-node-id="22:788"
      aria-expanded={expanded}
      aria-label={`${expanded ? "Hide" : "Show"} replay for ${row.championName}`}
      onClick={onToggle}
      className={`${layout} text-left transition-colors hover:border-vp-line-strong hover:bg-vp-raised`}
    >
      {cells}
    </button>
  );
}
