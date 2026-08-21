import { GuideSection } from "./GuideSection";

const RULES = [
  {
    title: "Button labels",
    good: "Sign in / Link Riot ID / View replay",
    bad: "Click here / Submit / OK",
    note: "Lead with the verb that names the outcome. Three words at most.",
  },
  {
    title: "Error messages",
    good: "We could not reach Riot. Check your connection and try again.",
    bad: "Error 500 / Something went wrong!!!",
    note: "Say what failed, then what to do next. Status codes belong in the console.",
  },
  {
    title: "Empty states",
    good: "No ranked matches yet. Play a game, then refresh to see your timeline.",
    bad: "No data. / N/A",
    note: "Say why the screen is empty and give exactly one next step.",
  },
  {
    title: "Coaching notes",
    good: "You warded the river at 8:20 but rotated bot without it.",
    bad: "Bad map awareness. You need to improve warding.",
    note: "Point at what happened in the match. The player already knows they lost.",
  },
];

export function VoiceSection() {
  return (
    <GuideSection
      id="voice"
      eyebrow="08. Voice"
      title="Voice & tone"
      description="Short, specific, and addressed to a player who is already frustrated. Vantage Point tells you what happened on the map. It does not congratulate you and it does not lecture you."
      delayMs={320}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {RULES.map((rule) => (
          <article
            key={rule.title}
            className="rounded-xl border border-vp-line bg-vp-surface p-5"
          >
            <h4 className="mb-4 text-[15px] font-bold text-vp-ink">
              {rule.title}
            </h4>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-vp-win">
              Prefer
            </p>
            <p className="mb-4 text-[14px] leading-relaxed text-vp-ink">
              {rule.good}
            </p>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-vp-loss">
              Avoid
            </p>
            <p className="mb-4 text-[14px] leading-relaxed text-vp-faint line-through decoration-vp-loss/40">
              {rule.bad}
            </p>
            <p className="border-t border-vp-line pt-3 text-[13px] leading-relaxed text-vp-dim">
              {rule.note}
            </p>
          </article>
        ))}
      </div>
    </GuideSection>
  );
}
