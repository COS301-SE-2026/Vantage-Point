import type { ReactNode } from "react";
import {
  bootsItemIcon,
  iconPause,
  iconPlay,
  iconRewind,
} from "../assets/images/metrics";
import { itemIconUrl } from "../lib/ddragon";

/**
 * A cell pair inside one 153px column — Figma "ParticipantRow" 32:669:
 * a 102px label cell ruled on its left edge, then a 51px value cell.
 */
const LABEL_CELL_WIDTH = 102;
const VALUE_CELL_WIDTH = 51;

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
  "font-['Beaufort_for_LOL',serif] text-[16px] leading-[1.4] text-[#1e1e1e]";

function LabelCell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-name="Table Cell"
      className="flex h-full shrink-0 items-center border-l border-solid border-[#f0f0f0] pl-[6px] pr-[5px]"
      style={{ width: LABEL_CELL_WIDTH }}
    >
      <span className={CELL_TEXT}>{children}</span>
    </div>
  );
}

function ValueCell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-name="Table Cell"
      className="flex h-full shrink-0 items-center justify-center"
      style={{ width: VALUE_CELL_WIDTH }}
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
      className="flex h-full shrink-0 items-center justify-center"
      style={{ width: VALUE_CELL_WIDTH }}
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
      className="flex h-[54px] w-[153px] shrink-0 items-center justify-center gap-[8px] border-l border-solid border-[#f0f0f0] bg-[#b7b7b7] pl-[6px] pr-[5px]"
    >
      <button
        type="button"
        onClick={onTogglePlaying}
        aria-label={playing ? "Pause replay" : "Play replay"}
        className="flex size-[30px] cursor-pointer items-center justify-center border-0 bg-transparent p-0"
      >
        <img
          src={playing ? iconPause : iconPlay}
          alt=""
          width={19.1}
          height={24.1}
        />
      </button>
      <span className="font-['Beaufort_for_LOL',serif] text-[24px] leading-[1.4] tabular-nums text-[#1e1e1e]">
        {clock}
      </span>
      <button
        type="button"
        onClick={onRewind}
        aria-label="Rewind replay"
        className="flex size-[30px] cursor-pointer items-center justify-center border-0 bg-transparent p-0"
      >
        <img src={iconRewind} alt="" width={26.6} height={19.1} />
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
      className="h-[345px] w-[785px] shrink-0 rounded-[5px] bg-[#f0f0f0] p-[10px]"
    >
      <div
        data-name="Table Body"
        data-node-id="32:512"
        className="flex h-[325px] w-[765px] flex-col gap-[2px]"
        role="table"
      >
        <div
          data-name="HeaderRow"
          data-node-id="32:693"
          className="flex h-[30px] shrink-0 border-b border-solid border-[#dadada]"
          role="row"
        >
          {HEADINGS.map((heading) => (
            <div
              key={heading}
              data-name="Table Cell"
              role="columnheader"
              className="flex h-full w-[153px] shrink-0 items-center px-[10px]"
            >
              <span className="whitespace-nowrap font-['Beaufort_for_LOL',serif] text-[16px] font-medium leading-[1.4] text-[#1e1e1e]">
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
              className="flex h-[55px] shrink-0 rounded-[5px] border-b border-solid border-[#dadada] bg-[#ddd]"
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
