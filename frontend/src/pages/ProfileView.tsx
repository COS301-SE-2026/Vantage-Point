import { useOutletContext } from "react-router";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import { localChampionIcon } from "../assets/images/champions/icons";
import { championIconUrl } from "../lib/ddragon";
import type { PlayerProfile, RecentChampion } from "../types/profile";
import {
  PageContainer,
  Panel,
  PanelHeader,
  StatTile,
} from "../components/dashboard/primitives";
import FeaturedGameCard from "../components/FeaturedGameCard";
import ProfileRadarChart from "../components/ProfileRadarChart";

interface ProfileViewProps {
  readonly profile?: PlayerProfile;
}

/** Champion tile from Figma 14:593: 88×88, r12, #404040, count badge bottom-right. */
function ChampionTile({ champion }: Readonly<{ champion: RecentChampion }>) {
  const localIcon = localChampionIcon(champion.champion_name);

  return (
    <div
      className="relative size-[88px] shrink-0 overflow-hidden rounded-[12px] bg-vp-raised shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
      title={`${champion.champion_name} · ${champion.games_played} games`}
      data-name={`Image (${champion.champion_name})`}
    >
      <img
        src={localIcon ?? championIconUrl(champion.champion_name)}
        alt={champion.champion_name}
        className="size-full object-cover"
      />
      <span className="absolute bottom-[4px] right-[4px] h-[19px] w-[17.717px] rounded-[4px] bg-[rgba(0,0,0,0.7)] pl-[6px] pt-[0.5px] font-['Arimo','Arial',sans-serif] text-[10px] leading-[15px] text-vp-ink">
        {champion.games_played}
      </span>
    </div>
  );
}

export default function ProfileView({
  profile: profileProp,
}: Readonly<ProfileViewProps> = {}) {
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const profile = profileProp ?? outlet?.profile;

  if (!profile) {
    return (
      <div
        className="px-7 py-6 text-[15px] text-vp-dim"
        data-name="profile-view"
      >
        Loading profile…
      </div>
    );
  }

  const featured = profile.featured_games[0];

  return (
    <div data-name="profile-view">
      <PageContainer className="max-w-[1180px]">
        {/* The radar metrics arrive as 0-100 scores with the real figure in
            rawLabel, so the strip can show both without a second request. */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {profile.radar_metrics.map((metric) => (
            <StatTile
              key={metric.key}
              label={metric.label}
              value={metric.rawLabel}
              sub={`${String(metric.value)} / 100`}
            />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <Panel>
            <PanelHeader
              title={`Last ${String(profile.matches_sampled)} matches`}
              hint="Percentile against your own history"
            />
            <section aria-label="Performance radar" className="h-[300px]">
              <ProfileRadarChart metrics={profile.radar_metrics} />
            </section>
          </Panel>

          {featured ? (
            <section aria-label="Featured game" className="min-w-0">
              <FeaturedGameCard slide={featured} />
            </section>
          ) : null}
        </div>

        <Panel className="mt-5">
          <PanelHeader
            title="Most played champions"
            hint={`${String(profile.recent_champions.length)} champions across the sample`}
          />
          <section
            aria-label="Most played champions"
            data-name="Section - Recent champions"
            className="flex flex-wrap gap-3"
          >
            {profile.recent_champions.map((champion) => (
              <ChampionTile key={champion.champion_id} champion={champion} />
            ))}
          </section>
        </Panel>
      </PageContainer>
    </div>
  );
}
