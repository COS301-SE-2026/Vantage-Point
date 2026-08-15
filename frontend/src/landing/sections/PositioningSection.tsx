import { MoveRight } from "lucide-react";
import { Compare } from "@/components/ui/aceternity/compare";
import MatchReplayMenuRow from "../../components/MatchReplayMenuRow";
import imgActual from "../../assets/images/landing/positioning-actual.webp";
import imgOptimal from "../../assets/images/landing/positioning-optimal.webp";
import { SAMPLE_MATCH, SAMPLE_VIEWER } from "../replaySample";

/* The swatches are the marker fills MatchReplayMapOverlay uses, so the key
   reads against the map rather than against a second palette. */
const READING = [
  {
    dot: "bg-vp-faint ring-2 ring-white/80",
    label: "Where you died",
    body: "Five deaths, four of them past the river line with no vision behind you.",
  },
  {
    dot: "bg-[#22d3ee]",
    label: "The correction",
    body: "The vector to the nearest winning snapshot, usually one screen back rather than a different play.",
  },
  {
    dot: "bg-[#e0b46c]",
    label: "The ghost",
    body: "Where a professional in the same state, at the same minute, was actually standing.",
  },
];

export default function PositioningSection() {
  return (
    <section
      id="positioning"
      className="scroll-mt-24 bg-[#05060a] px-4 py-24 sm:px-6"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
            The difference
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl">
            Drag the line.
            <br />
            See the game you should have played.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-neutral-400 md:text-base">
            The same twenty-five minutes, twice. On the left, the positions you
            actually held and the deaths they cost. On the right, the positions
            the model pulled from winning play at the same point in the match.
          </p>

          <ul className="mt-8 space-y-5">
            {READING.map((item) => (
              <li key={item.label} className="flex gap-3">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`}
                  aria-hidden
                />
                <span>
                  <span className="block text-sm font-semibold text-white">
                    {item.label}
                  </span>
                  <span className="block text-sm text-neutral-400">
                    {item.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-neutral-500">
            Drag or hover the handle
            <MoveRight className="h-4 w-4" />
          </p>
        </div>

        <div className="flex justify-center">
          {/* The same card the Match Replay screen draws: the summary row above
              a square map, so the comparison reads as the product rather than a
              pair of loose screenshots. */}
          <div className="flex flex-col gap-[8px] rounded-xl bg-vp-canvas p-[8px] shadow-[0_0_80px_-30px_rgba(224,180,108,0.5)]">
            <MatchReplayMenuRow match={SAMPLE_MATCH} viewer={SAMPLE_VIEWER} />
            <Compare
              firstImage={imgActual}
              secondImage={imgOptimal}
              firstImageClassName="object-cover"
              secondImageClassname="object-cover"
              className="h-[300px] w-[300px] overflow-hidden rounded-[8px] sm:h-[420px] sm:w-[420px] lg:h-[500px] lg:w-[500px]"
              slideMode="drag"
              autoplay
              autoplayDuration={6000}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
