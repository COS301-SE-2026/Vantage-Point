import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Login from "../components/auth/Login";

/**
 * The auth screens used to be a light Figma frame with a `device-dark:` twin,
 * and this suite pinned the hex values of both. They are now the same always
 * dark surface the dashboard is built from, so it guards that contract instead:
 * the `--color-vp-*` tokens are what every screen shares, and a stray
 * `device-dark:` or raw hex is the regression to catch.
 */
const CANVAS = "bg-vp-canvas";
const SURFACE = "bg-vp-surface";
const RAISED = "bg-vp-raised";

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

describe("Auth surface", () => {
  it("paints the shell on the canvas in the brand face", () => {
    const { container } = renderLogin();

    const shell = container.querySelector('[data-name="auth-screen"]');
    expect(shell?.className).toContain(CANVAS);
    expect(shell?.className).toContain("font-beaufort");

    const panel = container.querySelector('[data-name="left-panel"]');
    expect(panel?.className).toContain(CANVAS);
  });

  it("puts the form card and its fields on the raised greys", () => {
    renderLogin();

    const email = screen.getByLabelText("Username or Email");
    expect(email.className).toContain(RAISED);
    expect(email.className).toContain("border-vp-line");
    expect(email.className).toContain("focus:border-vp-gold/60");
    // Chrome repaints autofilled inputs with its own background unless the
    // surface is re-stated as an inset shadow.
    expect(email.className).toContain(
      "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#1b1e25]",
    );

    const card = email.closest(`.${SURFACE}\\/85`);
    expect(card).not.toBeNull();
  });

  it("carries no device-theme variants anywhere on the screen", () => {
    const { container } = renderLogin();

    const withVariant = [...container.querySelectorAll("[class]")].filter(
      (el) => el.className.toString().includes("device-dark:"),
    );
    expect(withVariant).toHaveLength(0);
  });

  it("keeps gold for the primary action and the account-switch line", () => {
    renderLogin();

    const submit = screen.getByRole("button", { name: "Sign In" });
    expect(submit.className).toContain("from-vp-gold");

    const action = screen.getByRole("button", { name: "Sign Up" });
    expect(action.className).toContain("text-vp-gold");
    expect(action.parentElement?.className).toContain("text-vp-dim");
  });
});
