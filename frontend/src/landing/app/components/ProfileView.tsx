import { useState } from "react";
import { getAchievementIcon } from "../lib/achievementIcons";
import { championIconUrl } from "../lib/ddragon";
import { getMockPlayerProfile } from "../mocks/playerProfile";
import type { PlayerProfile } from "../types/profile";
import {
  DASHBOARD_CONTENT_LEFT_OPEN,
  DASHBOARD_CONTENT_WIDTH_OPEN,
  DASHBOARD_FRAME_W,
} from "../../imports/Group14/Group14";
import FeaturedGameCard from "./FeaturedGameCard";
import ProfileRadarChart from "./ProfileRadarChart";

interface ProfileViewProps {
  readonly profile?: PlayerProfile;
  readonly sidebarOpen?: boolean;
}

export default function ProfileView({
  profile = getMockPlayerProfile(),
  sidebarOpen = true,
}: Readonly<ProfileViewProps>) {
  const [cardExpanded, setCardExpanded] = useState(true);
  const featured = profile.featured_games[0];

  const contentLeft = sidebarOpen ? DASHBOARD_CONTENT_LEFT_OPEN : 0;
  const contentWidth = sidebarOpen ? DASHBOARD_CONTENT_WIDTH_OPEN : DASHBOARD_FRAME_W;

  return (
    <div
      className="absolute top-[94px] transition-[left,width] duration-300 ease-out"
      style={{ left: contentLeft, width: contentWidth, height: 840 }}
      data-name="profile-view"
    >
      <div className="relative h-full overflow-auto px-10 py-8">
        <header className="flex items-center gap-6">
          <div
            className="flex size-[96px] shrink-0 items-center justify-center rounded-full bg-[#404040] font-['Inter:Semi_Bold',sans-serif] text-[28px] font-semibold text-white"
            aria-hidden
          >
            {profile.avatar_initials}
          </div>
          <div>
            <h1 className="font-['Inter:Semi_Bold',sans-serif] text-[28px] font-semibold leading-tight text-[#1e1e1e]">
              {profile.display_name}
            </h1>
            <p className="mt-1 font-['Inter:Regular',sans-serif] text-[16px] text-[#757575]">
              {profile.riot_id_tag}
            </p>
          </div>
        </header>

        <div className="mt-14">
          <p className="mb-6 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-[#525252]">
            Last {profile.matches_sampled} matches
          </p>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(305px,520px)]">
            <section aria-label="Performance radar">
              <ProfileRadarChart metrics={profile.radar_metrics} />
              <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {profile.radar_metrics.map((m) => (
                  <li
                    key={m.key}
                    className="font-['Inter:Regular',sans-serif] text-[12px] text-[#757575]"
                  >
                    <span className="text-[#1e1e1e]">{m.label}</span>: {m.rawLabel}
                  </li>
                ))}
              </ul>
            </section>

            {featured ? (
              <section
                aria-label="Featured game"
                className="flex min-h-[314px] flex-col items-end"
              >
                <div className="transition-[width] duration-300 ease-out">
                  <FeaturedGameCard
                    slide={featured}
                    expanded={cardExpanded}
                    onToggle={() => setCardExpanded((open) => !open)}
                  />
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <section className="mt-12" aria-label="Recent champions">
          <h2 className="mb-4 font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold uppercase tracking-wide text-[#757575]">
            Last played champions
          </h2>
          <div className="flex flex-wrap gap-4">
            {profile.recent_champions.map((champ) => (
              <div
                key={champ.champion_id}
                className="group relative size-[88px] overflow-hidden rounded-[12px] bg-[#404040] shadow-sm"
                title={`${champ.champion_name} · ${champ.games_played} games`}
              >
                <img
                  src={championIconUrl(champ.champion_name)}
                  alt={champ.champion_name}
                  className="size-full object-cover"
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 font-['Inter:Regular',sans-serif] text-[10px] text-white">
                  {champ.games_played}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-label="Achievements">
          <h2 className="mb-4 font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold uppercase tracking-wide text-[#757575]">
            Achievements
          </h2>
          <div className="flex flex-wrap gap-5">
            {profile.achievements.map((a) => {
              const Icon = getAchievementIcon(a.id);
              return (
              <div
                key={a.id}
                className="flex flex-col items-center gap-2"
                title={`${a.description} (${a.source_field})`}
              >
                <div className="relative flex size-[72px] items-center justify-center rounded-full bg-black">
                  {Icon ? (
                    <Icon
                      className="size-8 text-white"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : null}
                  <span className="absolute bottom-0 right-0 flex min-w-[22px] translate-x-1 translate-y-1 items-center justify-center rounded-full bg-[#404040] px-1.5 py-0.5 font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold leading-none text-white ring-2 ring-white">
                    {a.count > 99 ? "99+" : a.count}
                  </span>
                </div>
                <span className="max-w-[80px] text-center font-['Inter:Regular',sans-serif] text-[12px] text-[#525252]">
                  {a.label}
                </span>
              </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
