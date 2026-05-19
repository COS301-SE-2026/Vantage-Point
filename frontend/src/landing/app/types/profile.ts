/**
 * Player profile aggregates derived from Riot Match-v5 participant + challenges fields.
 * Normalized radar values are 0–100 for chart display.
 */

/** One axis on the performance radar (averaged over recent matches). */
export interface RadarMetric {
  readonly key: string;
  readonly label: string;
  /** Display value 0–100 after normalization. */
  readonly value: number;
  /** Raw average for tooltips / future API wiring. */
  readonly rawLabel: string;
}

/** Champion played recently (from participant.championId / championName). */
export interface RecentChampion {
  readonly champion_id: number;
  readonly champion_name: string;
  readonly games_played: number;
}

/**
 * Highlight from Match-v5 `challenges` (e.g. pentaKills, killParticipation milestones).
 * @see https://developer.riotgames.com/apis#match-v5
 */
export interface PlayerAchievement {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** Match-v5 challenges field this maps to. */
  readonly source_field: string;
  readonly count: number;
}

export interface FeaturedGameSlide {
  readonly game_name: string;
  readonly cover_image_url: string;
  readonly efficiency_score: number;
  /** Total time played formatted HH:MM:SS */
  readonly time_spent_label: string;
  readonly tag_primary: string;
  readonly tag_secondary: string;
}

export interface PlayerProfile {
  readonly display_name: string;
  readonly riot_id_tag: string;
  readonly avatar_initials: string;
  readonly radar_metrics: readonly RadarMetric[];
  readonly recent_champions: readonly RecentChampion[];
  readonly achievements: readonly PlayerAchievement[];
  readonly featured_games: readonly FeaturedGameSlide[];
  readonly matches_sampled: number;
}
