import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardShell from "../components/DashboardShell";

/** The five tokens Figma 14:369 defines for the dark dashboard. */
const TOKENS = {
  page: "device-dark:bg-[#181818]",
  surface: "device-dark:bg-[#3a3939]",
  control: "device-dark:bg-[#2a2a2a]",
  body: "device-dark:text-white",
};

function renderShell() {
  return render(
    <DashboardShell sidebarOpen onSidebarToggle={() => {}}>
      <div />
    </DashboardShell>,
  );
}

describe("Dashboard dark mode (Figma 14:369)", () => {
  it("paints the page, sidebar and nav buttons with the dark tokens", () => {
    const { container } = renderShell();

    const page = container.firstElementChild;
    expect(page?.className).toContain(TOKENS.page);

    const sidebar = screen.getByRole("navigation", {
      name: "Dashboard navigation",
    });
    expect(sidebar.className).toContain(TOKENS.surface);

    for (const label of ["Matches", "Match Replay", "Metrics", "Log out"]) {
      const button = screen.getByRole("button", { name: label });
      expect(button.className).toContain(TOKENS.control);
      // The label sits in a child span, so assert on the rendered subtree.
      expect(button.innerHTML).toContain(TOKENS.body);
    }
  });

  it("swaps the logo mark for the white cut on dark devices", () => {
    const { container } = renderShell();

    const source = container.querySelector("picture source");
    expect(source?.getAttribute("media")).toBe("(prefers-color-scheme: dark)");
    expect(source?.getAttribute("srcset")).toContain("logo-mark-white");
  });
});
