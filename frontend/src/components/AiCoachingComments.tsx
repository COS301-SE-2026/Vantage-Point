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
      className="vp-scrollbar flex min-h-[320px] w-full flex-col gap-[36px] overflow-y-auto rounded-[15px] bg-[#f0f0f0] device-dark:bg-[#3a3939] px-[15px] pb-[15px] pt-[24px]"
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
        <p className="w-full font-['Beaufort_for_LOL',serif] text-[14px] leading-[18px] text-[#757575] device-dark:text-[#929292]">
          No coaching notes for this match.
        </p>
      )}
    </aside>
  );
}
