import type { ReactNode } from "react";
import { motion } from "motion/react";
import { PanelLeft, History, Clapperboard, LogOut } from "lucide-react";
import { Sidebar, DesktopSidebar, useSidebar } from "./ui/aceternity/sidebar";
import { cn } from "./ui/utils";
import UserAccountMenu from "./UserAccountMenu";
import {
  DASHBOARD_RAIL_WIDTH,
  DASHBOARD_SIDEBAR_WIDTH,
} from "../lib/dashboardLayout";
import imgLogoWhite from "../assets/images/logos/logo-mark-white.webp";

export type DashboardSection = "matches" | "replay" | "metrics" | "profile";

interface DashboardShellProps {
  readonly children: ReactNode;
  readonly sidebarOpen: boolean;
  readonly onSidebarToggle: () => void;
  readonly activeSection?: DashboardSection;
  readonly onLogout?: () => void;
  readonly onMatchesClick?: () => void;
  readonly onReplayClick?: () => void;
  readonly onProfileClick?: () => void;
  readonly accountInitials?: string;
  readonly accountAvatarUrl?: string | null;
  /** Shown beside the avatar on the Profile section only. */
  readonly accountName?: string;
  readonly accountTag?: string;
  readonly onEditProfileClick?: () => void;
}

/** What the header calls each section, so the page always says where it is. */
const SECTION_TITLES: Record<DashboardSection, string> = {
  matches: "Match history",
  replay: "Match replay",
  metrics: "Map analysis",
  profile: "Profile",
};

/**
 * A rail row. Aceternity's own `SidebarLink` is an anchor; these are buttons so
 * they keep the router in charge of navigation and can carry `aria-current`.
 */
function RailButton({
  label,
  icon,
  active = false,
  onClick,
  tone = "default",
}: Readonly<{
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: "default" | "quiet";
}>) {
  const { open } = useSidebar();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={open ? undefined : label}
      className={cn(
        "group/rail relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left transition-colors",
        active
          ? "bg-vp-raised text-vp-ink"
          : tone === "quiet"
            ? "text-vp-faint hover:bg-vp-raised/70 hover:text-vp-dim"
            : "text-vp-dim hover:bg-vp-raised/70 hover:text-vp-ink",
      )}
    >
      {/* The active marker is a rule against the rail edge, not a filled pill, so
          it survives the collapse to icons without becoming a blob. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-vp-gold transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center",
          active && "text-vp-gold",
        )}
      >
        {icon}
      </span>
      <motion.span
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="truncate whitespace-nowrap text-[14px]"
      >
        {label}
      </motion.span>
    </button>
  );
}

function Wordmark() {
  const { open } = useSidebar();
  return (
    <div className="flex h-12 items-center gap-2.5 px-3">
      <img
        src={imgLogoWhite}
        alt=""
        aria-hidden
        className="h-7 w-7 shrink-0 object-contain"
      />
      <motion.span
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="truncate whitespace-nowrap font-spartan text-[14px] font-bold uppercase tracking-[0.06em] text-vp-ink"
      >
        Vantage Point
      </motion.span>
    </div>
  );
}

const RAIL_ICON = "size-[18px]";

export default function DashboardShell({
  children,
  sidebarOpen,
  onSidebarToggle,
  activeSection = "matches",
  onLogout,
  onMatchesClick,
  onReplayClick,
  onProfileClick,
  accountInitials = "UN",
  accountAvatarUrl = null,
  accountName,
  accountTag,
  onEditProfileClick,
}: Readonly<DashboardShellProps>) {
  return (
    <div className="flex min-h-screen w-full bg-vp-canvas font-beaufort text-vp-ink">
      <Sidebar open={sidebarOpen} setOpen={onSidebarToggle}>
        {/* Upstream expands the rail on hover. Here the toggle in the header is
            the only thing that opens it, so the mouse handlers are cleared and
            the widths come from the shell's own measurements. */}
        <DesktopSidebar
          id="dashboard-sidebar"
          onMouseEnter={undefined}
          onMouseLeave={undefined}
          animate={{
            width: sidebarOpen ? DASHBOARD_SIDEBAR_WIDTH : DASHBOARD_RAIL_WIDTH,
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="sticky top-0 flex h-screen flex-col gap-1 overflow-hidden border-r border-vp-line bg-vp-surface px-3 py-4"
        >
          <Wordmark />

          <nav
            aria-label="Dashboard navigation"
            className="mt-4 flex flex-1 flex-col gap-1"
          >
            <RailButton
              label="Matches"
              icon={<History className={RAIL_ICON} strokeWidth={1.7} />}
              active={activeSection === "matches"}
              onClick={onMatchesClick}
            />
            <RailButton
              label="Match Replay"
              icon={<Clapperboard className={RAIL_ICON} strokeWidth={1.7} />}
              active={activeSection === "replay"}
              onClick={onReplayClick}
            />

            {/* Log out sits in the same landmark as the destinations: it is how
                you leave the dashboard, and the rail is where you look for it. */}
            <div className="mt-auto pt-4">
              <RailButton
                label="Log out"
                icon={<LogOut className={RAIL_ICON} strokeWidth={1.7} />}
                onClick={onLogout}
                tone="quiet"
              />
            </div>
          </nav>
        </DesktopSidebar>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-vp-line bg-vp-canvas/85 px-5 backdrop-blur-md sm:px-7">
          <button
            type="button"
            onClick={onSidebarToggle}
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
            aria-label={
              sidebarOpen
                ? "Collapse navigation panel"
                : "Expand navigation panel"
            }
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-vp-faint transition-colors hover:bg-vp-raised hover:text-vp-ink"
          >
            <PanelLeft
              className={cn(
                "size-[18px] transition-transform duration-200",
                !sidebarOpen && "rotate-180",
              )}
              strokeWidth={1.7}
            />
          </button>

          <h1 className="min-w-0 truncate text-[15px] font-medium tracking-[0.01em] text-vp-ink">
            {SECTION_TITLES[activeSection]}
          </h1>

          <div className="ml-auto flex min-w-0 items-center gap-3">
            {accountName ? (
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-[14px] font-medium leading-tight text-vp-ink">
                  {accountName}
                </p>
                {accountTag ? (
                  <p className="truncate text-[12px] leading-tight text-vp-faint">
                    {accountTag}
                  </p>
                ) : null}
              </div>
            ) : null}
            <UserAccountMenu
              onProfileClick={onProfileClick}
              onEditProfileClick={onEditProfileClick}
              onLogout={onLogout}
              initials={accountInitials}
              avatarUrl={accountAvatarUrl}
              size={36}
            />
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
