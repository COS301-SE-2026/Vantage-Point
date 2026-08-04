import type { ReactNode } from "react";
import {
  bootsItemIcon,
  iconPause,
  iconPauseWhite,
  iconPlay,
  iconPlayWhite,
  iconRewind,
  iconRewindWhite,
} from "../assets/images/metrics";
import { itemIconUrl } from "../lib/ddragon";
import ThemedIcon from "./ThemedIcon";

/**
 * A cell pair inside one column — Figma "ParticipantRow" 32:669: a 102px label
 * cell ruled on its left edge, then a 51px value cell. Kept as a 2:1 flex ratio
 * so the five columns share whatever width the region gives them.
 */
const LABEL_CELL_FLEX = "flex-[2_1_0%]";
const VALUE_CELL_FLEX = "flex-[1_1_0%]";

/** Rendered when the backend has no field behind a designed row. */
export const NO_VALUE = "—";

export interface MapAnalysisRow {
  readonly id: string;
  readonly teamLabel: string;
  readonly teamValue: string;
  readonly playerLabel: string;
  readonly playerValue: string;
  readonly skillLabel: string;
  readonly skillValue: string;
  readonly itemLabel: string;
  readonly itemId: number;
  readonly objectiveLabel: string;
  readonly objectiveValue: string;
}

interface MapAnalysisTableProps {
  readonly rows: readonly MapAnalysisRow[];
  readonly clock: string;
  readonly playing: boolean;
  readonly onTogglePlaying: () => void;
  readonly onRewind: () => void;
}

const HEADINGS = [
  "Team Stats",
  "Player Stats",
  "Skills",
  "Last 5 Items",
  "Objectives",
] as const;

const CELL_TEXT =
  "font-['Beaufort_for_LOL',serif] text-[16px] leading-[1.4] text-[#1e1e1e] device-dark:text-white";

function LabelCell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-name="Table Cell"
      className={`flex h-full min-w-0 items-center border-l border-solid border-[#f0f0f0] device-dark:border-[#3a3939] pl-[6px] pr-[5px] ${LABEL_CELL_FLEX}`}
    >
      <span className={CELL_TEXT}>{children}</span>
    </div>
  );
}

function ValueCell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-name="Table Cell"
      className={`flex h-full min-w-[51px] items-center justify-center ${VALUE_CELL_FLEX}`}
    >
      <span className={`${CELL_TEXT} tabular-nums`}>{children}</span>
    </div>
  );
}

/** Figma "ItemImage" 32:824 — a 45×45 tile ruled #0056B9 inside the 51px cell. */
function ItemCell({ itemId }: Readonly<{ itemId: number }>) {
  return (
    <div
      data-name="ItemImage"
      className={`flex h-full min-w-[51px] items-center justify-center ${VALUE_CELL_FLEX}`}
    >
      <div className="size-[45px] overflow-hidden rounded-[10px] border border-solid border-[#0056b9]">
        <img
          src={itemIconUrl(itemId) ?? bootsItemIcon}
          alt=""
          className="size-full object-contain"
          data-name="Poison"
        />
      </div>
    </div>
  );
}

/**
 * Figma "Table Cell" 32:822 — the Skills column of the last row becomes the
 * replay transport: 153×54 on #B7B7B7 with an 8px gap around a 24px clock.
 */
function TransportCell({
  clock,
  playing,
  onTogglePlaying,
  onRewind,
}: Readonly<{
  clock: string;
  playing: boolean;
  onTogglePlaying: () => void;
  onRewind: () => void;
}>) {
  return (
    <div
      data-name="Table Cell"
      data-node-id="32:822"
      className="flex h-[54px] min-w-[153px] flex-[3_1_0%] items-center justify-center gap-[8px] border-l border-solid border-[#f0f0f0] device-dark:border-[#3a3939] bg-[#b7b7b7] device-dark:bg-[#404040] pl-[6px] pr-[5px]"
    >
      <button
        type="button"
        onClick={onTogglePlaying}
        aria-label={playing ? "Pause replay" : "Play replay"}
        className="flex size-[30px] cursor-pointer items-center justify-center border-0 bg-transparent p-0"
      >
        <ThemedIcon
          light={playing ? iconPause : iconPlay}
          dark={playing ? iconPauseWhite : iconPlayWhite}
          width={19.1}
          height={24.1}
        />
      </button>
      <span className="font-['Beaufort_for_LOL',serif] text-[24px] leading-[1.4] tabular-nums text-[#1e1e1e] device-dark:text-white">
        {clock}
      </span>
      <button
        type="button"
        onClick={onRewind}
        aria-label="Rewind replay"
        className="flex size-[30px] cursor-pointer items-center justify-center border-0 bg-transparent p-0"
      >
        <ThemedIcon
          light={iconRewind}
          dark={iconRewindWhite}
          width={26.6}
          height={19.1}
        />
      </button>
    </div>
  );
}

/**
 * Figma "MapReplayStats" 32:426 — 785×345 panel on #F0F0F0 wrapping the
 * 765×325 "Table Body" (32:512): a 30px header rule then 55px rows on a 2px gap.
 */
export default function MapAnalysisTable({
  rows,
  clock,
  playing,
  onTogglePlaying,
  onRewind,
}: Readonly<MapAnalysisTableProps>) {
  return (
    <section
      data-name="MapReplayStats"
      data-node-id="32:426"
      className="h-[345px] w-full min-w-0 rounded-[5px] bg-[#f0f0f0] device-dark:bg-[#3a3939] p-[10px]"
    >
      <div
        data-name="Table Body"
        data-node-id="32:512"
        className="flex h-[325px] w-full flex-col gap-[2px]"
        role="table"
      >
        <div
          data-name="HeaderRow"
          data-node-id="32:693"
          className="flex h-[30px] shrink-0 border-b border-solid border-[#dadada] device-dark:border-[#2c2c2c]"
          role="row"
        >
          {HEADINGS.map((heading) => (
            <div
              key={heading}
              data-name="Table Cell"
              role="columnheader"
              className="flex h-full min-w-0 flex-[3_1_0%] items-center px-[10px]"
            >
              <span className="whitespace-nowrap font-['Beaufort_for_LOL',serif] text-[16px] font-medium leading-[1.4] text-[#1e1e1e] device-dark:text-white">
                {heading}
              </span>
            </div>
          ))}
        </div>

        {rows.map((row, index) => {
          const isTransportRow = index === rows.length - 1;
          return (
            <div
              key={row.id}
              data-name="ParticipantRow"
              role="row"
              className="flex h-[55px] shrink-0 rounded-[5px] border-b border-solid border-[#dadada] device-dark:border-[#2c2c2c] bg-[#ddd] device-dark:bg-[#2a2a2a]"
            >
              <LabelCell>{row.teamLabel}</LabelCell>
              <ValueCell>{row.teamValue}</ValueCell>
              <LabelCell>{row.playerLabel}</LabelCell>
              <ValueCell>{row.playerValue}</ValueCell>
              {isTransportRow ? (
                <TransportCell
                  clock={clock}
                  playing={playing}
                  onTogglePlaying={onTogglePlaying}
                  onRewind={onRewind}
                />
              ) : (
                <>
                  <LabelCell>{row.skillLabel}</LabelCell>
                  <ValueCell>{row.skillValue}</ValueCell>
                </>
              )}
              <LabelCell>{row.itemLabel}</LabelCell>
              <ItemCell itemId={row.itemId} />
              <LabelCell>{row.objectiveLabel}</LabelCell>
              <ValueCell>{row.objectiveValue}</ValueCell>
            </div>
          );
        })}
      </div>
    </section>
  );
}
