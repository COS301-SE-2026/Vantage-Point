import {
  leagueWildRiftCard,
  leagueWildRiftCover,
} from "../assets/profile";
import type { PlayerProfile, RadarMetric } from "../types/profile";

/**
 * Mock profile built from Match-v5-shaped aggregates.
 * Radar axes map to participant fields averaged over the last N matches:
 * - KDA → kills, deaths, assists
 * - Vision → visionScore, gameDuration
 * - GPM → goldEarned, gameDuration
 * - DPM → totalDamageDealtToChampions, gameDuration
 * - CSPM → totalMinionsKilled + neutralMinionsKilled, gameDuration
 * - Kill Participation → challenges.killParticipation
 */
const RADAR_METRICS: readonly RadarMetric[] = [
  {
    key: "kda",
    label: "KDA",
    value: 72,
    rawLabel: "3.8 avg",
  },
  {
    key: "vision",
    label: "Vision",
    value: 58,
    rawLabel: "1.2/min",
  },
  {
    key: "gpm",
    label: "GPM",
    value: 81,
    rawLabel: "412 GPM",
  },
  {
    key: "dpm",
    label: "DPM",
    value: 76,
    rawLabel: "682 DPM",
  },
  {
    key: "cspm",
    label: "CS/min",
    value: 65,
    rawLabel: "7.4 CS/min",
  },
  {
    key: "kp",
    label: "Kill Part.",
    value: 84,
    rawLabel: "68% KP",
  },
];

export const MOCK_PLAYER_PROFILE: PlayerProfile = {
  display_name: "vele Ndamulelo",
  riot_id_tag: "6lordz",
  avatar_initials: "VN",
  matches_sampled: 20,
  radar_metrics: RADAR_METRICS,
  recent_champions: [
    { champion_id: 222, champion_name: "Jinx", games_played: 8 },
    { champion_id: 103, champion_name: "Ahri", games_played: 5 },
    { champion_id: 64, champion_name: "LeeSin", games_played: 4 },
    { champion_id: 412, champion_name: "Thresh", games_played: 2 },
    { champion_id: 86, champion_name: "Garen", games_played: 1 },
  ],
  achievements: [
    {
      id: "triple-kill",
      label: "Triple",
      description: "Triple kills across sampled matches",
      source_field: "challenges.tripleKills",
      count: 4,
    },
    {
      id: "first-blood",
      label: "First Blood",
      description: "First blood kills",
      source_field: "challenges.firstBloodKill",
      count: 3,
    },
    {
      id: "killing-spree",
      label: "Spree",
      description: "Killing sprees of 3+",
      source_field: "challenges.killingSprees",
      count: 12,
    },
    {
      id: "high-kp",
      label: "Team Fight",
      description: "Matches with 70%+ kill participation",
      source_field: "challenges.killParticipation",
      count: 9,
    },
    {
      id: "vision",
      label: "Ward King",
      description: "Top vision score on team",
      source_field: "challenges.visionScorePerMinute",
      count: 6,
    },
    {
      id: "damage",
      label: "Carry",
      description: "Highest damage to champions on team",
      source_field: "challenges.teamDamagePercentage",
      count: 7,
    },
    {
      id: "turrets",
      label: "Siege",
      description: "Turret takedowns",
      source_field: "challenges.turretTakedowns",
      count: 18,
    },
  ],
  featured_games: [
    {
      game_name: "League Of Legends",
      cover_image_url: leagueWildRiftCover,
      card_image_url: leagueWildRiftCard,
      efficiency_score: 115,
      time_spent_label: "1:04:34:23",
    },
    {
      game_name: "League Of Legends",
      cover_image_url: leagueWildRiftCover,
      card_image_url: leagueWildRiftCard,
      efficiency_score: 98,
      time_spent_label: "0:42:18:05",
    },
  ],
};

export function getMockPlayerProfile(): PlayerProfile {
  return MOCK_PLAYER_PROFILE;
}
