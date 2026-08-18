// This will be used to go through the admin apges and will be based of the USerAccountMenu and DashboardPage to help make it look consistent with the rest of the design

import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import UserAccountMenu from "../../components/UserAccountMenu";
import { useAuth } from "../../context/AuthContext";
import imgLogo from "../../assets/images/logos/logo.webp";

interface AdminShellProps {
  readonly children: ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Users", to: "/admin/users" },
  { label: "Match Data", to: "/admin/matches" },
  { label: "Map Assests", to: "/admin/map-assets" },
  { label: "Champion Assests", to: "/admin/champion-assets" },
  { label: "Settings", to: "/admin/settings" },
] as const;

function accountInitials(name: string | undefined): string {
  if (!name) return "UN";
  const parts = name.trim().split(/\s+/);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "UN"
  );
}

export default function AdminShell({ children }: Readonly<AdminShellProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-white device-dark:bg-[#181818]">
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <picture>
            <source srcSet="/src/assets/images/logos/logo-mark-white.webp" media="(prefers-color-scheme: dark)" />
            <img src={imgLogo} alt="" className="h-10 w-10 object-cover" />
          </picture>
          <span className="font-sarina text-[clamp(18px,1.6vw,24px)] not-italic text-black device-dark:text-white">
            Vantage Point
          </span>
        </div>
        <UserAccountMenu
          onProfileClick={() => navigate("/dashboard/profile")}
          onLogout={handleLogout}
          initials={accountInitials(user?.display_name)}
          avatarUrl={user?.avatar_url}
        />
      </div>

      <div className="flex gap-6 p-6">
        <aside
          className={`flex flex-col rounded-[15px] bg-[rgba(117,117,117,0.12)] device-dark:bg-[#2a2a2a] p-5 transition-[width] duration-200 
            ${sidebarOpen ? "w-64" : "w-16 px-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={
              sidebarOpen ? "Collapse navigation" : "Expand navigation"
            }
            className="mb-4 flex self-end rounded border border-[#c7c8c9] device-dark:border-[#929292] p-1"
          >
            <ChevronLeft
              className={`size-3 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
            />
          </button>

          <nav className="flex flex-1 flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-[10px] bg-white device-dark:bg-[#2a2a2a] px-3 py-3 text-left font-['Inter:Regular',sans-serif] text-[14px] transition-opacity ${
                    isActive
                      ? "font-bold text-[#1e1e1e] device-dark:text-white"
                      : "text-[#1e1e1e] device-dark:text-[#e5e5e5] hover:opacity-80"
                  } ${sidebarOpen ? "" : "hidden"}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                  `rounded-[10px] bg-white device-dark:bg-[#2a2a2a] px-3 py-3 text-left font-['Inter:Regular',sans-serif] text-[14px] transition-opacity ${
                    isActive
                      ? "font-bold text-[#1e1e1e] device-dark:text-white"
                      : "text-[#1e1e1e] device-dark:text-[#e5e5e5] hover:opacity-80"
                  } ${sidebarOpen ? "" : "hidden"}`
                }
              >
                Player Dashboard
              </NavLink>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className={`mt-auto rounded-[10px] px-3 py-3 text-left font-['Inter:Regular',sans-serif] text-[14px] text-[#1e1e1e] device-dark:text-[#e5e5e5] hover:opacity-80 ${
              sidebarOpen ? "" : "hidden"
            }`}
          >
            Log out
          </button>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
