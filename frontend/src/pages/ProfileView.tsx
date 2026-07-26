import { useOutletContext } from "react-router";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { localChampionIcon } from "../assets/images/champions/icons";
import { championIconUrl } from "../lib/ddragon";
import type { PlayerProfile, RecentChampion } from "../types/profile";
import {
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import FeaturedGameCard from "../components/FeaturedGameCard";
import ProfileRadarChart from "../components/ProfileRadarChart";

interface ProfileViewProps {
  readonly profile?: PlayerProfile;
  readonly sidebarOpen?: boolean;
}

/** Section heading — Figma 14:475 / 14:591 (Beaufort Bold, 0.35 tracking, caps). */
const SECTION_HEADING_CLASS =
  "font-['Beaufort_for_LOL',serif] font-bold uppercase tracking-[0.35px] text-[#1e1e1e]";

/** Champion tile — Figma 14:593: 88×88, r12, #404040, count badge bottom-right. */
function ChampionTile({ champion }: Readonly<{ champion: RecentChampion }>) {
  const localIcon = localChampionIcon(champion.champion_name);

  return (
    <div
      className="relative size-[88px] shrink-0 overflow-hidden rounded-[12px] bg-[#404040] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
      title={`${champion.champion_name} · ${champion.games_played} games`}
      data-name={`Image (${champion.champion_name})`}
    >
      <img
        src={localIcon ?? championIconUrl(champion.champion_name)}
        alt={champion.champion_name}
        className="size-full object-cover"
      />
      <span className="absolute bottom-[4px] right-[4px] h-[19px] w-[17.717px] rounded-[4px] bg-[rgba(0,0,0,0.7)] pl-[6px] pt-[0.5px] font-['Arimo','Arial',sans-serif] text-[10px] leading-[15px] text-white">
        {champion.games_played}
      </span>
    </div>
  );
}

export default function ProfileView({
  profile: profileProp,
  sidebarOpen: sidebarOpenProp,
}: Readonly<ProfileViewProps> = {}) {
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const profile = profileProp ?? outlet?.profile;
  const sidebarOpen = sidebarOpenProp ?? outlet?.sidebarOpen ?? true;

  const contentStyle = getDashboardContentStyle(sidebarOpen);

  if (!profile) {
    return (
      <div
        className="absolute top-[var(--vp-dashboard-header)] min-w-0 px-10 py-8 font-['Inter',sans-serif] text-[16px] text-[#757575] transition-[left,width] duration-300 ease-out"
        style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
        data-name="profile-view"
      >
        Loading profile…
      </div>
    );
  }

  const featured = profile.featured_games[0];

  return (
    <div
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="profile-view"
      data-node-id="14:648"
    >
      {/* Content column starts at Figma x=248 / y=125, i.e. flush left, 31px below the header. */}
      <div className="vp-scrollbar relative h-full overflow-auto px-0 pb-8 pt-[31px]">
        <div
          className="relative w-[806px] max-w-full"
          data-name="Paragraph"
          data-node-id="14:474"
        >
          {/* Radar + featured card row — Figma 14:474, 348px tall (heading top → radar bottom). */}
          <div className="relative h-[348px]">
            <p
              className={`absolute left-0 top-[-2.5px] h-[24px] text-[16px] leading-[24px] whitespace-nowrap ${SECTION_HEADING_CLASS}`}
              data-node-id="14:475"
            >
              Last {profile.matches_sampled} matches
            </p>

            <section
              aria-label="Performance radar"
              className="absolute left-0 top-[28px] h-[320px] w-[360px]"
              data-name="Surface"
              data-node-id="14:140"
            >
              <ProfileRadarChart metrics={profile.radar_metrics} />
            </section>

            {featured ? (
              <section
                aria-label="Featured game"
                className="absolute left-[360px] top-[24px]"
              >
                <FeaturedGameCard slide={featured} />
              </section>
            ) : null}
          </div>

          <section
            className="mt-[32px]"
            aria-label="Most played champions"
            data-name="Section - Recent champions"
            data-node-id="14:589"
          >
            <h2
              className={`h-[21px] text-[14px] leading-[21px] whitespace-nowrap ${SECTION_HEADING_CLASS}`}
              data-node-id="14:591"
            >
              Most played champions
            </h2>
            <div
              className="mt-[16px] flex w-[505px] max-w-full flex-wrap gap-[16px]"
              data-node-id="14:592"
            >
              {profile.recent_champions.map((champion) => (
                <ChampionTile key={champion.champion_id} champion={champion} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
