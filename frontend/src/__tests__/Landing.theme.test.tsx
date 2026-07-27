import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Landing from "../landing/imports/Landing/Landing";

describe("Landing background", () => {
  it("offers a dark splash for dark devices and a light one as the default", () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    const source = container.querySelector("picture source");
    const img = container.querySelector("picture img");

    // The device theme picks the art in CSS, so the dark file must sit behind
    // a prefers-color-scheme query and the light file must be the <img> default.
    expect(source?.getAttribute("media")).toBe("(prefers-color-scheme: dark)");
    expect(source?.getAttribute("srcset")).toContain("landing-wallpaper-dark");

    const src = img?.getAttribute("src") ?? "";
    expect(src).toContain("landing-wallpaper");
    expect(src).not.toContain("landing-wallpaper-dark");
  });
});
