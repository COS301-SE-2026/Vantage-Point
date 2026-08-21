import { Check } from "lucide-react";
import { Timeline } from "@/components/ui/aceternity/timeline";
import { PIPELINE_STAGES } from "../content";

export default function PipelineSection() {
  const data = PIPELINE_STAGES.map((stage) => ({
    title: stage.stage,
    content: (
      <div className="rounded-2xl border border-white/10 bg-[#0a0b10] p-6 md:p-8">
        <p className="text-sm leading-relaxed text-neutral-300 md:text-base">
          {stage.blurb}
        </p>
        <ul className="mt-6 space-y-3">
          {stage.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-sm text-neutral-400"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#e0b46c]" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    ),
  }));

  return (
    <section id="pipeline" className="scroll-mt-24 bg-[#05060a]">
      <Timeline
        data={data}
        className="bg-[#05060a] dark:bg-[#05060a]"
        title={
          <>
            <span className="mb-3 block text-[11px] uppercase tracking-[0.24em] text-neutral-500">
              The pipeline
            </span>
            <span className="font-bold">
              What happens between the queue and the insight
            </span>
          </>
        }
        description="FastAPI, PostgreSQL, scikit-learn and D3 — four stages between a finished match and a thing you can change."
      />
    </section>
  );
}
