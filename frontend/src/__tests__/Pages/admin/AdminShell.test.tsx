import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import AdminShell from "../../../pages/admin/AdminShell";
import { useAuth } from "../../../context/AuthContext";


vi.mock("../../../context/AuthContext");
 
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});
 

// Helper function to render the AdminShell component with a given user and loading state
function renderShell() {
  return render(
    <MemoryRouter>
      <AdminShell>
        <p>Page Content</p>
      </AdminShell>
    </MemoryRouter>,
  );
}


// testing the AdminShell component
describe("AdminShell", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        vi.mocked(useAuth).mockReturnValue({
            user: { display_name: "John Doe", avatar_url: null },
            logout: vi.fn(),
        }  as unknown as ReturnType<typeof useAuth>);
    });
    
    it("renders the brand, nav items, and the children passed to it", () => {
        renderShell();
        
        expect(screen.getByText("Vantage Point")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByText("Match Data")).toBeInTheDocument();
        expect(screen.getByText("Map Assests")).toBeInTheDocument();
        expect(screen.getByText("Champion Assests")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
    });
    
    it("shows initials derived from the user's display name", () => {
        renderShell();
        expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("falls back to 'UN' initials when there is no user", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: undefined,
            logout: vi.fn(),
        } as unknown as ReturnType<typeof useAuth>);
 
        renderShell();
        expect(screen.getByText("UN")).toBeInTheDocument();
    });

    it("collapses and expands the sidebar when the toggle button is clicked", () => {
        renderShell();
    
        const toggle = screen.getByLabelText("Collapse navigation");
        fireEvent.click(toggle);
        expect(screen.getByLabelText("Expand navigation")).toBeInTheDocument();
    
        fireEvent.click(screen.getByLabelText("Expand navigation"));
        expect(screen.getByLabelText("Collapse navigation")).toBeInTheDocument();
    });



});