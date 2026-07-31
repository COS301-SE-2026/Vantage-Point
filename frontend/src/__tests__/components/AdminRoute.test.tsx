import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import AdminRoute from "../../components/AdminRoute";
import { useAuth } from "../../context/AuthContext";

vi.mock("../../context/AuthContext");

const OGDev = import.meta.env.DEV;

afterEach(() => {
  (import.meta.env as { DEV: boolean }).DEV = OGDev;
});

// Helper Function to render the AdminRoute component with a given user and loading state
function renderAt(path: string, requireSuperAdmin = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin"
          element={<AdminRoute requireSuperAdmin={requireSuperAdmin} />}
        >
          <Route index element={<div>Admin Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

// startign terst of AdminRoute component
describe("AdminRoute", () => {
  // test the stub of import.meta.env.DEV that should render the Outlet component
  describe("DEV stub bypass (current behavior)", () => {
    it("renders the outlet regardless of auth state while import.meta.env.DEV is true", () => {
      (import.meta.env as { DEV: boolean }).DEV = true;
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuth>);

      renderAt("/admin");
      expect(screen.getByText("Admin Content")).toBeInTheDocument();
    });
  });

  // alright so all functions are tested. now lets tests branches of the AdminRoute component when import.meta.env.DEV is false
  // first if loading is true, it should render the loading state
  // second if user is null, it should navigate to /login aka no auth
  describe("when import.meta.env.DEV is false", () => {
    it("renders loading state while auth is resolving", () => {
      (import.meta.env as { DEV: boolean }).DEV = false;
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: true,
      } as ReturnType<typeof useAuth>);

      renderAt("/admin");
      expect(screen.getByText("Loading…")).toBeInTheDocument();
    });

    it("navigates to /login if user is not authenticated", () => {
      (import.meta.env as { DEV: boolean }).DEV = false;
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
      } as ReturnType<typeof useAuth>);

      renderAt("/admin");
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("redirects to /dashboard if user's role is a player", () => {
      (import.meta.env as { DEV: boolean }).DEV = false;
      vi.mocked(useAuth).mockReturnValue({
        user: { role: "Player" },
        loading: false,
      } as ReturnType<typeof useAuth>);

      renderAt("/admin");
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });
  });
});
