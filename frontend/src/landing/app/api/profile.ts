import { leagueWildRiftCard, leagueWildRiftCover } from "../assets/profile";
import type {
  FeaturedGameSlide,
  PlayerAchievement,
  PlayerProfile,
  RadarMetric,
  RecentChampion,
} from "../types/profile";
import { apiFetch } from "./client";

const PROFILE_IMAGE_KEYS: Record<string, string> = {
  league_wild_rift_cover: leagueWildRiftCover,
  league_wild_rift_card: leagueWildRiftCard,
};

function resolveImageUrl(key: string): string {
  return PROFILE_IMAGE_KEYS[key] ?? leagueWildRiftCover;
}

interface RadarMetricApi {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly raw_label: string;
}

interface RecentChampionApi {
  readonly champion_id: number;
  readonly champion_name: string;
  readonly games_played: number;
}

interface PlayerAchievementApi {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly source_field: string;
  readonly count: number;
}

interface FeaturedGameSlideApi {
  readonly game_name: string;
  readonly cover_image_key: string;
  readonly card_image_key?: string;
  readonly efficiency_score: number;
  readonly time_spent_label: string;
  readonly win_rate_label: string;
  readonly kda_label: string;
}

interface PlayerProfileApi {
  readonly display_name: string;
  readonly riot_id_tag: string;
  readonly avatar_initials: string;
  readonly avatar_url: string | null;
  readonly matches_sampled: number;
  readonly radar_metrics: RadarMetricApi[];
  readonly recent_champions: RecentChampionApi[];
  readonly achievements: PlayerAchievementApi[];
  readonly featured_games: FeaturedGameSlideApi[];
}

function mapRadar(m: RadarMetricApi): RadarMetric {
  return {
    key: m.key,
    label: m.label,
    value: m.value,
    rawLabel: m.raw_label,
  };
}

function mapFeatured(slide: FeaturedGameSlideApi): FeaturedGameSlide {
  const cover = resolveImageUrl(slide.cover_image_key);
  const card = slide.card_image_key
    ? resolveImageUrl(slide.card_image_key)
    : cover;
  return {
    game_name: slide.game_name,
    cover_image_url: cover,
    card_image_url: card,
    efficiency_score: slide.efficiency_score,
    time_spent_label: slide.time_spent_label,
    win_rate_label: slide.win_rate_label,
    kda_label: slide.kda_label,
  };
}

function mapProfile(body: PlayerProfileApi): PlayerProfile {
  return {
    display_name: body.display_name,
    riot_id_tag: body.riot_id_tag,
    avatar_initials: body.avatar_initials,
    avatar_url: body.avatar_url,
    matches_sampled: body.matches_sampled,
    radar_metrics: body.radar_metrics.map(mapRadar),
    recent_champions: body.recent_champions.map(
      (c): RecentChampion => ({
        champion_id: c.champion_id,
        champion_name: c.champion_name,
        games_played: c.games_played,
      }),
    ),
    achievements: body.achievements.map(
      (a): PlayerAchievement => ({
        id: a.id,
        label: a.label,
        description: a.description,
        source_field: a.source_field,
        count: a.count,
      }),
    ),
    featured_games: body.featured_games.map(mapFeatured),
  };
}

export async function fetchPlayerProfile(): Promise<PlayerProfile> {
  const body = await apiFetch<PlayerProfileApi>("/api/v1/users/me/profile");
  return mapProfile(body);
}
