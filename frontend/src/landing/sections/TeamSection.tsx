import { AnimatedTooltip } from "@/components/ui/aceternity/animated-tooltip";
import SectionHeading from "./SectionHeading";
import { TEAM } from "../content";
import imgEpiUse from "../../assets/images/logos/logo-mark-white.webp";

export default function TeamSection() {
  return (
    <section
      id="team"
      className="scroll-mt-24 border-t border-white/10 bg-[#05060a] px-4 py-24 sm:px-6"
    >
      <SectionHeading
        eyebrow="Team F.R.O.S.N"
        title="Five students, one capstone, in partnership with EPI-USE"
        blurb="Built for COS 301 at the University of Pretoria: a spatial intelligence platform taken from Riot's raw match timelines to a coaching dashboard."
      />

      <div className="mt-14 flex flex-row items-center justify-center pr-4">
        <AnimatedTooltip items={TEAM} />
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.18em] text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <img src={imgEpiUse} alt="" aria-hidden className="h-5 w-5" />
          University of Pretoria
        </span>
        <span>COS 301 · 2026</span>
        <span>Sponsored by EPI-USE</span>
      </div>
    </section>
  );
}
