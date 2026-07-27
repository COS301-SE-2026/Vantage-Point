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

/** The tokens Figma 14:370 "Profile Page" (dark) defines for this screen. */
const TOKENS = {
  surface: "device-dark:bg-[#3a3939]",
  body: "device-dark:text-white",
  supp: "device-dark:text-[#929292]",
};

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

describe("Profile page dark mode (Figma 14:370)", () => {
  it("puts the featured game card on the #3a3939 surface with white text", () => {
    const { container } = render(<ProfileView profile={profile} sidebarOpen />);

    const card = container.querySelector(
      '[data-name="FeaturedGameCardOpen"]',
    ) as HTMLElement | null;
    expect(card?.className).toContain(TOKENS.surface);

    for (const label of ["Efficiency Score", "Time Spent", "Win Rate"]) {
      expect(screen.getByText(label).className).toContain(TOKENS.body);
    }
  });

  it("serves the white stat icons to dark devices", () => {
    const { container } = render(<ProfileView profile={profile} sidebarOpen />);

    const rows = Array.from(
      container.querySelectorAll('[data-name="StatRow"]'),
    );

    // One pair per StatRow — Figma 14:738 / 14:747 / 14:758 / 14:772. Vite
    // inlines these SVGs, so assert on the stroke the browser would paint.
    expect(rows).toHaveLength(4);
    for (const row of rows) {
      const [light, dark] = Array.from(row.querySelectorAll("img"));

      expect(light.className).toContain("device-dark:hidden");
      expect(light.getAttribute("src")).toContain("stroke='%231E1E1E'");

      expect(dark.className).toContain("hidden");
      expect(dark.className).toContain("device-dark:block");
      expect(dark.getAttribute("src")).toContain("stroke='white'");
    }
  });

  it("keeps the section headings and champion tiles on the dark tokens", () => {
    const { container } = render(<ProfileView profile={profile} sidebarOpen />);

    expect(screen.getByText("Last 20 matches").className).toContain(
      TOKENS.body,
    );
    expect(screen.getByText("Most played champions").className).toContain(
      TOKENS.body,
    );

    const tile = container.querySelector('[data-name="Image (Jinx)"]');
    expect(tile?.className).toContain("bg-[#404040]");
  });

  it("falls back to the muted dark text while the profile loads", () => {
    const { container } = render(<ProfileView />);

    expect(container.firstElementChild?.className).toContain(TOKENS.supp);
  });
});
