import { describe, expect, it } from "vitest";
import type { MatchHistorySummary } from "../types/match";
import {
  applyMatchListControls,
  filterMatches,
  searchMatches,
  sortMatches,
} from "./matchListQuery";
import { toDashboardListItem } from "./matchHistoryGroup";

function makeMatch(
  overrides: Partial<MatchHistorySummary> = {}
): MatchHistorySummary {
  return {
    matchId: "match-1",
    champion_name: "Darius",
    outcome: "Victory",
    duration_minutes: 28,
    map_label: "Summoner's Rift",
    played_on: "2026-04-19",
    kills: 5,
    deaths: 2,
    assists: 7,
    cs: 180,
    position: "TOP",
    ...overrides,
  };
}

describe("filterMatches", () => {
  const matches = [
    makeMatch({ matchId: "win-top", outcome: "Victory", position: "TOP" }),
    makeMatch({
      matchId: "loss-jgl",
      outcome: "Defeat",
      position: "JUNGLE",
      champion_name: "Lee Sin",
    }),
    makeMatch({
      matchId: "win-mid",
      outcome: "Victory",
      position: "MIDDLE",
      champion_name: "Ahri",
    }),
  ];

  it("returns all matches for the all filter", () => {
    expect(filterMatches(matches, "all")).toHaveLength(3);
  });

  it("filters wins and losses", () => {
    expect(filterMatches(matches, "victory")).toHaveLength(2);
    expect(filterMatches(matches, "defeat")).toHaveLength(1);
  });

  it("filters by role", () => {
    expect(filterMatches(matches, "jungle")).toEqual([
      expect.objectContaining({ matchId: "loss-jgl" }),
    ]);
  });
});

describe("sortMatches", () => {
  const matches = [
    makeMatch({ matchId: "b", played_on: "2026-04-18", duration_minutes: 20, cs: 100 }),
    makeMatch({ matchId: "a", played_on: "2026-04-19", duration_minutes: 40, cs: 200 }),
    makeMatch({ matchId: "c", played_on: "2026-04-17", duration_minutes: 30, cs: 150 }),
  ];

  it("sorts newest first by date", () => {
    expect(sortMatches(matches, "newest").map((m) => m.matchId)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("sorts oldest first by date", () => {
    expect(sortMatches(matches, "oldest").map((m) => m.matchId)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("sorts by duration and cs", () => {
    expect(sortMatches(matches, "duration").map((m) => m.matchId)).toEqual([
      "a",
      "c",
      "b",
    ]);
    expect(sortMatches(matches, "cs").map((m) => m.matchId)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });
});

describe("searchMatches", () => {
  const items = [
    toDashboardListItem(makeMatch({ champion_name: "Darius" })),
    toDashboardListItem(
      makeMatch({ champion_name: "Caitlyn", position: "BOTTOM" })
    ),
  ];

  it("matches champion names case-insensitively", () => {
    expect(searchMatches(items, "cait")).toHaveLength(1);
    expect(searchMatches(items, "cait")[0]?.champion_name).toBe("Caitlyn");
  });

  it("returns all items for an empty query", () => {
    expect(searchMatches(items, "   ")).toHaveLength(2);
  });

  it("returns no items when nothing matches", () => {
    expect(searchMatches(items, "zzz")).toHaveLength(0);
  });
});

describe("applyMatchListControls", () => {
  it("applies filter, sort, and search together", () => {
    const matches = [
      makeMatch({ matchId: "1", champion_name: "Darius", outcome: "Victory" }),
      makeMatch({
        matchId: "2",
        champion_name: "Caitlyn",
        outcome: "Defeat",
        position: "BOTTOM",
      }),
    ];

    const result = applyMatchListControls(matches, {
      filterId: "victory",
      sortId: "newest",
      searchQuery: "dar",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.champion_name).toBe("Darius");
  });
});
