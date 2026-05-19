import { useState } from "react";
import { championIconUrl } from "../lib/ddragon";
import { getMockPlayerProfile } from "../mocks/playerProfile";
import type { FeaturedGameSlide, PlayerProfile } from "../types/profile";
import ProfileRadarChart from "./ProfileRadarChart";

interface ProfileViewProps {
  readonly profile?: PlayerProfile;
  readonly sidebarOpen?: boolean;
}

function FeaturedGameCard({ slide }: Readonly<{ slide: FeaturedGameSlide }>) {
  return (
    <div className="flex h-full min-h-[200px] overflow-hidden rounded-[16px] bg-[#2b2b2b] text-white shadow-[0px_4px_12px_rgba(0,0,0,0.15)]">
      <img
        src={slide.cover_image_url}
        alt=""
        className="h-full w-[42%] shrink-0 object-cover"
      />
      <div className="flex flex-1 flex-col justify-center gap-3 px-6 py-5">
        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[20px] font-semibold leading-tight">
          {slide.game_name}
        </h3>
        <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#d4d4d4]">
          Efficiency Score:{" "}
          <span className="font-semibold text-white">{slide.efficiency_score}</span>
        </p>
        <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#d4d4d4]">
          Time Spent:{" "}
          <span className="font-semibold text-white">{slide.time_spent_label}</span>
        </p>
        <div className="mt-1 flex gap-2">
          <span className="rounded-full bg-[#525252] px-3 py-1 font-['Inter:Regular',sans-serif] text-[12px]">
            {slide.tag_primary}
          </span>
          <span className="rounded-full bg-black px-3 py-1 font-['Inter:Regular',sans-serif] text-[12px]">
            {slide.tag_secondary}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProfileView({
  profile = getMockPlayerProfile(),
  sidebarOpen = true,
}: Readonly<ProfileViewProps>) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featured =
    profile.featured_games[featuredIndex] ?? profile.featured_games[0];

  const contentLeft = sidebarOpen ? 372 : 0;
  const contentWidth = sidebarOpen ? 1091 : 1512;

  return (
    <div
      className="absolute top-[94px] transition-[left,width] duration-300 ease-out"
      style={{ left: contentLeft, width: contentWidth, height: 840 }}
      data-name="profile-view"
    >
      <div className="relative h-full overflow-auto px-10 py-8">
        <header className="mb-8 flex items-center gap-6">
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
            <p className="mt-2 font-['Inter:Regular',sans-serif] text-[12px] text-[#a3a3a3]">
              Last {profile.matches_sampled} matches (Match-v5)
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
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
            <section aria-label="Featured game" className="min-h-[220px]">
              <FeaturedGameCard slide={featured} />
              {profile.featured_games.length > 1 ? (
                <div
                  className="mt-4 flex justify-center gap-2"
                  role="tablist"
                  aria-label="Featured games"
                >
                  {profile.featured_games.map((_, i) => (
                    <button
                      key={`featured-dot-${i}`}
                      type="button"
                      role="tab"
                      aria-selected={i === featuredIndex}
                      aria-label={`Game ${i + 1}`}
                      onClick={() => setFeaturedIndex(i)}
                      className={`size-2 rounded-full transition-colors ${
                        i === featuredIndex ? "bg-[#1e1e1e]" : "bg-[#d9d9d9]"
                      }`}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
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
            {profile.achievements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center gap-2"
                title={`${a.description} (${a.source_field})`}
              >
                <div className="flex size-[72px] items-center justify-center rounded-full bg-black font-['Inter:Semi_Bold',sans-serif] text-[13px] font-semibold leading-tight text-white">
                  {a.count > 99 ? "99+" : a.count}
                </div>
                <span className="max-w-[80px] text-center font-['Inter:Regular',sans-serif] text-[12px] text-[#525252]">
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
