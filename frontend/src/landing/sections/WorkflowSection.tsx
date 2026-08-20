import { StickyScroll } from "@/components/ui/aceternity/sticky-scroll-reveal";
import SectionHeading from "./SectionHeading";
import { WORKFLOW_STEPS } from "../content";

/** Panels that ride along on the right of the sticky scroller. */
function StepPanel({ index, caption }: { index: number; caption: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-6xl font-bold text-white/90">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-xs uppercase tracking-[0.2em] text-white/80">
        {caption}
      </span>
    </div>
  );
}

const PANEL_CAPTIONS = [
  "Connect",
  "Reconstruct",
  "Diagnose",
  "Correct",
] as const;

export default function WorkflowSection() {
  const content = WORKFLOW_STEPS.map((step, index) => ({
    title: step.title,
    description: step.description,
    content: <StepPanel index={index} caption={PANEL_CAPTIONS[index]} />,
  }));

  return (
    <section
      id="workflow"
      /* ShowcaseSection's ContainerScroll above reserves a fixed 80rem, which
         leaves a long tail of empty space once its card has finished rotating
         in; the negative margin pulls this section back up into it. */
      className="relative -mt-24 scroll-mt-24 bg-[#05060a] px-4 py-24 sm:px-6 md:-mt-48"
    >
      <SectionHeading
        eyebrow="How it works"
        title="From sign-in to correction in four steps"
        blurb="No client mod, no overlay running while you play. Everything happens after the game, from data Riot already gives you."
      />

      <div className="mx-auto mt-14 max-w-6xl overflow-hidden rounded-2xl border border-white/10">
        <StickyScroll
          content={content}
          contentClassName="border border-white/10"
          backgroundColors={["#05060a", "#0a0b10", "#080a12"]}
          linearGradients={[
            "linear-gradient(to bottom right, #e0b46c, #8a5a1c)",
            "linear-gradient(to bottom right, #22d3ee, #0e5f74)",
            "linear-gradient(to bottom right, #e0b46c, #22d3ee)",
          ]}
        />
      </div>
    </section>
  );
}
