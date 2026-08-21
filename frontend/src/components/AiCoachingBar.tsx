import AiRecommendationCard from "./AiRecommendationCard";

export interface CoachingTip {
  readonly id: string;
  readonly heading: string;
  readonly body: string;
}

interface AiCoachingBarProps {
  readonly tips: readonly CoachingTip[];
}

/**
 * Figma "AI Coaching bar" 32:690: the rail of tips beside the Map Analysis minimap.
 *
 * Figma drew it on the light frame, with a #DADADA rule and three 150x157.5 cards
 * on a fixed rhythm. The dashboard is always dark now, so the rule is the shared
 * hairline token, and the cards divide the rail between them instead of sitting at
 * a width their text has to be cut down to fit. The rail keeps no height of its own
 * either: three one-line tips no longer hold open a 180px band.
 */
export default function AiCoachingBar({ tips }: Readonly<AiCoachingBarProps>) {
  return (
    <aside
      data-name="AI Coaching bar"
      data-node-id="32:690"
      className="flex min-w-0 flex-1 gap-[12px] overflow-x-auto rounded-[5px] border border-vp-line bg-vp-surface p-[12px]"
      aria-label="AI coaching recommendations"
    >
      {tips.map((tip) => (
        <AiRecommendationCard
          key={tip.id}
          heading={tip.heading}
          body={tip.body}
          className="min-w-[170px] flex-1"
        />
      ))}
    </aside>
  );
}
