import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfileView from "../pages/ProfileView";
import type { PlayerProfile } from "../types/profile";

/** recharts' ResponsiveContainer needs ResizeObserver, which jsdom lacks. */
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const profile: PlayerProfile = {
  display_name: "User Name",
  riot_id_tag: "riotID#1234",
  avatar_initials: "UN",
  avatar_url: null,
  matches_sampled: 20,
  radar_metrics: [
    { key: "kda", label: "KDA", value: 76, rawLabel: "3.8" },
    { key: "vision", label: "Vision", value: 64, rawLabel: "22" },
    { key: "gpm", label: "GPM", value: 70, rawLabel: "412" },
    { key: "dpm", label: "DPM", value: 58, rawLabel: "610" },
    { key: "cs", label: "CS/min", value: 66, rawLabel: "7.1" },
    { key: "kp", label: "Kill Part.", value: 81, rawLabel: "58%" },
  ],
  recent_champions: [
    { champion_id: 222, champion_name: "Jinx", games_played: 8 },
    { champion_id: 103, champion_name: "Ahri", games_played: 5 },
    { champion_id: 64, champion_name: "Lee Sin", games_played: 4 },
    { champion_id: 412, champion_name: "Thresh", games_played: 2 },
    { champion_id: 86, champion_name: "Garen", games_played: 1 },
  ],
  achievements: [],
  featured_games: [
    {
      game_name: "League Of Legends",
      cover_image_url: "/cover.jpg",
      efficiency_score: 115,
      time_spent_label: "1:04:34:23",
      win_rate_label: "65% (13W / 7L)",
      kda_label: "3.8 avg",
    },
  ],
};

describe("ProfileView", () => {
  it("renders the Figma sections with profile data", () => {
    render(<ProfileView profile={profile} />);

    expect(screen.getByText("Last 20 matches")).toBeDefined();
    expect(screen.getByText("Most played champions")).toBeDefined();
    expect(screen.getByText("League Of Legends")).toBeDefined();
    expect(screen.getByText("115")).toBeDefined();
    expect(screen.getByText("65% (13W / 7L)")).toBeDefined();
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(5);
  });

  it("centers the content column only while the sidebar is collapsed", () => {
    const column = '[data-node-id="14:474"]';

    const open = render(<ProfileView profile={profile} sidebarOpen />);
    expect(open.container.querySelector(column)?.className).not.toContain(
      "mx-auto",
    );
    open.unmount();

    const collapsed = render(
      <ProfileView profile={profile} sidebarOpen={false} />,
    );
    expect(collapsed.container.querySelector(column)?.className).toContain(
      "mx-auto",
    );
  });
});
