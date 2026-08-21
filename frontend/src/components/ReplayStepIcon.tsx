/**
 * Skip glyphs, drawn rather than exported: a bar and a triangle need no asset.
 *
 * Both replay transports use them — the row over the map on the replay screen and
 * the one under the analysis table — so the same step reads the same on both.
 */
export default function ReplayStepIcon({
  direction,
  size = 15,
}: Readonly<{ direction: "back" | "forward"; size?: number }>) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
      className={direction === "back" ? "" : "-scale-x-100"}
    >
      <rect x={2.6} y={3} width={1.9} height={10} rx={0.95} />
      <path d="M13.4 3.6 V12.4 L6.4 8 Z" />
    </svg>
  );
}
