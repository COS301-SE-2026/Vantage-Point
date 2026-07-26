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
      className="flex h-[516px] w-[230px] shrink-0 flex-col gap-[52px] overflow-y-auto rounded-[15px] bg-[#f0f0f0] px-[15px] pb-[15px] pt-[37px]"
      aria-label="AI coaching comments"
    >
      {notes.length > 0 ? (
        notes.map((note) => (
          <AiRecommendationCard
            key={note.id}
            heading={note.heading}
            body={note.body}
            width={200}
            height={109}
            bodyLines={3}
            arrowBox={30}
            arrowTop={1}
          />
        ))
      ) : (
        <p className="w-[200px] font-['Beaufort_for_LOL',serif] text-[14px] leading-[18px] text-[#757575]">
          No coaching notes for this match.
        </p>
      )}
    </aside>
  );
}
