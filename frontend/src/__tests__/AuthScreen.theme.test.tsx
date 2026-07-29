import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Login from "../components/auth/Login";

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login
        form={{
          email: "",
          password: "",
          onEmailChange: () => {},
          onPasswordChange: () => {},
          onSubmit: () => {},
        }}
      />
    </MemoryRouter>,
  );
}

describe("Auth screen dark mode (Figma 12:44)", () => {
  it("carries device-theme variants on the panel and fields", () => {
    const { container } = renderLogin();

    const panel = container.querySelector('[data-node-id="12:52"]');
    expect(panel?.className).toContain("device-dark:bg-[#181818]");

    const email = screen.getByLabelText("Email");
    // Dark fields are a filled #575757 pill with #929292 placeholder text.
    expect(email.className).toContain("device-dark:bg-[#575757]");
    expect(email.className).toContain("device-dark:placeholder:text-[#929292]");
    // Chrome repaints autofilled inputs opaque white unless this is re-stated.
    expect(email.className).toContain(
      "device-dark:[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(87,87,87)]",
    );
  });

  it("uses the shared Supp text dark token for the account-switch line", () => {
    renderLogin();

    const action = screen.getByRole("button", { name: "Sign Up" });
    expect(action.className).toContain("device-dark:text-white");
    // #929292 ("Supp text dark"), shared by Figma 12:64 and 13:490.
    expect(action.parentElement?.className).toContain(
      "device-dark:text-[#929292]",
    );
  });

  it("swaps the solid-silhouette marks for their white cuts on dark devices", () => {
    const { container } = renderLogin();

    const darkSources = [...container.querySelectorAll("picture source")].map(
      (s) => ({
        media: s.getAttribute("media"),
        srcset: s.getAttribute("srcset") ?? "",
      }),
    );

    expect(darkSources.length).toBeGreaterThanOrEqual(2);
    for (const source of darkSources) {
      expect(source.media).toBe("(prefers-color-scheme: dark)");
    }
    expect(darkSources.some((s) => s.srcset.includes("logo-mark-white"))).toBe(
      true,
    );
    expect(darkSources.some((s) => s.srcset.includes("apple-white"))).toBe(
      true,
    );

    // Google and Riot are full-colour marks and must not be swapped.
    expect(darkSources.some((s) => s.srcset.includes("google"))).toBe(false);
    expect(darkSources.some((s) => s.srcset.includes("riot"))).toBe(false);
  });
});
