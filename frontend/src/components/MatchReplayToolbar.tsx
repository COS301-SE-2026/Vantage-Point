import {
  iconCoffin,
  iconCollapse,
  iconCollapseDark,
  iconHelpCircle,
  iconHelpCircleDark,
  iconPath,
  iconPerson,
  iconPersonDark,
  iconPoison,
  iconSettings,
  iconSettingsDark,
} from "../assets/images/match-replay";
import { championIconUrl } from "../lib/ddragon";
import type { ParticipantDetail } from "../types/match";
import ThemedIcon from "./ThemedIcon";

export type ReplayToolbarMode = "collapsed" | "expanded";

/**
 * Which way the tools run. The replay screen puts them across the top of the map;
 * the analysis screen keeps the rail down the side of its column, where a full-width
 * bar would take the space its table needs.
 */
export type ReplayToolbarOrientation = "vertical" | "horizontal";

export type ReplayOverlayAction =
  | "kills"
  | "deaths"
  | "path"
  | "suggested-path"
  | "players"
  | "analysis"
  | "map";

interface MatchReplayToolbarProps {
  readonly mode: ReplayToolbarMode;
  readonly playersOpen: boolean;
  readonly activeActions: ReadonlySet<ReplayOverlayAction>;
  readonly players: readonly ParticipantDetail[];
  readonly selectedPuuids: ReadonlySet<string>;
  readonly onToggleMode: () => void;
  readonly onActionClick: (action: ReplayOverlayAction) => void;
  readonly onTogglePlayer: (puuid: string) => void;
  /** Defaults to the vertical rail Figma drew. */
  readonly orientation?: ReplayToolbarOrientation;
}

/**
 * Figma "Collapsed options" 26:860 / "Expanded options" 26:867.
 * Panel 40×311 / 160×313, rounded 5, 30px rows on a 13px rhythm starting 11px in.
 *
 * Figma drew six actions; the height is computed from the row count rather than kept at
 * its measured 311/313 so adding a seventh (Show AI Path) does not spill out of the
 * panel, and so the next one added does not either.
 */
const PANEL_PAD_TOP = 11;
const ROW_GAP = 13;
const ROW_HEIGHT = 30;
/** 311 - 11 top - (7 rows * 30) - (6 gaps * 13) = 12 left under the last row. */
const PANEL_PAD_BOTTOM = 12;

/** Collapse button plus one row per action. */
function panelHeight(rowCount: number): number {
  return (
    PANEL_PAD_TOP +
    rowCount * ROW_HEIGHT +
    (rowCount - 1) * ROW_GAP +
    PANEL_PAD_BOTTOM
  );
}

/**
 * Laid across the top instead, seven actions plus the toggle read better as a row than
 * as a column, and the map gets back the width the rail was taking.
 *
 * Every button is `flex-1` there, so they share the bar's width evenly and stay spread
 * across it at any size rather than bunching at one end. Below the width where the
 * labels fit, the row wraps and each new row divides itself the same way.
 */
const BAR_BUTTON_HEIGHT = 34;
const BAR_PAD_Y = 10;
const BAR_COLUMN_GAP = 12;
const BAR_ROW_GAP = 8;

/** What one row of the bar occupies, for a caller sizing whatever sits under it. */
export const TOOLBAR_BAR_HEIGHT = BAR_BUTTON_HEIGHT + BAR_PAD_Y * 2;

/** Six of the ten player rows, then the list scrolls rather than covering the map. */
const PLAYER_LIST_DROP_HEIGHT = 354;

function roleLabel(position: string): string {
  const normalized = position.trim().toUpperCase();
  if (!normalized) return "UNKNOWN";
  if (normalized === "SUPPORT") return "UTILITY";
  return normalized;
}

type ActionIconKind =
  | "poison"
  | "coffin"
  | "path"
  | "person"
  | "help"
  | "settings";

const ACTIONS: ReadonlyArray<{
  id: ReplayOverlayAction;
  label: string;
  icon: ActionIconKind;
  nodeId: string;
}> = [
  { id: "kills", label: "Show Kills", icon: "poison", nodeId: "26:870" },
  { id: "deaths", label: "Show Deaths", icon: "coffin", nodeId: "26:871" },
  { id: "path", label: "Show Path", icon: "path", nodeId: "26:872" },
  // No Figma node yet: the AI route reuses the Show Path glyph, since it marks the same
  // kind of overlay, and is told apart by its label and by the gold dashes on the map.
  {
    id: "suggested-path",
    label: "Show AI Path",
    icon: "path",
    nodeId: "",
  },
  { id: "players", label: "Select Players", icon: "person", nodeId: "26:879" },
  { id: "analysis", label: "Show Analysis", icon: "help", nodeId: "32:371" },
  { id: "map", label: "Change Map", icon: "settings", nodeId: "46:476" },
];

/**
 * Every action icon sits in a 20×20 slot; the leaf keeps the size Figma exported
 * it at, so the 16px glyphs (help, settings) stay smaller than the 20px ones.
 */
function ActionIcon({ kind }: Readonly<{ kind: ActionIconKind }>) {
  if (kind === "poison") {
    return (
      <img src={iconPoison} alt="" width={20} height={20} data-name="Poison" />
    );
  }
  if (kind === "coffin") {
    return (
      <img
        src={iconCoffin}
        alt=""
        width={20}
        height={20}
        className="mix-blend-difference"
        data-name="Halloween Coffin"
      />
    );
  }
  if (kind === "path") {
    return (
      <img src={iconPath} alt="" width={20} height={20} data-name="Show Path" />
    );
  }
  if (kind === "person") {
    return (
      <ThemedIcon
        light={iconPerson}
        dark={iconPersonDark}
        width={13.3333}
        height={13.3333}
        name="person"
      />
    );
  }
  if (kind === "help") {
    return (
      <ThemedIcon
        light={iconHelpCircle}
        dark={iconHelpCircleDark}
        width={16}
        height={16}
        name="Help circle"
      />
    );
  }
  return (
    <ThemedIcon
      light={iconSettings}
      dark={iconSettingsDark}
      width={16.2667}
      height={16.2667}
      name="Settings"
    />
  );
}

/**
 * Figma 26:918 — Table Cell, 190×55, rounded 10, #DADADA (selected #DFE9FF);
 * on the dark page (26:1088 / 26:1104) that reads #2a2a2a, selected #4b5e8b.
 */
function PlayerRow({
  player,
  selected,
  onToggle,
}: Readonly<{
  player: ParticipantDetail;
  selected: boolean;
  onToggle: (puuid: string) => void;
}>) {
  return (
    <button
      type="button"
      onClick={() => onToggle(player.puuid)}
      aria-pressed={selected}
      data-name="Table Cell"
      className={`flex h-[55px] w-[190px] cursor-pointer items-center justify-center gap-[4px] rounded-[10px] border border-solid border-vp-line p-px text-left transition-colors ${
        selected ? "bg-vp-gold/15" : "bg-vp-raised hover:bg-vp-raised"
      }`}
    >
      <img
        src={championIconUrl(player.champion_name)}
        alt=""
        className="size-[32px] shrink-0 rounded-[4px] object-cover"
        data-name="Image"
      />
      <span className="h-[36px] w-[130.317px] shrink-0" data-name="Container">
        <span className="block h-[20px] overflow-hidden truncate text-[14px] font-medium leading-[20px] text-vp-ink">
          {player.riot_id ?? player.champion_name}
        </span>
        <span className="block h-[16px] text-[12px] font-medium leading-[16px] text-vp-dim">
          {roleLabel(player.position)}
        </span>
      </span>
    </button>
  );
}

export default function MatchReplayToolbar({
  mode,
  playersOpen,
  activeActions,
  players,
  selectedPuuids,
  onToggleMode,
  onActionClick,
  onTogglePlayer,
  orientation = "vertical",
}: Readonly<MatchReplayToolbarProps>) {
  const expanded = mode === "expanded";
  const horizontal = orientation === "horizontal";

  /**
   * Across the bar the label decides the floor — wide enough to read at 12px when it is
   * shown, a comfortable target around the 20px glyph when it is not — and `flex-1`
   * grows every button from there so they divide the width between them. Down the rail
   * the widths are fixed, because there is no spare width to divide.
   */
  const buttonClass = horizontal
    ? `flex-1 justify-center ${
        expanded
          ? "min-w-[128px] gap-[7px] px-[12px]"
          : // Capped, or a lone 20px glyph floats in a button the width of a label and
            // the row reads as unfinished. The leftover goes between them instead.
            "min-w-[44px] max-w-[56px]"
      }`
    : `shrink-0 ${
        expanded
          ? "w-[120px] justify-start gap-[7px] pl-[8px]"
          : "w-[30px] justify-center"
      }`;
  const buttonHeight = horizontal ? BAR_BUTTON_HEIGHT : ROW_HEIGHT;

  /** Figma 55:799 vs 55:628 — the collapsed rail's buttons run one shade lighter. */
  const restClass = "bg-vp-raised";
  /** The dark page has no pressed state, so the active step is ours to pick. */
  const pressedClass = horizontal ? "bg-vp-gold/15" : "bg-vp-raised";

  const railHeight = panelHeight(ACTIONS.length + 1);

  return (
    <div
      className={
        horizontal ? "relative w-full" : "relative flex shrink-0 items-start"
      }
    >
      <aside
        data-name={expanded ? "Expanded options" : "Collapsed options"}
        data-node-id={expanded ? "26:867" : "26:860"}
        className={
          horizontal
            ? "flex w-full flex-wrap items-center justify-between rounded-[5px] bg-vp-surface px-[16px]"
            : `flex flex-col rounded-[5px] bg-vp-surface transition-[width,height] duration-300 ease-out ${
                expanded
                  ? "w-[160px] items-start px-[20px]"
                  : "w-[40px] items-center px-[5px]"
              }`
        }
        style={
          horizontal
            ? {
                paddingTop: BAR_PAD_Y,
                paddingBottom: BAR_PAD_Y,
                columnGap: BAR_COLUMN_GAP,
                rowGap: BAR_ROW_GAP,
              }
            : { height: railHeight, paddingTop: PANEL_PAD_TOP, rowGap: ROW_GAP }
        }
        aria-label="Match replay tools"
      >
        <button
          type="button"
          onClick={onToggleMode}
          className={`flex cursor-pointer items-center rounded-[10px] border-0 ${restClass} p-0 transition-colors hover:bg-vp-line ${buttonClass}`}
          style={{ height: buttonHeight }}
          aria-label={
            expanded ? "Collapse replay tools" : "Expand replay tools"
          }
          aria-expanded={expanded}
          data-node-id={expanded ? "26:869" : "25:809"}
        >
          <span className="flex size-[20px] shrink-0 items-center justify-center">
            <ThemedIcon
              light={iconCollapse}
              dark={iconCollapseDark}
              width={20}
              height={20}
              className={
                horizontal
                  ? expanded
                    ? "rotate-90"
                    : "-rotate-90"
                  : expanded
                    ? "-rotate-90"
                    : "rotate-90"
              }
              name="Icon"
            />
          </span>
          {expanded ? (
            <span className="text-[12px] font-medium leading-[1.4] text-vp-ink">
              Collapse
            </span>
          ) : null}
        </button>

        {ACTIONS.map((action) => {
          const pressed =
            activeActions.has(action.id) ||
            (action.id === "players" && playersOpen);
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onActionClick(action.id)}
              aria-pressed={pressed}
              title={action.label}
              data-node-id={action.nodeId}
              className={`flex cursor-pointer items-center rounded-[10px] border-0 p-0 transition-colors ${buttonClass} ${
                pressed ? pressedClass : `${restClass} hover:bg-vp-line`
              }`}
              style={{ height: buttonHeight }}
            >
              <span className="flex size-[20px] shrink-0 items-center justify-center">
                <ActionIcon kind={action.icon} />
              </span>
              {expanded ? (
                <span className="whitespace-nowrap text-[12px] font-medium leading-[1.4] text-vp-ink">
                  {action.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </aside>

      {playersOpen ? (
        /* Figma "Player list" 26:1007 — floats beside the rail, over the map. From a top
           bar it drops out of the bar's left edge instead; anchoring it to the bar
           rather than to the button keeps it put when the row wraps. */
        <aside
          data-name="Player list"
          data-node-id="26:1007"
          className={`absolute z-10 flex w-[204px] flex-col gap-[4px] rounded-[5px] bg-vp-surface px-[7px] pt-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.12)] ${
            horizontal ? "left-0 top-full mt-[8px]" : "top-0"
          }`}
          style={
            horizontal
              ? { height: PLAYER_LIST_DROP_HEIGHT }
              : { height: railHeight - 1, left: expanded ? 168 : 48 }
          }
          aria-label="Select players"
        >
          <ul className="flex flex-col gap-[4px] overflow-y-auto pb-[11px]">
            {players.map((player) => (
              <li key={player.puuid}>
                <PlayerRow
                  player={player}
                  selected={selectedPuuids.has(player.puuid)}
                  onToggle={onTogglePlayer}
                />
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
