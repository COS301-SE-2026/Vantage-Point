import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import AdminDashboardPage from "../../../pages/admin/AdminDashboardPage";
import * as adminApi from "../../../api/admin";
import { useAuth } from "../../../context/AuthContext";
import type {
  DashboardMetrics,
  ErrorLogEntry,
  SiteTrafficPoint,
} from "../../../types/admin";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);

// mocks
vi.mock("../../../api/admin");
vi.mock("../../../context/AuthContext");

// constants for test data
const metrics: DashboardMetrics = {
  active_users: 10,
  inactive_users: 2,
  matches_last_5_months: 40,
  matches_all_time: 400,
  storage_matches_mb: 100,
  storage_profiles_mb: 20,
  storage_other_mb: 5,
};

const traffic: SiteTrafficPoint[] = [{ month: "July 2026", relative_load: 3 }];

const errors: ErrorLogEntry[] = [
  {
    id: "e1",
    error_code: "404",
    error_message: "File Not Found",
    occurred_at: "2026-07-01T00:00:00Z",
    reviewed: false,
  },
];

// helper function to mock API responses
function renderPage() {
  return render(
    <MemoryRouter>
      <AdminDashboardPage />
    </MemoryRouter>,
  );
}

// testing the AdminDashboardPage component
describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { display_name: "Jane Doe" },
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(adminApi.getDashboardMetrics).mockResolvedValue(metrics);
    vi.mocked(adminApi.getSiteTraffic).mockResolvedValue(traffic);
    vi.mocked(adminApi.getErrorLog).mockResolvedValue(errors);
    vi.mocked(adminApi.markErrorReviewed).mockResolvedValue({
      ...errors[0],
      reviewed: true,
    });
  });

  it("loads and displays metrics", async () => {
    renderPage();

    expect(await screen.findByText("10")).toBeInTheDocument(); // active users
    expect(screen.getByText("2")).toBeInTheDocument(); // inactive users
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("400")).toBeInTheDocument();
  });

  it("renders the error log rows", async () => {
    renderPage();

    expect(await screen.findByText("#404")).toBeInTheDocument();
    expect(screen.getByText("File Not Found")).toBeInTheDocument();
  });

  it("shows an empty state when there are no errors", async () => {
    vi.mocked(adminApi.getErrorLog).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText("No errors logged.")).toBeInTheDocument();
  });

  it("shows an error message when loading fails", async () => {
    vi.mocked(adminApi.getDashboardMetrics).mockRejectedValue(
      new Error("boom"),
    );
    renderPage();

    expect(
      await screen.findByText("Failed to load dashboard."),
    ).toBeInTheDocument();
  });

  it("optimistically toggles reviewed and calls markErrorReviewed", async () => {
    renderPage();
    await screen.findByText("#404");

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await waitFor(() => {
      expect(adminApi.markErrorReviewed).toHaveBeenCalledWith("e1", true);
    });
  });

  it("reverts the checkbox if markErrorReviewed fails", async () => {
    vi.mocked(adminApi.markErrorReviewed).mockRejectedValue(new Error("nope"));
    renderPage();
    await screen.findByText("#404");

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });
});
