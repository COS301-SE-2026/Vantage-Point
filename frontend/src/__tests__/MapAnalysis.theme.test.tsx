import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AiCoachingBar from "../components/AiCoachingBar";
import MapAnalysisTable, {
  type MapAnalysisRow,
} from "../components/MapAnalysisTable";

/**
 * Figma 32:1145 only draws this page's chrome on dark — the MapAnalysisView
 * content (32:961) is light-only — so these tokens are the ones the three
 * specified dark pages establish, applied by the same light→dark mapping.
 */
const TOKENS = {
  panel: "device-dark:bg-[#3a3939]",
  row: "device-dark:bg-[#2a2a2a]",
  rule: "device-dark:border-[#2c2c2c]",
  divider: "device-dark:border-[#3a3939]",
  transport: "device-dark:bg-[#404040]",
};

function row(id: string): MapAnalysisRow {
  return {
    id,
    teamLabel: "Health",
    teamValue: "50",
    playerLabel: "Health",
    playerValue: "50",
    skillLabel: "SkillSlot_1",
    skillValue: "Lvl 1",
    itemLabel: "Item_1",
    itemId: 3006,
    objectiveLabel: "Towers",
    objectiveValue: "50",
  };
}

function renderTable() {
  return render(
    <MapAnalysisTable
      rows={[row("a"), row("b")]}
      clock="15:36"
      playing
      onTogglePlaying={() => {}}
      onRewind={() => {}}
    />,
  );
}

describe("Map analysis dark mode (Figma 32:1145)", () => {
  it("stacks the rows and rules on the dark panel", () => {
    const { container } = renderTable();

    const panel = container.firstElementChild;
    expect(panel?.className).toContain(TOKENS.panel);

    const header = container.querySelector('[data-name="HeaderRow"]');
    expect(header?.className).toContain(TOKENS.rule);

    const rows = Array.from(
      container.querySelectorAll('[data-name="ParticipantRow"]'),
    );
    expect(rows).toHaveLength(2);
    for (const participantRow of rows) {
      expect(participantRow.className).toContain(TOKENS.row);
      expect(participantRow.className).toContain(TOKENS.rule);
    }
  });

  it("shows the panel through the cell dividers rather than a lighter grey", () => {
    const { container } = renderTable();

    const cells = Array.from(
      container.querySelectorAll('[data-name="Table Cell"]'),
    ).filter((cell) => cell.className.includes("border-l"));

    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.className).toContain(TOKENS.divider);
    }
  });

  it("lifts the transport cell above the row and keeps its glyphs legible", () => {
    const { container } = renderTable();

    const transport = container.querySelector('[data-node-id="32:822"]');
    expect(transport?.className).toContain(TOKENS.transport);

    const darkGlyphs = Array.from(
      transport?.querySelectorAll("img") ?? [],
    ).filter((img) => img.className.includes("device-dark:block"));

    // Pause and rewind each ship a white twin for the dark cell.
    expect(darkGlyphs).toHaveLength(2);
    for (const glyph of darkGlyphs) {
      expect(glyph.getAttribute("src")).toMatch(/-white\.svg|stroke='white'/);
    }
  });

  it("rules the coaching bar with #2c2c2c instead of the light #dadada", () => {
    const { container } = render(
      <AiCoachingBar
        tips={[{ id: "tip", heading: "General Tip", body: "Play safer." }]}
      />,
    );

    const bar = container.firstElementChild;
    expect(bar?.className).toContain(TOKENS.panel);
    expect(bar?.className).toContain(
      "device-dark:shadow-[inset_0_0_0_1px_#2c2c2c]",
    );
    expect(screen.getByText("Play safer.").className).toContain(
      "device-dark:text-white",
    );
  });
});
