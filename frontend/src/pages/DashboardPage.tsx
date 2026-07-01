import { useCallback, useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import DashboardShell, {
  type DashboardSection,
} from "../components/DashboardShell";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { fetchPlayerProfile } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import type { PlayerProfile } from "../types/profile";

function sectionFromPathname(pathname: string): DashboardSection {
  return pathname.includes("/dashboard/profile") ? "profile" : "matches";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<PlayerProfile | undefined>(undefined);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(undefined);
      return;
    }
    const data = await fetchPlayerProfile();
    setProfile(data);
  }, [user]);

  const activeSection = sectionFromPathname(location.pathname);

  useEffect(() => {
    const legacyMatch = searchParams.get("match");
    const legacyView = searchParams.get("view");
    if (legacyMatch) {
      navigate(`/dashboard/matches/${encodeURIComponent(legacyMatch)}`, {
        replace: true,
      });
      return;
    }
    if (legacyView === "profile") {
      navigate("/dashboard/profile", { replace: true });
      return;
    }
    if (legacyView === "matches") {
      navigate("/dashboard/matches", { replace: true });
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    let cancelled = false;
    loadProfile().catch(() => {
      if (!cancelled) {
        setProfile(undefined);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    await refreshUser();
    await loadProfile();
  }, [refreshUser, loadProfile]);

  const accountAvatarUrl = profile?.avatar_url ?? user?.avatar_url ?? null;
  const accountInitials = profile?.avatar_initials ?? "VP";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const outletContext: DashboardOutletContext = {
    sidebarOpen,
    profile,
    refreshProfile,
  };

  return (
    <div className="min-h-screen w-full overflow-x-auto bg-white">
      <div className="relative mx-auto w-full min-w-0 max-w-[var(--vp-layout-max)]">
        <DashboardShell
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((open) => !open)}
          activeSection={activeSection}
          onMatchesClick={() => navigate("/dashboard/matches")}
          onProfileClick={() => navigate("/dashboard/profile")}
          onLogout={handleLogout}
          accountInitials={accountInitials}
          accountAvatarUrl={accountAvatarUrl}
        >
          <Outlet context={outletContext} />
        </DashboardShell>
      </div>
    </div>
  );
}
