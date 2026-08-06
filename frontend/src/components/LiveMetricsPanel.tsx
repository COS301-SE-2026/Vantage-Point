import type { LiveMetrics } from "../types/profile";

interface LiveMetricsPanelProps {
  readonly metrics?: LiveMetrics;
  readonly loading?: boolean;
  readonly error?: string | null;
}

const PANEL_CLASS =
  "flex w-full min-w-0 flex-col gap-[8px] rounded-[5px] bg-[#f0f0f0] px-[22px] py-[12px] shadow-[inset_0_0_0_1px_#dadada] device-dark:bg-[#3a3939] device-dark:shadow-[inset_0_0_0_1px_#2c2c2c]";

const HEADING_CLASS =
  "font-['Beaufort_for_LOL',serif] text-[12px] font-bold uppercase tracking-[0.275px] text-[#757575] device-dark:text-[#929292]";

const LABEL_CLASS =
  "font-['Beaufort_for_LOL',serif] text-[10px] font-medium uppercase tracking-[0.275px] text-[#757575] device-dark:text-[#929292]";

const VALUE_CLASS =
  "font-['Beaufort_for_LOL',serif] text-[16px] font-bold text-[#1e1e1e] tabular-nums device-dark:text-white";

function StatTile({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex min-w-[92px] flex-col gap-[2px]">
      <span className={LABEL_CLASS}>{label}</span>
      <span className={VALUE_CLASS}>{value}</span>
    </div>
  );
}

/**
 * Averages over the account's most recent games, read live from Riot by
 * `GET /api/v1/users/me/live-metrics` rather than from the stored match copy —
 * so the numbers here can be fresher than the match list below them.
 */
export default function LiveMetricsPanel({
  metrics,
  loading = false,
  error = null,
}: Readonly<LiveMetricsPanelProps>) {
  if (loading) {
    return (
      <aside className={PANEL_CLASS} aria-label="Live performance metrics">
        <span className={HEADING_CLASS}>Recent form</span>
        <span className="font-['Beaufort_for_LOL',serif] text-[14px] text-[#757575] device-dark:text-[#929292]">
          Reading your recent games from Riot…
        </span>
      </aside>
    );
  }

  if (error || !metrics || metrics.games_analyzed === 0) {
    return (
      <aside className={PANEL_CLASS} aria-label="Live performance metrics">
        <span className={HEADING_CLASS}>Recent form</span>
        <span className="font-['Beaufort_for_LOL',serif] text-[14px] text-[#757575] device-dark:text-[#929292]">
          {error ?? "No recent games available from Riot for this account."}
        </span>
      </aside>
    );
  }

  return (
    <aside className={PANEL_CLASS} aria-label="Live performance metrics">
      <span className={HEADING_CLASS}>
        Recent form · last {metrics.games_analyzed} games
      </span>
      <div className="flex flex-wrap items-start gap-x-[24px] gap-y-[10px]">
        <StatTile label="Win rate" value={metrics.win_rate} />
        <StatTile label="Avg KDA" value={metrics.avg_kda} />
        <StatTile
          label="Kill part."
          value={`${metrics.avg_kill_participation_pct}%`}
        />
        <StatTile label="CS / min" value={`${metrics.avg_cs_per_minute}`} />
        <StatTile
          label="Damage / min"
          value={Math.round(metrics.avg_damage_per_minute).toLocaleString()}
        />
        <StatTile
          label="Gold / min"
          value={Math.round(metrics.avg_gold_per_minute).toLocaleString()}
        />
        <StatTile label="Vision" value={`${metrics.avg_vision_score}`} />
      </div>
    </aside>
  );
}
