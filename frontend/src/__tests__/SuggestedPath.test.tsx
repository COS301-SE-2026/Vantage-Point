import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import MatchReplayMapOverlay from "../components/MatchReplayMapOverlay";
import { suggestedPathUpTo } from "../lib/suggestedPath";
import { suggestedPathUrl } from "../api/suggestedPath";
import type { ParticipantDetail } from "../types/match";
import type { MatchTimeline } from "../types/timeline";
import type { SuggestedPath } from "../types/suggestedPath";

vi.mock("../lib/ddragon", () => ({
  championIconUrl: () => "champion.png",
}));

function participantFrame(puuid: string, x: number, y: number) {
  return {
    puuid,
    position: { x, y },
    level: 6,
    damage_to_champions: 1000,
    xp: 3000,
    cs: 50,
    current_gold: 200,
    total_gold: 3000,
    health: 900,
    health_max: 1000,
    armor: 40,
    magic_resist: 30,
    attack_damage: 80,
    ability_power: 0,
    movement_speed: 340,
  };
}

const timeline: MatchTimeline = {
  match_id: "EUW1_1",
  frame_interval_ms: 60_000,
  game_duration_ms: 180_000,
  map_id: 11,
  map_bounds: { min_x: 0, min_y: 0, max_x: 14870, max_y: 14980 },
  participants: [{ puuid: "viewer", distance_travelled: 10_000 }],
  frames: [
    { timestamp_ms: 0, participants: [participantFrame("viewer", 1000, 1000)] },
    {
      timestamp_ms: 60_000,
      participants: [participantFrame("viewer", 5000, 5000)],
    },
    {
      timestamp_ms: 120_000,
      participants: [participantFrame("viewer", 9000, 9000)],
    },
  ],
  events: [],
};

const players: ParticipantDetail[] = [
  {
    puuid: "viewer",
    riot_id: "Viewer#EUW",
    champion_id: 222,
    champion_name: "Jinx",
    position: "BOTTOM",
    win: true,
    kills: 5,
    deaths: 2,
    assists: 7,
    cs: 180,
    gold_earned: 12000,
    damage_to_champions: 20000,
    vision_score: 30,
    items: [],
    summoner_spells: [4],
    is_viewer: true,
  },
];

const toggles = {
  kills: false,
  deaths: false,
  path: false,
  suggestedPath: true,
};

function renderOverlay(
  suggestedPath: Parameters<typeof MatchReplayMapOverlay>[0]["suggestedPath"],
  overlayToggles = toggles,
) {
  return render(
    <MatchReplayMapOverlay
      timeline={timeline}
      players={players}
      teamIdByPuuid={new Map([["viewer", 100]])}
      selectedPuuids={new Set(["viewer"])}
      elapsedMs={180_000}
      toggles={overlayToggles}
      suggestedPath={suggestedPath}
    />,
  );
}

/** What `/api/v1/matches/{id}/suggested-path` answers for the timeline above. */
const modelPath: SuggestedPath = {
  match_id: "EUW1_1",
  puuid: "viewer",
  points: [
    // The model seeds its route with the player's own starting position.
    { timestamp_ms: 0, position: { x: 1000, y: 1000 } },
    { timestamp_ms: 60_000, position: { x: 4200, y: 5800 } },
    { timestamp_ms: 120_000, position: { x: 8100, y: 9600 } },
  ],
};

describe("suggested path contract", () => {
  it("addresses the route the backend serves", () => {
    expect(suggestedPathUrl("EUW1_1", "viewer")).toBe(
      "/api/v1/matches/EUW1_1/suggested-path?puuid=viewer",
    );
  });

  it("escapes match ids and puuids into the query", () => {
    expect(suggestedPathUrl("EUW1/1", "a b")).toBe(
      "/api/v1/matches/EUW1%2F1/suggested-path?puuid=a%20b",
    );
  });

  it("clips the recommended route to the replay clock", () => {
    expect(suggestedPathUpTo(modelPath, 60_000)).toHaveLength(2);
    expect(suggestedPathUpTo(modelPath, 0)).toHaveLength(1);
  });
});

describe("suggested path overlay", () => {
  it("draws the recommended route when the toggle is on", () => {
    const { container } = renderOverlay(modelPath);
    const line = container.querySelector('[data-name="suggested-path"]');
    expect(line).not.toBeNull();
    // Dashed, so it is distinguishable from a walked route without relying on colour.
    expect(line?.getAttribute("stroke-dasharray")).toBe("6 4");
    expect(line?.getAttribute("points")?.split(" ")).toHaveLength(3);
  });

  it("draws nothing with the toggle off", () => {
    const { container } = renderOverlay(modelPath, {
      ...toggles,
      suggestedPath: false,
    });
    expect(container.querySelector('[data-name="suggested-path"]')).toBeNull();
  });

  it("draws nothing before the path has loaded", () => {
    const { container } = renderOverlay(null);
    expect(container.querySelector('[data-name="suggested-path"]')).toBeNull();
  });
});
