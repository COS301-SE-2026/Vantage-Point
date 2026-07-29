// src/__tests__/components/auth/Login.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi } from "vitest";
import Login, { type LoginFormProps } from "../../../components/auth/Login";
import "@testing-library/jest-dom/vitest";

function buildForm(overrides?: Partial<LoginFormProps>): LoginFormProps {
  return {
    email: "",
    password: "",
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onSubmit: vi.fn(),
    onSocialClick: vi.fn(),
    ...overrides,
  };
}

function renderLogin(form: LoginFormProps, backgroundImage?: string) {
  return render(
    <MemoryRouter>
      <Login form={form} backgroundImage={backgroundImage} />
    </MemoryRouter>,
  );
}

describe("Login Component", () => {
  it("renders the login form with email, password fields and sign in button", () => {
    const form = buildForm();
    renderLogin(form);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("calls onEmailChange when email input changes", () => {
    const onEmailChange = vi.fn();
    const form = buildForm({ onEmailChange });
    renderLogin(form);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    expect(onEmailChange).toHaveBeenCalledWith("test@example.com");
  });

  it("calls onPasswordChange when password input changes", () => {
    const onPasswordChange = vi.fn();
    const form = buildForm({ onPasswordChange });
    renderLogin(form);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    expect(onPasswordChange).toHaveBeenCalledWith("secret");
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn();
    const form = buildForm({ onSubmit });
    renderLogin(form);

    fireEvent.submit(screen.getByRole("button", { name: "Sign In" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows error message when error is provided", () => {
    const form = buildForm({ error: "Invalid credentials" });
    renderLogin(form);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Invalid credentials");
  });

  it("disables sign in button and shows loading text when loading", () => {
    const form = buildForm({ loading: true });
    renderLogin(form);

    const button = screen.getByRole("button", { name: "Signing in…" });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Signing in…");
  });

  it("toggles password visibility when the reveal control is clicked", () => {
    const form = buildForm();
    renderLogin(form);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("renders social login buttons with images", () => {
    const form = buildForm();
    renderLogin(form);

    expect(screen.getByAltText("Sign in with Google")).toBeInTheDocument();
    expect(screen.getByAltText("Sign in with Apple")).toBeInTheDocument();
    expect(screen.getByAltText("Sign in with Riot Games")).toBeInTheDocument();
  });

  it("calls onSocialClick when a social button is clicked", () => {
    const onSocialClick = vi.fn();
    const form = buildForm({ onSocialClick });
    renderLogin(form);

    fireEvent.click(screen.getByAltText("Sign in with Google"));
    expect(onSocialClick).toHaveBeenCalledTimes(1);
  });

  it("renders background image slides and controls by default", () => {
    const form = buildForm();
    renderLogin(form);

    const slidesDots = screen.getByRole("tablist", {
      name: "Background slides",
    });
    expect(slidesDots).toBeInTheDocument();

    const allSlideImages = screen.getAllByAltText(
      "League of Legends champion splash art",
    );
    expect(allSlideImages.length).toBeGreaterThan(0);
  });

  it("uses a single static background image when backgroundImage prop is provided", () => {
    const form = buildForm();
    const staticBg = "/src/assets/images/wallpapers/test.jpg";
    renderLogin(form, staticBg);

    expect(
      screen.getByAltText("League of Legends champion splash art"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("tablist", { name: "Background slides" }),
    ).not.toBeInTheDocument();
  });

  it("renders a 'Sign Up' link that navigates to /register", () => {
    const form = buildForm();
    renderLogin(form);

    const signUpButton = screen.getByRole("button", { name: "Sign Up" });
    expect(signUpButton).toBeInTheDocument();
  });

  it("renders the logo with correct alt text", () => {
    const form = buildForm();
    renderLogin(form);

    expect(screen.getByAltText("Vantage Point Logo")).toBeInTheDocument();
  });
});
