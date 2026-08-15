import type { ReactNode } from "react";
import {
  BentoGrid,
  BentoGridItem,
} from "@/components/ui/aceternity/bento-grid";
import { GlowingEffect } from "@/components/ui/aceternity/glowing-effect";
import { Meteors } from "@/components/ui/aceternity/meteors";
import SectionHeading from "./SectionHeading";

/** Decorative fills for the bento headers — each hints at what the cell does. */
function HeatmapArt() {
  return (
    <div className="relative flex h-full min-h-[7rem] w-full overflow-hidden rounded-xl bg-[#0b0d13]">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute left-[22%] top-[30%] h-24 w-24 rounded-full bg-red-500/30 blur-2xl" />
      <div className="absolute left-[46%] top-[52%] h-16 w-16 rounded-full bg-orange-400/30 blur-xl" />
      <div className="absolute left-[70%] top-[24%] h-20 w-20 rounded-full bg-amber-300/20 blur-2xl" />
      <div className="absolute left-[63%] top-[62%] h-10 w-10 rounded-full bg-red-400/40 blur-lg" />
    </div>
  );
}

function GhostArt() {
  return (
    <div className="relative flex h-full min-h-[7rem] w-full items-center justify-center overflow-hidden rounded-xl bg-[#0b0d13]">
      <div className="absolute inset-0 [background-image:radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative flex items-center gap-10">
        <span className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_18px_4px_rgba(239,68,68,0.45)]" />
        <svg
          viewBox="0 0 80 12"
          className="h-3 w-20 text-cyan-300"
          aria-hidden
          fill="none"
        >
          <path
            d="M0 6h64"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
          <path d="M64 1l10 5-10 5z" fill="currentColor" />
        </svg>
        <span className="h-4 w-4 rounded-full bg-[#e0b46c] shadow-[0_0_18px_4px_rgba(224,180,108,0.45)]" />
      </div>
    </div>
  );
}

function ClusterArt() {
  const dots = [
    [18, 30],
    [26, 38],
    [22, 47],
    [33, 33],
    [58, 62],
    [66, 55],
    [72, 68],
    [61, 72],
    [80, 26],
    [86, 34],
  ];
  return (
    <div className="relative flex h-full min-h-[7rem] w-full overflow-hidden rounded-xl bg-[#0b0d13]">
      <div className="absolute left-[10%] top-[18%] h-24 w-28 rounded-[40%] border border-cyan-400/30 bg-cyan-400/5" />
      <div className="absolute left-[52%] top-[42%] h-24 w-28 rounded-[40%] border border-[#e0b46c]/30 bg-[#e0b46c]/5" />
      {dots.map(([x, y]) => (
        <span
          key={`${String(x)}-${String(y)}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/70"
          style={{ left: `${String(x)}%`, top: `${String(y)}%` }}
        />
      ))}
    </div>
  );
}

function TimelineArt() {
  return (
    <div className="relative flex h-full min-h-[7rem] w-full items-end gap-1 overflow-hidden rounded-xl bg-[#0b0d13] p-4">
      {[38, 52, 30, 66, 44, 88, 58, 72, 40, 62, 34, 78, 48, 56].map(
        (h, index) => (
          <span
            key={`${String(index)}-${String(h)}`}
            className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500/20 to-cyan-300/70"
            style={{ height: `${String(h)}%` }}
          />
        ),
      )}
    </div>
  );
}

function MeteorArt() {
  return (
    <div className="relative flex h-full min-h-[7rem] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-[#0b0d13]">
      <Meteors number={22} className="bg-[#e0b46c]" />
      <p className="relative z-10 text-3xl font-bold text-white/90">k-NN</p>
      <p className="relative z-10 mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        closest winning snapshot
      </p>
    </div>
  );
}

/** A radar-ish read of how a player's tendencies break down. */
function PlaystyleArt() {
  const bars = [
    { label: "Aggro", value: 82 },
    { label: "Roam", value: 46 },
    { label: "Safe", value: 28 },
    { label: "Split", value: 64 },
  ];
  return (
    <div className="flex h-full min-h-[7rem] w-full flex-col justify-center gap-3 rounded-xl bg-[#0b0d13] px-5">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3">
          <span className="w-12 shrink-0 text-[10px] uppercase tracking-widest text-neutral-500">
            {bar.label}
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[#e0b46c] to-cyan-300"
              style={{ width: `${String(bar.value)}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/** The route into a fight, drawn as a path with waypoints. */
function PathArt() {
  return (
    <div className="relative flex h-full min-h-[7rem] w-full items-center justify-center overflow-hidden rounded-xl bg-[#0b0d13]">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] [background-size:26px_26px]" />
      <svg
        viewBox="0 0 220 90"
        className="relative h-24 w-full max-w-[260px]"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 76 C 60 76, 62 20, 110 24 S 172 66, 208 18"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeDasharray="6 6"
          opacity="0.8"
        />
        {[
          [12, 76],
          [110, 24],
          [208, 18],
        ].map(([cx, cy]) => (
          <circle
            key={`${String(cx)}`}
            cx={cx}
            cy={cy}
            r="5"
            fill="#0b0d13"
            stroke="#e0b46c"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}

type Feature = {
  title: string;
  description: string;
  header: ReactNode;
  className: string;
};

const FEATURES: Feature[] = [
  {
    title: "Risk prediction heatmap",
    description:
      "A Random Forest scores every tile you stood on, so the map shades red long before the fight starts.",
    header: <HeatmapArt />,
    className: "md:col-span-2",
  },
  {
    title: "Ghost player overlay",
    description:
      "D3 draws the position a winning player held, with a vector for the step you should have taken.",
    header: <GhostArt />,
    className: "md:col-span-1",
  },
  {
    title: "Recurrent mistake clusters",
    description:
      "K-Means groups your deaths until the pattern you have been repeating all season becomes a shape on the map.",
    header: <ClusterArt />,
    className: "md:col-span-1",
  },
  {
    title: "Second-by-second replay",
    description:
      "Scrub the whole match on a coordinate-accurate timeline. Toggle kills, deaths and movement paths for any of the ten players.",
    header: <TimelineArt />,
    className: "md:col-span-2",
  },
  {
    title: "AI positioning coach",
    description:
      "K-Nearest Neighbours matches your state against professional snapshots and explains the difference in plain language.",
    header: <MeteorArt />,
    className: "md:col-span-1",
  },
  {
    title: "Playstyle categorisation",
    description:
      "Aggressive, passive, split-pushing — the clustering names the way you actually play, then tracks it as it changes.",
    header: <PlaystyleArt />,
    className: "md:col-span-1",
  },
  {
    title: "Engagement pathing",
    description:
      "Every fight becomes a path: where you came from, how long you held, and how far help was when it broke.",
    header: <PathArt />,
    className: "md:col-span-1",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      /* ContainerScroll above reserves a fixed 80rem, which leaves a long tail
         of empty space once its card has finished rotating in. */
      className="relative -mt-24 scroll-mt-24 bg-[#05060a] px-4 py-24 sm:px-6 md:-mt-48"
    >
      <SectionHeading
        eyebrow="What it does"
        title="Seven ways to see the mistake"
        blurb="Vantage Point reads the coordinates the game already records and turns them into things you can act on before the next queue."
      />

      <BentoGrid className="mt-16 md:auto-rows-[21rem]">
        {FEATURES.map((feature) => (
          /* GlowingEffect traces the pointer along a border, so it needs a
             positioned wrapper of its own rather than a slot on the cell. */
          <div
            key={feature.title}
            className={`relative h-full rounded-xl ${feature.className}`}
          >
            <GlowingEffect
              disabled={false}
              glow
              spread={44}
              proximity={72}
              borderWidth={2}
            />
            <BentoGridItem
              title={feature.title}
              /* The cell's own copy is text-xs, which is tight for a display
                 serif; the span nudges it back to a readable size. */
              description={
                <span className="text-[13px] leading-relaxed">
                  {feature.description}
                </span>
              }
              header={feature.header}
              className="relative h-full overflow-hidden border-white/10 bg-[#0a0b10] text-neutral-200 dark:border-white/10 dark:bg-[#0a0b10]"
            />
          </div>
        ))}
      </BentoGrid>
    </section>
  );
}
