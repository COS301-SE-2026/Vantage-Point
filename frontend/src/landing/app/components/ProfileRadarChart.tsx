import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import type { RadarMetric } from "../types/profile";
import { ChartContainer, type ChartConfig } from "./ui/chart";

interface ProfileRadarChartProps {
  readonly metrics: readonly RadarMetric[];
  readonly className?: string;
}

const chartConfig = {
  performance: {
    label: "Performance",
    color: "#22c55e",
  },
} satisfies ChartConfig;

export default function ProfileRadarChart({
  metrics,
  className,
}: Readonly<ProfileRadarChartProps>) {
  const data = metrics.map((m) => ({
    metric: m.label,
    value: m.value,
    raw: m.rawLabel,
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className={
        className ??
        "mx-auto aspect-square h-[min(100%,320px)] w-full max-w-[360px]"
      }
    >
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke="#d4d4d4" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "#525252", fontSize: 12 }}
        />
        <Radar
          name="Performance"
          dataKey="value"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.45}
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
}
