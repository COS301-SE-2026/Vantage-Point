import AiRecommendationCard from "./AiRecommendationCard";
import type { ReplayCoachingNote } from "../lib/replayCoaching";

interface AiCoachingCommentsProps {
  readonly notes: readonly ReplayCoachingNote[];
}

/** Figma "AI Coaching comments" 55:346 — 230×516 panel, cards inset 15px from y37. */
export default function AiCoachingComments({
  notes,
}: Readonly<AiCoachingCommentsProps>) {
  return (
    <aside
      data-name="AI Coaching comments"
      data-node-id="55:346"
      className="vp-scrollbar flex max-h-full w-full flex-col gap-3 overflow-y-auto rounded-xl border border-vp-line bg-vp-surface p-4"
      aria-label="AI coaching comments"
    >
      {notes.length > 0 ? (
        notes.map((note) => (
          <AiRecommendationCard
            key={note.id}
            heading={note.heading}
            body={note.body}
            width="100%"
            height={109}
            bodyLines={3}
            arrowBox={30}
            arrowTop={1}
          />
        ))
      ) : (
        <p className="w-full text-[14px] leading-[18px] text-vp-dim">
          No coaching notes for this match.
        </p>
      )}
    </aside>
  );
}
