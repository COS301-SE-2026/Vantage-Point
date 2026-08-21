import AiRecommendationCard from "./AiRecommendationCard";
import type { ReplayCoachingNote } from "../lib/replayCoaching";

interface AiCoachingCommentsProps {
  readonly notes: readonly ReplayCoachingNote[];
}

/**
 * Figma "AI Coaching comments" 55:346 — the column beside the replay map.
 *
 * Figma sized it 230x516 and filled it with fixed-height cards. It is captioned
 * like every other dashboard panel now (see PanelHeader in dashboard/primitives),
 * and it takes its height from whatever the caller gives it: the replay screen
 * runs it down to the bottom edge of the map, the landing showcase to the bottom
 * of its frame.
 *
 * The notes lay themselves out for the width they are handed rather than for the
 * screen's, since the same panel is half the replay row and a narrow strip in the
 * showcase. Past 420px of content box they pair up, which keeps a line of body
 * copy near a readable measure instead of stretching it across the half-screen.
 */
export default function AiCoachingComments({
  notes,
}: Readonly<AiCoachingCommentsProps>) {
  return (
    <aside
      data-name="AI Coaching comments"
      data-node-id="55:346"
      className="vp-scrollbar @container flex h-full max-h-full w-full flex-col overflow-y-auto rounded-xl border border-vp-line bg-vp-surface p-[12px]"
      aria-label="AI coaching comments"
    >
      <div className="flex items-baseline justify-between gap-2 px-[2px] pb-[10px]">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
          AI Coaching
        </h2>
        {notes.length > 0 ? (
          <span className="text-[11px] tabular-nums text-vp-faint">
            {notes.length}
          </span>
        ) : null}
      </div>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 items-start gap-[8px] @[420px]:grid-cols-2">
          {notes.map((note) => (
            <AiRecommendationCard
              key={note.id}
              heading={note.heading}
              body={note.body}
            />
          ))}
        </div>
      ) : (
        <p className="px-[2px] text-[13px] leading-[17px] text-vp-faint">
          Nothing stood out in this match.
        </p>
      )}
    </aside>
  );
}
