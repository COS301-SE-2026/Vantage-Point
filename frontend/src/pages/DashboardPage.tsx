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
import ProfileHeaderEditor from "../components/ProfileHeaderEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { fetchPlayerProfile } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import type { PlayerProfile } from "../types/profile";

function sectionFromPathname(pathname: string): DashboardSection {
  if (pathname.includes("/dashboard/profile")) return "profile";
  if (pathname.includes("/dashboard/replay")) return "replay";
  if (pathname.includes("/dashboard/metrics")) return "metrics";
  if (pathname.includes("/dashboard/help")) return "help";
  return "matches";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<PlayerProfile | undefined>(undefined);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

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
  const isProfileSection = activeSection === "profile";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleAdminClick = useCallback(() => {
    navigate("/admin");
  }, [navigate]);

  const outletContext: DashboardOutletContext = {
    sidebarOpen,
    profile,
    refreshProfile,
  };

  return (
    /* The shell is a flex app layout now, so the page no longer needs the
       fixed-width frame and horizontal scroller the Figma import demanded. */
    <div className="vp-scrollbar min-h-screen w-full bg-vp-canvas">
      <DashboardShell
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
        activeSection={activeSection}
        onMatchesClick={() => navigate("/dashboard/matches")}
        onReplayClick={() => navigate("/dashboard/replay")}
        onProfileClick={() => navigate("/dashboard/profile")}
        onHelpClick={() => navigate("/dashboard/help")}
        onLogout={handleLogout}
        accountInitials={accountInitials}
        accountAvatarUrl={accountAvatarUrl}
        accountName={isProfileSection ? profile?.display_name : undefined}
        accountTag={isProfileSection ? profile?.riot_id_tag : undefined}
        onEditProfileClick={
          profile ? () => setEditProfileOpen(true) : undefined
        }
        userRole={user?.role}
        onAdminClick={handleAdminClick}
      >
        <Outlet context={outletContext} />
      </DashboardShell>

      {profile ? (
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-vp-line bg-vp-surface font-beaufort text-vp-ink sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription className="text-vp-dim">
                Update your display name, Riot ID and profile photo.
              </DialogDescription>
            </DialogHeader>
            <ProfileHeaderEditor
              profile={profile}
              onSaved={refreshProfile}
              forceEditing
              onClose={() => setEditProfileOpen(false)}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
