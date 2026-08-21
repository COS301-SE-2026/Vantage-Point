import type { ReactNode } from "react";
import { bootsItemIcon } from "../assets/images/metrics";
import { itemIconUrl } from "../lib/ddragon";

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
  /** The ability in this slot, named — "Q · Switcheroo!" rather than "SkillSlot_1". */
  readonly skillLabel: string;
  readonly skillValue: string;
  /** The item in this slot, named — "Infinity Edge" rather than "Item_1". */
  readonly itemLabel: string;
  readonly itemId: number;
  readonly objectiveLabel: string;
  readonly objectiveValue: string;
}

interface MapAnalysisTableProps {
  readonly rows: readonly MapAnalysisRow[];
}

const HEADINGS = [
  "Team Stats",
  "Player Stats",
  "Skills",
  "Last 5 Items",
  "Objectives",
] as const;

const CELL_TEXT = "text-[16px] leading-[1.4] text-vp-ink";

/**
 * Item and ability names run far longer than the "Item_1" placeholders the column
 * was sized for, so a label that will not fit is cut with an ellipsis and carries
 * the whole name as its tooltip rather than pushing the value cell off the row.
 */
function LabelCell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-name="Table Cell"
      className={`flex h-full min-w-0 items-center border-l border-solid border-vp-line pl-[6px] pr-[5px] ${LABEL_CELL_FLEX}`}
    >
      <span
        className={`${CELL_TEXT} truncate`}
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
    </div>
  );
}

function ValueCell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-name="Table Cell"
      /* A little room on the right: the next column's label cell starts at its
         rule, and a long value would otherwise touch the word after it. */
      className={`flex h-full min-w-[51px] items-center justify-center px-[6px] ${VALUE_CELL_FLEX}`}
    >
      <span className={`${CELL_TEXT} tabular-nums`}>{children}</span>
    </div>
  );
}

/** Figma "ItemImage" 32:824 — a 45×45 tile ruled #0056B9 inside the 51px cell. */
function ItemCell({
  itemId,
  itemName,
}: Readonly<{ itemId: number; itemName: string }>) {
  const icon = itemIconUrl(itemId);

  return (
    <div
      data-name="ItemImage"
      className={`flex h-full min-w-[51px] items-center justify-center ${VALUE_CELL_FLEX}`}
    >
      <div
        className="size-[45px] overflow-hidden rounded-[10px] border border-solid border-[#0056b9]"
        title={itemName}
      >
        <img
          src={icon ?? bootsItemIcon}
          /* The name is already spelled out in the label cell beside this, so
             repeating it here would read the slot twice to a screen reader. */
          alt=""
          className={`size-full object-contain ${icon ? "" : "opacity-30"}`}
        />
      </div>
    </div>
  );
}

/**
 * Figma "MapReplayStats" 32:426 — 785×345 panel on #F0F0F0 wrapping the
 * 765×325 "Table Body" (32:512): a 30px header rule then 55px rows on a 2px gap.
 *
 * The transport used to take over the Skills column of the last row, which cost
 * that row its ability. It is its own bar now — see `MapReplayTransport` — so all
 * five slots are on the table.
 */
export default function MapAnalysisTable({
  rows,
}: Readonly<MapAnalysisTableProps>) {
  return (
    <section
      data-name="MapReplayStats"
      data-node-id="32:426"
      className="h-[345px] w-full min-w-0 rounded-[5px] bg-vp-surface p-[10px]"
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
          className="flex h-[30px] shrink-0 border-b border-solid border-vp-line"
          role="row"
        >
          {HEADINGS.map((heading) => (
            <div
              key={heading}
              data-name="Table Cell"
              role="columnheader"
              className="flex h-full min-w-0 flex-[3_1_0%] items-center px-[10px]"
            >
              <span className="whitespace-nowrap text-[16px] font-medium leading-[1.4] text-vp-ink">
                {heading}
              </span>
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div
            key={row.id}
            data-name="ParticipantRow"
            role="row"
            className="flex h-[55px] shrink-0 rounded-[5px] border-b border-solid border-vp-line bg-vp-raised"
          >
            <LabelCell>{row.teamLabel}</LabelCell>
            <ValueCell>{row.teamValue}</ValueCell>
            <LabelCell>{row.playerLabel}</LabelCell>
            <ValueCell>{row.playerValue}</ValueCell>
            <LabelCell>{row.skillLabel}</LabelCell>
            <ValueCell>{row.skillValue}</ValueCell>
            <LabelCell>{row.itemLabel}</LabelCell>
            <ItemCell itemId={row.itemId} itemName={row.itemLabel} />
            <LabelCell>{row.objectiveLabel}</LabelCell>
            <ValueCell>{row.objectiveValue}</ValueCell>
          </div>
        ))}
      </div>
    </section>
  );
}
