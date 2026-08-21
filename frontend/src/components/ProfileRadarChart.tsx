import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Text } from "recharts";
import type { RadarMetric } from "../types/profile";
import { ChartContainer, type ChartConfig } from "./ui/chart";

interface ProfileRadarChartProps {
  readonly metrics: readonly RadarMetric[];
  readonly className?: string;
}

/**
 * Figma 14:139: 360×320 surface. The outer hexagon measures 193.3×223.2px,
 * i.e. radius 111.6px against recharts' 160px half-height (111.6 / 160).
 */
const RADAR_OUTER_RADIUS = "69.75%";
const RADAR_GRID_STROKE = "var(--vp-chart-grid)";
const RADAR_SERIES_COLOR = "#22c55e";
const RADAR_LABEL_COLOR = "var(--vp-chart-label)";

/** Drop of the bottom label so its text box, not its cap line, meets the tick. */
const BOTTOM_LABEL_OFFSET = 8;

interface RadarTickProps {
  readonly y?: number;
  readonly payload?: { readonly coordinate?: number; readonly value?: string };
}

/**
 * Figma anchors each axis label's text *box* to the tick end (14:157-14:174).
 * Only the label straight below the chart needs the box offset added back.
 */
function RadarAxisTick(props: RadarTickProps) {
  const { y = 0, payload, ...rest } = props;
  const sin = Math.sin(((payload?.coordinate ?? 0) * Math.PI) / 180);
  const atBottom = sin < -0.99;

  return (
    <Text
      {...rest}
      y={atBottom ? y + BOTTOM_LABEL_OFFSET : y}
      fill={RADAR_LABEL_COLOR}
      fontFamily="'Beaufort for LOL', serif"
      fontSize={12}
    >
      {payload?.value}
    </Text>
  );
}

const chartConfig = {
  performance: {
    label: "Performance",
    color: RADAR_SERIES_COLOR,
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
      className={className ?? "aspect-auto h-[320px] w-[360px] max-w-full"}
      data-name="RadarChart"
      data-node-id="14:139"
    >
      {/* Axes run clockwise from the top so they read KDA → Vision → GPM → DPM → CS/min → Kill Part. */}
      <RadarChart
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={RADAR_OUTER_RADIUS}
        startAngle={90}
        endAngle={-270}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <PolarGrid stroke={RADAR_GRID_STROKE} />
        <PolarAngleAxis
          dataKey="metric"
          axisLine={false}
          tickLine={{ stroke: RADAR_GRID_STROKE }}
          tickSize={8}
          tick={<RadarAxisTick />}
        />
        <Radar
          name="Performance"
          dataKey="value"
          stroke={RADAR_SERIES_COLOR}
          fill={RADAR_SERIES_COLOR}
          fillOpacity={0.45}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </RadarChart>
    </ChartContainer>
  );
}
