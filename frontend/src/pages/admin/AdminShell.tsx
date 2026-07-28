// This will be used to go through the admin apges and will be based of the USerAccountMenu and DashboardPage to help make it look consistent with the rest of the design

import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import UserAccountMenu from "../../components/UserAccountMenu";
import { useAuth } from "../../context/AuthContext";
import imgLogo from "../../assets/images/logos/logo.webp";
import { resolveAvatarUrl } from "@/lib/avatarUrl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 
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


// NOTE : Direct copy from frontend\src\components\UserAccountMenu.tsx
function ProfileAvatar({
  initials,
  avatarUrl,
}: Readonly<{ initials: string; avatarUrl?: string | null }>) {
  const src = resolveAvatarUrl(avatarUrl ?? undefined);

  if (src) {
    return (
      <Avatar className="size-[48px]">
        <AvatarImage src={src} alt="" className="object-cover" />
        <AvatarFallback className="bg-[#d9d9d9] font-['Sora:Regular',sans-serif] text-[14px] text-[#0a0a0a]">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="relative size-[48px] shrink-0">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle cx="24" cy="24" fill="#D9D9D9" r="24" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-['Sora:Regular',sans-serif] text-[14px] font-normal leading-normal tracking-[-0.28px] text-[#0a0a0a]">
        {initials}
      </span>
    </div>
  );
}


export default function AdminShell({ children }: Readonly<AdminShellProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
 
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <img src={imgLogo} alt="" className="h-10 w-10 object-cover" />
          <span className="font-sarina text-[clamp(18px,1.6vw,24px)] not-italic text-black">
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
    </div>
  );
}
