import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MatchReplayMenuRow from "../components/MatchReplayMenuRow";
import MatchReplayToolbar, {
  type ReplayOverlayAction,
} from "../components/MatchReplayToolbar";
import type { MatchDetail, ParticipantDetail } from "../types/match";

/** The tokens Figma 26:1010 "Match replay" (dark) defines for this screen. */
const TOKENS = {
  panel: "device-dark:bg-[#3a3939]",
  railButton: "device-dark:bg-[#2c2c2c]",
  panelButton: "device-dark:bg-[#2a2a2a]",
  pressed: "device-dark:bg-[#404040]",
  row: "device-dark:bg-[#2a2a2a]",
  rowBorder: "device-dark:border-[#2a2a2a]",
  rowSelected: "device-dark:bg-[#4b5e8b]",
  menuRow: "device-dark:bg-[#2c2c2c]",
};

function participant(
  puuid: string,
  overrides: Partial<ParticipantDetail> = {},
): ParticipantDetail {
  return {
    puuid,
    riot_id: `${puuid}#EUW`,
    champion_id: 222,
    champion_name: "Jinx",
    position: "BOTTOM",
    win: false,
    kills: 4,
    deaths: 8,
    assists: 6,
    cs: 165,
    gold_earned: 11000,
    damage_to_champions: 18000,
    vision_score: 78,
    items: [],
    summoner_spells: [],
    is_viewer: false,
    ...overrides,
  };
}

const viewer = participant("viewer", { is_viewer: true });
const players = [viewer, participant("mate")];

const match: MatchDetail = {
  match_id: "EUW1_1",
  game_creation: 1_747_730_580_000,
  game_duration: 1500,
  game_version: "14.24.1",
  queue_id: 420,
  queue_label: "Ranked Solo/Duo",
  map_id: 11,
  map_label: "Summoner's Rift",
  teams: [],
};

function renderToolbar(
  mode: "collapsed" | "expanded",
  {
    playersOpen = false,
    active = new Set<ReplayOverlayAction>(),
  }: { playersOpen?: boolean; active?: Set<ReplayOverlayAction> } = {},
) {
  return render(
    <MatchReplayToolbar
      mode={mode}
      playersOpen={playersOpen}
      activeActions={active}
      players={players}
      selectedPuuids={new Set([viewer.puuid])}
      onToggleMode={() => {}}
      onActionClick={() => {}}
      onTogglePlayer={() => {}}
    />,
  );
}

describe("Match replay dark mode (Figma 26:1010)", () => {
  it("runs the collapsed rail's buttons a shade above the panel", () => {
    renderToolbar("collapsed");

    const panel = screen.getByRole("complementary", {
      name: "Match replay tools",
    });
    expect(panel.className).toContain(TOKENS.panel);

    const button = screen.getByRole("button", { name: "Expand replay tools" });
    expect(button.className).toContain(TOKENS.railButton);
  });

  it("drops the expanded panel's buttons to #2a2a2a", () => {
    renderToolbar("expanded");

    const button = screen.getByRole("button", {
      name: "Collapse replay tools",
    });
    expect(button.className).toContain(TOKENS.panelButton);
    expect(button.className).not.toContain(TOKENS.railButton);
  });

  it("keeps the pressed state visible on dark", () => {
    renderToolbar("collapsed", { active: new Set(["kills"]) });

    const pressed = screen.getByTitle("Show Kills");
    expect(pressed.getAttribute("aria-pressed")).toBe("true");
    expect(pressed.className).toContain(TOKENS.pressed);

    const rest = screen.getByTitle("Show Deaths");
    expect(rest.className).toContain(TOKENS.railButton);
  });

  it("tints the selected player row #4b5e8b on the #3a3939 list", () => {
    renderToolbar("collapsed", { playersOpen: true });

    const list = screen.getByRole("complementary", { name: "Select players" });
    expect(list.className).toContain(TOKENS.panel);

    const selected = screen.getByRole("button", { name: /viewer#EUW/ });
    expect(selected.className).toContain(TOKENS.rowSelected);
    expect(selected.className).toContain(TOKENS.rowBorder);

    const other = screen.getByRole("button", { name: /mate#EUW/ });
    expect(other.className).toContain(TOKENS.row);
    expect(other.className).not.toContain(TOKENS.rowSelected);
  });

  it("ships a #929292 twin for every tool icon so none vanish on dark", () => {
    const { container } = renderToolbar("expanded");

    const darkIcons = Array.from(container.querySelectorAll("img")).filter(
      (img) => img.className.includes("device-dark:block"),
    );

    // Collapse, Select Players, Show Analysis and Change Map ship two files;
    // the poison/coffin/path artwork is already legible on both surfaces.
    expect(darkIcons).toHaveLength(4);
    for (const img of darkIcons) {
      // Vite may serve the asset as a path or inline it as a data: URI.
      expect(img.getAttribute("src")).toMatch(/-dark\.svg|929292/);
    }
  });

  it("puts the summary row on #2c2c2c with a matching rule", () => {
    const { container } = render(
      <MatchReplayMenuRow match={match} viewer={viewer} />,
    );

    const row = container.firstElementChild;
    expect(row?.className).toContain(TOKENS.menuRow);
    expect(row?.className).toContain(
      "device-dark:shadow-[inset_0_0_0_1px_#2c2c2c]",
    );
    expect(screen.getByText("Defeat").className).toContain(
      "device-dark:text-[#e03b3b]",
    );
  });
});
