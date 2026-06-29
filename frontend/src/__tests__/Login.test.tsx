import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import LoginPage from "../pages/LoginPage";
import * as authApi from "../api/auth";
import * as userApi from "../api/user";
import type { UserMe } from "../types/auth";

import "@testing-library/jest-dom/vitest";
import { useNavigate } from "react-router";

const MOCK_COGNITO_SUB = "00000000-0000-4000-8000-000000000099";

// Mock the API functions
vi.mock("../api/auth");
vi.mock("../api/user");

// beforeEach(() => {
//         vi.clearAllMocks();
//         vi.mock("react-router", async () => {
//             const actual = await vi.importActual("react-router");
//             return {
//                 ...(actual as object),
//                 useNavigate: () => mockNavigate,
//             };
//         });
//         vi.mocked(authApi.loginUser).mockResolvedValue(undefined);
//         vi.mocked(userApi.getMe).mockResolvedValue({ ...mockUser, has_linked_riot: false });
//     });
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...(actual as object),
    useNavigate: () => vi.fn(),   // we'll use mockNavigate inside the test
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

// ---------------------------------------------------------------
// AuthContext tests
// ---------------------------------------------------------------
describe("AuthContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // By default no stored token -> user stays null after initial load
        vi.mocked(userApi.getMe).mockResolvedValue(mockUser);
    });

    it("initially provides loading state", async () => {
        const TestChild = () => {
            const { loading } = useAuth();
            return <span>{loading ? "Loading..." : "LOADED"}</span>;
        };

        render(
            <AuthProvider>
                <TestChild />
            </AuthProvider>,
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText("LOADED")).toBeInTheDocument());
    });

    it("Login calls the API and sets the user", async () => {
        vi.mocked(authApi.loginUser).mockResolvedValue(undefined);
        vi.mocked(userApi.getMe).mockResolvedValue(mockUser);

        const TestChild = () => {
            const { user, login } = useAuth();
            return (
                <div>
                    <button onClick={() => void login({ email: "test@example.com", password: "PassCode" })}>
                        Log In
                    </button>
                    {user && <span data-testid="user">{user.display_name}</span>}
                </div>
            );
        };

        render(
            <AuthProvider>
                <TestChild />
            </AuthProvider>,
        );

        await userEvent.click(screen.getByText("Log In"));
        await waitFor(() => {
            expect(authApi.loginUser).toHaveBeenCalledWith({ email: "test@example.com", password: "PassCode" });
            expect(screen.getByTestId("user")).toHaveTextContent("TestUser");
        });
    });

    it("Logout clears the user", async () => {
        vi.mocked(authApi.loginUser).mockResolvedValue(undefined);
        vi.mocked(userApi.getMe).mockResolvedValue(mockUser);

        const TestChild = () => {
            const { user, login, logout } = useAuth();
            return (
                <div>
                    <button onClick={() => void login({ email: "x", password: "x" })}>Log In</button>
                    <button onClick={() => logout()}>Log Out</button>
                    {user ? <span data-testid="user"> Logged In </span> : <span data-testid="no-user">logged out</span>}
                </div>
            );
        };

        render(
            <AuthProvider>
                <TestChild />
            </AuthProvider>,
        );

        await userEvent.click(screen.getByText("Log In"));
        await waitFor(() => {
            expect(screen.getByTestId("user")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText("Log Out"));
        await waitFor(() => {
            expect(screen.getByTestId("no-user")).toBeInTheDocument();
        });
    });
});

// ---------------------------------------------------------------
// LoginPage tests
// ---------------------------------------------------------------
describe("LoginPage", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Default: login success, user not linked to Riot
        vi.mocked(authApi.loginUser).mockResolvedValue(undefined);
        vi.mocked(userApi.getMe).mockResolvedValue({ ...mockUser, has_linked_riot: false });
        // Override the global vi.mock to return our test's specific mockNavigate
        // (vi.mock is hoisted, so this override works)
        (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    });

    it("renders the login form", () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("submits the form and navigates to link-riot when no riot linked", async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
        await userEvent.type(screen.getByLabelText("Password"), "password123");
        await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(authApi.loginUser).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
            });
            expect(mockNavigate).toHaveBeenCalledWith("/link-riot", { replace: true });
        });
    });

    it("shows an error message on login failure", async () => {
        // Override for this specific test
        vi.mocked(authApi.loginUser).mockRejectedValue(new Error("Invalid credentials"));

        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await userEvent.type(screen.getByLabelText("Email"), "bad@example.com");
        await userEvent.type(screen.getByLabelText("Password"), "wrong");
        await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByRole("alert")).toHaveTextContent(/sign in failed/i);
        });
    });
});
