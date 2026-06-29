// src/__tests__/Login.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import * as authApi from "../api/auth";
import * as userApi from "../api/user";
import type { UserMe } from "../types/auth";

// Makes toHaveTextContent, toBeInTheDocument etc. available
import "@testing-library/jest-dom/vitest";

const MOCK_COGNITO_SUB = "00000000-0000-4000-8000-000000000099";

// Hoisted mocks
vi.mock("../api/auth");
vi.mock("../api/user");

// Instead of mocking useNavigate with a factory that returns a new function,
// we create the mockNavigate here and let the module mock return it directly.
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

const mockUser: UserMe = {
  cognito_sub: MOCK_COGNITO_SUB,
  email: "test@example.com",
  display_name: "TestUser",
  avatar_url: null,
  riot_id_tag: null,
  has_linked_riot: false,
};

// ─── AuthContext tests ───────────────────────────────────────
describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // By default getMe returns the mock user
    vi.mocked(userApi.getMe).mockResolvedValue(mockUser);
  });

  it("initially shows loading state, then resolves to loaded", async () => {
    const TestChild = () => {
      const { loading } = useAuth();
      return <span>{loading ? "Loading..." : "LOADED"}</span>;
    };

    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );

    // The initial render should be loading
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for the initial getMe to resolve
    const loaded = await screen.findByText("LOADED");
    expect(loaded).toBeInTheDocument();
  });

  it("login calls the API and sets the user", async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue(undefined);
    vi.mocked(userApi.getMe).mockResolvedValue(mockUser);

    const TestChild = () => {
      const { user, login } = useAuth();
      return (
        <div>
          <button
            onClick={() => login({ email: "test@example.com", password: "PassCode" })}
          >
            Log In
          </button>
          {user && <span data-testid="user">{user.display_name}</span>}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );

    // Wait for initial loading to finish
    await screen.findByText("Log In");

    fireEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      expect(authApi.loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "PassCode",
      });
    });

    const userDisplay = await screen.findByTestId("user");
    expect(userDisplay).toHaveTextContent("TestUser");
  });

  it("logout clears the user", async () => {
    vi.mocked(authApi.loginUser).mockResolvedValue(undefined);
    vi.mocked(userApi.getMe).mockResolvedValue(mockUser);

    const TestChild = () => {
      const { user, login, logout } = useAuth();
      return (
        <div>
          <button onClick={() => login({ email: "x", password: "x" })}>
            Log In
          </button>
          <button onClick={() => logout()}>Log Out</button>
          {user ? (
            <span data-testid="user">Logged In</span>
          ) : (
            <span data-testid="no-user">logged out</span>
          )}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestChild />
      </AuthProvider>
    );

    // Wait for initial loading
    await screen.findByText("Log In");

    fireEvent.click(screen.getByText("Log In"));
    await screen.findByTestId("user"); // user should appear

    fireEvent.click(screen.getByText("Log Out"));
    const noUser = await screen.findByTestId("no-user");
    expect(noUser).toBeInTheDocument();
  });
});

// ─── LoginPage tests ─────────────────────────────────────────
describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mockNavigate for each test
    mockNavigate.mockReset();
    // Default: login succeeds and user has not linked Riot
    vi.mocked(authApi.loginUser).mockResolvedValue(undefined);
    vi.mocked(userApi.getMe).mockResolvedValue({
      ...mockUser,
      has_linked_riot: false,
    });
  });

  it("renders the login form after loading", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for the AuthProvider to finish initializing
    const emailInput = await screen.findByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const signInButton = screen.getByRole("button", { name: /^sign in$/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
  });

  it("submits the form and navigates to /link-riot when user has no Riot ID", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for form to appear
    await screen.findByLabelText("Email");

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => {
      expect(authApi.loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // The mocked useNavigate should have been called with the expected arguments
    expect(mockNavigate).toHaveBeenCalledWith("/link-riot", { replace: true });
  });

  it("shows an error message on login failure", async () => {
    vi.mocked(authApi.loginUser).mockRejectedValue(
      new Error("Invalid credentials")
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await screen.findByLabelText("Email"); // form is ready

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "bad@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));


    // The error alert should appear asynchronously
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/sign in failed/i);
  });
});