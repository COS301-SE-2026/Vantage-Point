import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardShell from "../components/DashboardShell";
import MapAnalysisTable, {
  type MapAnalysisRow,
} from "../components/MapAnalysisTable";
import AiCoachingBar from "../components/AiCoachingBar";

/**
 * The dashboard used to be a light Figma frame with a `device-dark:` twin, and
 * five separate suites pinned the hex values of each screen. It is now a single
 * always-dark surface built from the `--color-vp-*` tokens in styles/theme.css,
 * so this suite guards that contract instead: the tokens are what every screen
 * shares, and a stray `device-dark:` or raw hex is the regression to catch.
 */
const CANVAS = "bg-vp-canvas";
const SURFACE = "bg-vp-surface";
const RAISED = "bg-vp-raised";
const LINE = "border-vp-line";

function renderShell() {
  return render(
    <DashboardShell sidebarOpen onSidebarToggle={() => {}}>
      <div />
    </DashboardShell>,
  );
}

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

describe("Dashboard surface", () => {
  it("paints the shell on the canvas with the sidebar one step above it", () => {
    const { container } = renderShell();

    expect(container.firstElementChild?.className).toContain(CANVAS);

    const rail = document.getElementById("dashboard-sidebar");
    expect(rail?.className).toContain(SURFACE);
    expect(rail?.className).toContain(LINE);
  });

  it("keeps every nav destination reachable as a button", () => {
    renderShell();

    const nav = screen.getByRole("navigation", {
      name: "Dashboard navigation",
    });
    for (const label of ["Matches", "Match Replay"]) {
      expect(nav.querySelector(`[aria-label="${label}"]`)).not.toBeNull();
    }
    expect(screen.getByRole("button", { name: "Log out" })).toBeDefined();
    // Metrics is reached from "Show Analysis" in the replay toolbar, not here.
    expect(nav.querySelector('[aria-label="Metrics"]')).toBeNull();
  });

  it("marks the active section and exposes the collapse state", () => {
    renderShell();

    expect(
      screen
        .getByRole("button", { name: "Matches" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen
        .getByRole("button", { name: "Match Replay" })
        .getAttribute("aria-current"),
    ).toBeNull();

    const toggle = screen.getByRole("button", {
      name: "Collapse navigation panel",
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBe("dashboard-sidebar");
  });

  it("stacks the map analysis rows on the raised surface", () => {
    const { container } = render(
      <MapAnalysisTable
        rows={[row("a"), row("b")]}
        clock="15:36"
        playing
        onTogglePlaying={() => {}}
        onRewind={() => {}}
      />,
    );

    expect(container.firstElementChild?.className).toContain(SURFACE);

    const rows = Array.from(
      container.querySelectorAll('[data-name="ParticipantRow"]'),
    );
    expect(rows).toHaveLength(2);
    for (const participantRow of rows) {
      expect(participantRow.className).toContain(RAISED);
      expect(participantRow.className).toContain(LINE);
    }
  });

  it("puts the coaching bar on the same surface as the rest of the page", () => {
    const { container } = render(
      <AiCoachingBar
        tips={[{ id: "tip", heading: "General Tip", body: "Play safer." }]}
      />,
    );

    expect(container.firstElementChild?.className).toContain(SURFACE);
    expect(screen.getByText("Play safer.").className).toContain("text-vp-dim");
  });

  it("has no `device-dark:` variants left on the dashboard chrome", () => {
    const { container } = renderShell();
    expect(container.innerHTML).not.toContain("device-dark:");
  });
});
