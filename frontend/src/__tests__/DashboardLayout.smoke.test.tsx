import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import MetricsView from "../pages/MetricsView";
import MatchReplayView from "../pages/MatchReplayView";
import type { MatchDetail, ParticipantDetail } from "../types/match";

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
    items: [3006],
    summoner_spells: [4],
    is_viewer: false,
    ...overrides,
  };
}

const match: MatchDetail = {
  match_id: "EUW1_1",
  game_creation: 1_747_730_580_000,
  game_duration: 1500,
  game_version: "14.24.1",
  queue_id: 420,
  queue_label: "Ranked Solo/Duo",
  map_id: 11,
  map_label: "Summoner's Rift",
  teams: [
    {
      team_id: 100,
      win: false,
      bans: [],
      objectives: {
        baron: 0,
        dragon: 3,
        rift_herald: 1,
        tower: 7,
        inhibitor: 0,
      },
      participants: [
        participant("viewer", { is_viewer: true }),
        participant("mate"),
      ],
    },
    {
      team_id: 200,
      win: true,
      bans: [],
      objectives: {
        baron: 1,
        dragon: 2,
        rift_herald: 0,
        tower: 4,
        inhibitor: 1,
      },
      participants: [participant("enemy", { win: true })],
    },
  ],
};

vi.mock("../api/match", () => ({ fetchMatchDetail: vi.fn(async () => match) }));
vi.mock("../api/matches", () => ({
  fetchMatchHistory: vi.fn(async () => [{ matchId: "EUW1_1" }]),
}));

/**
 * These two pages moved from fixed-width columns to fluid ones; nothing else
 * renders them, so this at least catches a layout refactor that throws.
 */
describe("Fluid dashboard pages still mount", () => {
  it("renders the metrics view with its table and tool rail", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/metrics/EUW1_1"]}>
        <Routes>
          <Route path="/dashboard/metrics/:matchId" element={<MetricsView />} />
        </Routes>
      </MemoryRouter>,
    );

    const table = await screen.findByRole("table");
    expect(table.className).toContain("w-full");
    expect(
      screen.getByRole("complementary", { name: "Match replay tools" }),
    ).toBeDefined();
    expect(
      screen.getByRole("columnheader", { name: "Objectives" }),
    ).toBeDefined();
  });

  it("renders the replay view with a square map that can grow", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/dashboard/replay/EUW1_1"]}>
        <Routes>
          <Route
            path="/dashboard/replay/:matchId"
            element={<MatchReplayView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const map = await screen.findByAltText("Summoner's Rift map");
    const box = map.parentElement;
    expect(box?.className).toContain("aspect-square");
    expect(box?.className).toContain("flex-1");
    // The transport row is anchored to the map's bottom edge, not y=483.
    const controls = container.querySelector(
      '[data-node-id="26:1335"]',
    )?.parentElement;
    expect(controls?.className).toContain("bottom-[9px]");
  });
});
