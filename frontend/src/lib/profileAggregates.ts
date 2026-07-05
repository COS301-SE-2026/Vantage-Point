import type { FeaturedGameSlide } from "../types/profile";

/**
 * Shape returned when aggregating Match-v5 participant rows for a featured-game banner.
 * Wire these from the API over the same `matches_sampled` window as radar metrics.
 */
export interface FeaturedGamePerformanceAggregate {
  readonly wins: number;
  readonly losses: number;
  readonly averageKda: number;
}

/** Formats win rate for the expanded game banner (participant.win over last N). */
export function formatWinRateLabel(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) {
    return "—";
  }
  const pct = Math.round((wins / total) * 100);
  return `${pct}% (${wins}W / ${losses}L)`;
}

/** Formats average KDA for the banner ((kills + assists) / max(deaths, 1)). */
export function formatKdaLabel(averageKda: number): string {
  return `${averageKda.toFixed(1)} avg`;
}

/** Maps backend aggregates into banner display fields. */
export function toFeaturedGamePerformanceLabels(
  aggregate: FeaturedGamePerformanceAggregate,
): Pick<FeaturedGameSlide, "win_rate_label" | "kda_label"> {
  return {
    win_rate_label: formatWinRateLabel(aggregate.wins, aggregate.losses),
    kda_label: formatKdaLabel(aggregate.averageKda),
  };
}
