import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import MatchReplayView from "../pages/MatchReplayView";
import MetricsView from "../pages/MetricsView";
import type { MatchDetail, ParticipantDetail } from "../types/match";
import type {
  MatchTimeline,
  TimelineParticipantFrame,
} from "../types/timeline";

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
  game_duration: 1200,
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

function frame(
  puuid: string,
  x: number,
  y: number,
  overrides: Partial<TimelineParticipantFrame> = {},
): TimelineParticipantFrame {
  return {
    puuid,
    position: { x, y },
    level: 9,
    damage_to_champions: 5000,
    xp: 8000,
    cs: 120,
    current_gold: 400,
    total_gold: 8000,
    health: 1400,
    health_max: 1600,
    armor: 70,
    magic_resist: 45,
    attack_damage: 110,
    ability_power: 0,
    movement_speed: 380,
    ...overrides,
  };
}

const timeline: MatchTimeline = {
  match_id: "EUW1_1",
  frame_interval_ms: 60_000,
  game_duration_ms: 1_200_000,
  map_id: 11,
  map_bounds: { min_x: 0, min_y: 0, max_x: 14870, max_y: 14980 },
  participants: [{ puuid: "viewer", distance_travelled: 50_000 }],
  frames: [
    {
      timestamp_ms: 0,
      // The mate's numbers differ from the viewer's so the team column (an average
      // or a sum) is distinguishable from the player column in the assertions below.
      participants: [
        frame("viewer", 1000, 1000),
        frame("mate", 2000, 2000, {
          armor: 60,
          movement_speed: 340,
          health: 1000,
          health_max: 1200,
        }),
        frame("enemy", 13000, 13000),
      ],
    },
    {
      timestamp_ms: 600_000,
      participants: [
        frame("viewer", 7000, 7000, { level: 12, health: 1800, armor: 85 }),
        frame("mate", 8000, 8000, { level: 11, health: 1500, armor: 75 }),
        frame("enemy", 9000, 9000),
      ],
    },
  ],
  events: [
    {
      timestamp_ms: 120_000,
      type: "CHAMPION_KILL",
      position: { x: 5000, y: 5000 },
      actor_puuid: "viewer",
      victim_puuid: "enemy",
      assist_puuids: [],
      team_id: null,
      item_id: null,
      skill_slot: null,
      level: null,
      monster_type: null,
      building_type: null,
      lane_type: null,
      ward_type: null,
    },
    {
      timestamp_ms: 180_000,
      type: "SKILL_LEVEL_UP",
      position: null,
      actor_puuid: "viewer",
      victim_puuid: null,
      assist_puuids: [],
      team_id: null,
      item_id: null,
      skill_slot: 1,
      level: null,
      monster_type: null,
      building_type: null,
      lane_type: null,
      ward_type: null,
    },
    {
      timestamp_ms: 200_000,
      type: "ITEM_PURCHASED",
      position: null,
      actor_puuid: "viewer",
      victim_puuid: null,
      assist_puuids: [],
      team_id: null,
      item_id: 3031,
      skill_slot: null,
      level: null,
      monster_type: null,
      building_type: null,
      lane_type: null,
      ward_type: null,
    },
  ],
};

vi.mock("../api/match", () => ({ fetchMatchDetail: vi.fn(async () => match) }));
vi.mock("../api/matches", () => ({
  fetchMatchHistory: vi.fn(async () => [{ matchId: "EUW1_1" }]),
}));
vi.mock("../api/timeline", () => ({
  fetchMatchTimeline: vi.fn(async () => timeline),
}));
vi.mock("../api/user", () => ({
  fetchLiveMetrics: vi.fn(async () => {
    throw new Error("not part of this test");
  }),
}));

function renderReplay() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/replay/EUW1_1"]}>
      <Routes>
        <Route
          path="/dashboard/replay/:matchId"
          element={<MatchReplayView />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Replay map reads the match timeline", () => {
  it("draws a champion marker for the tracked player once the timeline loads", async () => {
    const { container } = renderReplay();

    await waitFor(() => {
      expect(
        container.querySelector('[data-name="replay-overlay"]'),
      ).not.toBeNull();
    });

    // The viewer is selected by default, so exactly one champion marker is drawn.
    const overlay = container.querySelector('[data-name="replay-overlay"]');
    expect(overlay?.querySelectorAll("img").length).toBe(1);
  });

  it("starts the clock at kick-off rather than at the final whistle", async () => {
    renderReplay();
    expect(await screen.findByText("0:00")).toBeDefined();
  });

  it("scrubbing moves the clock to that point in the match", async () => {
    renderReplay();
    await screen.findByText("0:00");

    const scrub = screen.getByLabelText("Replay progress");
    fireEvent.change(scrub, { target: { value: "50" } });

    // Half of a 20-minute game.
    expect(await screen.findByText("10:00")).toBeDefined();
  });

  it("only plots kills once the overlay is switched on", async () => {
    const { container } = renderReplay();
    await waitFor(() => {
      expect(
        container.querySelector('[data-name="replay-overlay"]'),
      ).not.toBeNull();
    });

    const overlayMarkers = () =>
      container.querySelectorAll('[data-name="replay-overlay"] > span').length;
    const before = overlayMarkers();

    // Move past the kill at 2:00, then enable "Show Kills".
    fireEvent.change(screen.getByLabelText("Replay progress"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByTitle("Show Kills"));

    await waitFor(() => expect(overlayMarkers()).toBe(before + 1));
  });
});

describe("Map analysis table reads the timeline frame at the clock", () => {
  it("fills the rows that the scoreboard alone cannot supply", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/metrics/EUW1_1"]}>
        <Routes>
          <Route path="/dashboard/metrics/:matchId" element={<MetricsView />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole("table");

    // Frame 0: the viewer's own state, where the scoreboard alone gave "—".
    await waitFor(() => {
      expect(screen.getByText("1,400/1,600")).toBeDefined();
    });
    expect(screen.getByText("70")).toBeDefined(); // player armour
    expect(screen.getByText("380")).toBeDefined(); // player movement speed

    // Team column: health sums, armour and movement speed average.
    expect(screen.getByText("2,400")).toBeDefined();
    expect(screen.getByText("65")).toBeDefined();
    expect(screen.getByText("360")).toBeDefined();
  });
});

describe("Show Analysis is the way into the metrics view", () => {
  it("opens the metrics view for the match being replayed", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/replay/EUW1_1"]}>
        <Routes>
          <Route
            path="/dashboard/replay/:matchId"
            element={<MatchReplayView />}
          />
          <Route
            path="/dashboard/metrics/:matchId"
            element={<div>metrics for EUW1_1</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    // The button only toggled an unused overlay flag before the sidebar entry went.
    fireEvent.click(await screen.findByTitle("Show Analysis"));

    expect(await screen.findByText("metrics for EUW1_1")).toBeDefined();
  });
});
