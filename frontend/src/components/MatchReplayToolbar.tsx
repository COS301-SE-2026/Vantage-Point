import {
  iconCoffin,
  iconCollapse,
  iconHelpCircle,
  iconPath,
  iconPerson,
  iconPoison,
  iconSettings,
} from "../assets/images/match-replay";
import { championIconUrl } from "../lib/ddragon";
import type { ParticipantDetail } from "../types/match";

export type ReplayToolbarMode = "collapsed" | "expanded";

export type ReplayOverlayAction =
  | "kills"
  | "deaths"
  | "path"
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
}

/**
 * Figma "Collapsed options" 26:860 / "Expanded options" 26:867.
 * Panel 40×311 / 160×313, rounded 5, 30px rows on a 13px rhythm starting 11px in.
 */
const PANEL_PAD_TOP = 11;
const ROW_GAP = 13;

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
      <img
        src={iconPerson}
        alt=""
        width={13.3333}
        height={13.3333}
        data-name="person"
      />
    );
  }
  if (kind === "help") {
    return (
      <img
        src={iconHelpCircle}
        alt=""
        width={16}
        height={16}
        data-name="Help circle"
      />
    );
  }
  return (
    <img
      src={iconSettings}
      alt=""
      width={16.2667}
      height={16.2667}
      data-name="Settings"
    />
  );
}

/** Figma 26:918 — Table Cell, 190×55, rounded 10, #DADADA (selected #DFE9FF). */
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
      className={`flex h-[55px] w-[190px] cursor-pointer items-center justify-center gap-[4px] rounded-[10px] border border-solid border-[#dadada] p-px text-left transition-colors ${
        selected ? "bg-[#dfe9ff]" : "bg-[#dadada] hover:bg-[#d0d0d0]"
      }`}
    >
      <img
        src={championIconUrl(player.champion_name)}
        alt=""
        className="size-[32px] shrink-0 rounded-[4px] object-cover"
        data-name="Image"
      />
      <span className="h-[36px] w-[130.317px] shrink-0" data-name="Container">
        <span className="block h-[20px] overflow-hidden truncate font-['Beaufort_for_LOL',serif] text-[14px] font-medium leading-[20px] text-[#1e1e1e]">
          {player.riot_id ?? player.champion_name}
        </span>
        <span className="block h-[16px] font-['Beaufort_for_LOL',serif] text-[12px] font-medium leading-[16px] text-[#676767]">
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
}: Readonly<MatchReplayToolbarProps>) {
  const expanded = mode === "expanded";

  // Expanded rows indent 8px, then a 20px icon slot, then the label at 35px.
  const rowClass = expanded
    ? "w-[120px] justify-start gap-[7px] pl-[8px]"
    : "w-[30px] justify-center";

  return (
    <div className="relative flex shrink-0 items-start">
      <aside
        data-name={expanded ? "Expanded options" : "Collapsed options"}
        data-node-id={expanded ? "26:867" : "26:860"}
        className={`flex flex-col rounded-[5px] bg-[#f0f0f0] transition-[width,height] duration-300 ease-out ${
          expanded
            ? "h-[313px] w-[160px] items-start px-[20px]"
            : "h-[311px] w-[40px] items-center px-[5px]"
        }`}
        style={{ paddingTop: PANEL_PAD_TOP, rowGap: ROW_GAP }}
        aria-label="Match replay tools"
      >
        <button
          type="button"
          onClick={onToggleMode}
          className={`flex h-[30px] shrink-0 cursor-pointer items-center rounded-[10px] border-0 bg-[#dadada] p-0 transition-colors hover:bg-[#d0d0d0] ${rowClass}`}
          aria-label={expanded ? "Collapse replay tools" : "Expand replay tools"}
          aria-expanded={expanded}
          data-node-id={expanded ? "26:869" : "25:809"}
        >
          <span className="flex size-[20px] shrink-0 items-center justify-center">
            <img
              src={iconCollapse}
              alt=""
              width={20}
              height={20}
              className={expanded ? "-rotate-90" : "rotate-90"}
              data-name="Icon"
            />
          </span>
          {expanded ? (
            <span className="font-['Beaufort_for_LOL',serif] text-[12px] font-medium leading-[1.4] text-[#1e1e1e]">
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
              className={`flex h-[30px] shrink-0 cursor-pointer items-center rounded-[10px] border-0 p-0 transition-colors ${rowClass} ${
                pressed ? "bg-[#c4c4c4]" : "bg-[#dadada] hover:bg-[#d0d0d0]"
              }`}
            >
              <span className="flex size-[20px] shrink-0 items-center justify-center">
                <ActionIcon kind={action.icon} />
              </span>
              {expanded ? (
                <span className="whitespace-nowrap font-['Beaufort_for_LOL',serif] text-[12px] font-medium leading-[1.4] text-[#1e1e1e]">
                  {action.label}
                </span>
              ) : null}
            </button>
          );
        })}
      </aside>

      {playersOpen ? (
        /* Figma "Player list" 26:1007 — floats beside the options panel, over the map. */
        <aside
          data-name="Player list"
          data-node-id="26:1007"
          className="absolute top-0 z-10 flex h-[312px] w-[204px] flex-col gap-[4px] rounded-[5px] bg-[#f0f0f0] px-[7px] pt-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          style={{ left: expanded ? 168 : 48 }}
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
