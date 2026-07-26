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
 * Figma "AI Coaching bar" 32:690 — 569×180 rail on #F0F0F0 with a #DADADA rule,
 * holding three 150×157.5 cards inset 22px from the left on a 38px rhythm.
 *
 * The rule is an inset shadow rather than a border so it stays out of the
 * content box; a border would push every card 1px down and right of Figma.
 */
export default function AiCoachingBar({ tips }: Readonly<AiCoachingBarProps>) {
  return (
    <aside
      data-name="AI Coaching bar"
      data-node-id="32:690"
      className="flex h-[180px] w-[569px] shrink-0 items-start gap-[38px] overflow-x-auto rounded-[5px] bg-[#f0f0f0] px-[22px] pt-[12.6px] shadow-[inset_0_0_0_1px_#dadada]"
      aria-label="AI coaching recommendations"
    >
      {tips.map((tip) => (
        <AiRecommendationCard
          key={tip.id}
          heading={tip.heading}
          body={tip.body}
          width={150}
          height={157.5}
          bodyLines={2}
          arrowBox={31.2305}
          arrowTop={7.5}
        />
      ))}
    </aside>
  );
}
