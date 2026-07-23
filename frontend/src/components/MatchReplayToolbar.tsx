import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Settings,
  UserRound,
} from "lucide-react";
import iconPoison from "../assets/images/match-replay/icon-poison.png";
import iconCoffin from "../assets/images/match-replay/icon-coffin.png";
import iconPath from "../assets/images/match-replay/icon-path.png";
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
  /** Figma replay uses 15px; metrics collapsed panel (46:488) uses 5px */
  readonly panelRadiusPx?: 5 | 15;
}

function roleLabel(position: string): string {
  const normalized = position.trim().toUpperCase();
  if (!normalized) return "UNKNOWN";
  if (normalized === "SUPPORT") return "UTILITY";
  return normalized;
}

const ACTIONS: ReadonlyArray<{
  id: ReplayOverlayAction;
  label: string;
  icon: "poison" | "coffin" | "path" | "person" | "help" | "settings";
}> = [
  { id: "kills", label: "Show Kills", icon: "poison" },
  { id: "deaths", label: "Show Deaths", icon: "coffin" },
  { id: "path", label: "Show Path", icon: "path" },
  { id: "players", label: "Select Players", icon: "person" },
  { id: "analysis", label: "Show Analysis", icon: "help" },
  { id: "map", label: "Change Map", icon: "settings" },
];

function ActionIcon({
  kind,
}: Readonly<{ kind: (typeof ACTIONS)[number]["icon"] }>) {
  if (kind === "poison") {
    return (
      <img
        src={iconPoison}
        alt=""
        className="size-5 object-contain"
        data-name="Poison"
      />
    );
  }
  if (kind === "coffin") {
    return (
      <img
        src={iconCoffin}
        alt=""
        className="size-5 object-contain"
        data-name="Halloween Coffin"
      />
    );
  }
  if (kind === "path") {
    return (
      <img
        src={iconPath}
        alt=""
        className="size-5 object-contain"
        data-name="Show Path"
      />
    );
  }
  if (kind === "person") {
    return <UserRound className="size-5 text-[#1d1b20]" strokeWidth={2} />;
  }
  if (kind === "help") {
    return <CircleHelp className="size-4 text-[#1d1b20]" strokeWidth={2} />;
  }
  return <Settings className="size-4 text-[#1d1b20]" strokeWidth={2} />;
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
  panelRadiusPx = 15,
}: Readonly<MatchReplayToolbarProps>) {
  const expanded = mode === "expanded";
  const radiusClass =
    panelRadiusPx === 5 ? "rounded-[5px]" : "rounded-[15px]";

  return (
    <div className="flex h-full shrink-0 items-start gap-2">
      <aside
        data-name={expanded ? "Expanded options" : "Collapsed options"}
        data-node-id={expanded ? undefined : "46:488"}
        className={`flex flex-col items-center bg-[#f0f0f0] transition-[width] duration-300 ease-out ${radiusClass} ${
          expanded
            ? "w-[160px] px-[20px] py-[11px]"
            : "w-[40px] px-[5px] py-[11px]"
        }`}
        style={{ height: expanded ? 313 : 311 }}
        aria-label="Match replay tools"
      >
        <button
          type="button"
          onClick={onToggleMode}
          className={`mb-[13px] flex h-[30px] cursor-pointer items-center rounded-[10px] border-0 bg-[#dadada] p-0 text-[#1e1e1e] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-opacity hover:opacity-85 ${
            expanded
              ? "w-[120px] justify-start gap-2 pl-2"
              : "w-[30px] justify-center"
          }`}
          aria-label={expanded ? "Collapse replay tools" : "Expand replay tools"}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronLeft className="size-5 shrink-0" strokeWidth={2} />
              <span className="font-['Inter',sans-serif] text-[12px] font-medium">
                Collapse
              </span>
            </>
          ) : (
            <ChevronRight className="size-5" strokeWidth={2} />
          )}
        </button>

        <div className="flex w-full flex-col gap-[13px]">
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
                className={`flex h-[30px] cursor-pointer items-center rounded-[10px] border-0 p-0 shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-colors ${
                  expanded
                    ? "w-[120px] justify-start gap-2 pl-2"
                    : "w-[30px] justify-center"
                } ${
                  pressed
                    ? "bg-[#cfcfcf] text-[#1e1e1e]"
                    : "bg-[#dadada] text-[#1e1e1e] hover:bg-[#d0d0d0]"
                }`}
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <ActionIcon kind={action.icon} />
                </span>
                {expanded ? (
                  <span className="truncate font-['Inter',sans-serif] text-[12px] font-medium">
                    {action.label}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      {playersOpen ? (
        <aside
          data-name="Player list"
          className="flex h-[312px] w-[204px] shrink-0 flex-col overflow-hidden rounded-[15px] bg-[#f0f0f0] px-[7px] py-[10px]"
          aria-label="Select players"
        >
          <ul className="flex flex-col gap-1 overflow-y-auto">
            {players.map((player) => {
              const selected = selectedPuuids.has(player.puuid);
              return (
                <li key={player.puuid}>
                  <button
                    type="button"
                    onClick={() => onTogglePlayer(player.puuid)}
                    aria-pressed={selected}
                    className={`flex h-[55px] w-[190px] cursor-pointer items-center gap-2 rounded-[8px] border-0 px-3 text-left transition-colors ${
                      selected
                        ? "bg-[#dfe9ff]"
                        : "bg-[#dadada] hover:bg-[#d0d0d0]"
                    }`}
                  >
                    <img
                      src={championIconUrl(player.champion_name)}
                      alt=""
                      className="size-8 rounded-[4px] object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-['Inter',sans-serif] text-[14px] font-medium leading-5 text-[#1e1e1e]">
                        {player.riot_id ?? `${player.champion_name}#Player`}
                      </span>
                      <span className="block font-['Inter',sans-serif] text-[12px] leading-4 text-[#676767]">
                        {roleLabel(player.position)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
