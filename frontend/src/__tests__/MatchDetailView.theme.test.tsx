import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import MatchDetailView from "../pages/MatchDetailView";
import type { MatchDetail, ParticipantDetail } from "../types/match";

/** The tokens Figma 22:182 "Default page dark" defines for the match page. */
const TOKENS = {
  page: "device-dark:bg-[#181818]",
  surface: "device-dark:bg-[#3a3939]",
  card: "device-dark:bg-[#2a2a2a]",
  pill: "device-dark:bg-[#2c2c2c]",
  border: "device-dark:border-[#2c2c2c]",
  viewerRow: "device-dark:bg-[rgba(115,149,229,0.56)]",
  body: "device-dark:text-white",
};

function participant(
  puuid: string,
  overrides: Partial<ParticipantDetail> = {},
): ParticipantDetail {
  return {
    puuid,
    riot_id: `${puuid}#EUW`,
    champion_id: 412,
    champion_name: "Thresh",
    position: "UTILITY",
    win: false,
    kills: 1,
    deaths: 6,
    assists: 18,
    cs: 32,
    gold_earned: 11000,
    damage_to_champions: 18000,
    vision_score: 78,
    items: [],
    summoner_spells: [],
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
      bans: [{ champion_id: 157, champion_name: "Yasuo" }],
      objectives: {
        baron: 0,
        dragon: 3,
        rift_herald: 1,
        tower: 7,
        inhibitor: 0,
      },
      participants: [
        participant("viewer", { riot_id: "UserName#1234", is_viewer: true }),
        participant("mate"),
      ],
    },
    {
      team_id: 200,
      win: true,
      bans: [{ champion_id: 64, champion_name: "Lee Sin" }],
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

vi.mock("../api/match", () => ({
  fetchMatchDetail: vi.fn(async () => match),
}));

async function renderView() {
  const view = render(
    <MemoryRouter>
      <MatchDetailView matchId="EUW1_1" sidebarOpen />
    </MemoryRouter>,
  );
  await screen.findAllByText("Objectives Completed");
  return view;
}

describe("Match page dark mode (Figma 22:182)", () => {
  it("paints the scoreboard on the page colour with #2c2c2c rules", async () => {
    const { container } = await renderView();

    const table = container.querySelector("table")?.parentElement;
    expect(table?.className).toContain(TOKENS.page);
    expect(table?.className).toContain(TOKENS.border);

    const headerRow = container.querySelector("thead tr");
    expect(headerRow?.className).toContain(TOKENS.surface);
    // Header labels go white on dark, unlike the muted cells below them.
    expect(headerRow?.innerHTML).toContain(TOKENS.body);
  });

  it("tints only the viewer's row and leaves the rest transparent", async () => {
    const { container } = await renderView();

    const rows = Array.from(container.querySelectorAll("tbody tr"));
    const viewerRows = rows.filter((row) =>
      row.className.includes(TOKENS.viewerRow),
    );

    expect(viewerRows).toHaveLength(1);
    expect(viewerRows[0].className).toContain("border-l-[#07f]");
    for (const row of rows) {
      expect(row.className).toContain(TOKENS.border);
      if (!row.className.includes(TOKENS.viewerRow)) {
        expect(row.className).toContain("device-dark:bg-transparent");
      }
    }
  });

  it("uses the card, pill and panel surfaces for the trailing sections", async () => {
    const { container } = await renderView();

    const objectives = screen
      .getAllByText("Objectives Completed")[0]
      .closest("section");
    expect(objectives?.className).toContain(TOKENS.card);
    expect(objectives?.className).toContain(TOKENS.border);

    const ban = screen.getByTitle("Yasuo");
    expect(ban.className).toContain(TOKENS.pill);

    const panel = container.querySelector(
      '[aria-label="AI coaching comments"]',
    );
    expect(panel?.className).toContain(TOKENS.surface);
  });
});
