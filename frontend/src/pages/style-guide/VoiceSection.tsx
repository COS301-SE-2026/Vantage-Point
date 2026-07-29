import { GuideSection } from "./GuideSection";

const RULES = [
  {
    title: "Button labels",
    good: "Sign in / Link Riot ID / View match",
    bad: "Click here / Submit / OK",
    note: "Lead with the verb that describes the outcome. Keep under ~3 words when possible.",
  },
  {
    title: "Error messages",
    good: "We couldn’t reach Riot. Check your connection and try again.",
    bad: "Error 500 / Something went wrong!!!",
    note: "Say what failed and what to do next. Avoid raw status codes in UI copy.",
  },
  {
    title: "Empty states",
    good: "No ranked matches yet. Play a game, then refresh to see your timeline.",
    bad: "No data. / N/A",
    note: "Say why the screen is empty and give one next step.",
  },
];

export function VoiceSection() {
  return (
    <GuideSection
      id="voice"
      eyebrow="08. Voice"
      title="Voice & tone"
      description="Rules for UI copy: short, clear, and direct. Help the player. Don't hype them."
      delayMs={320}
    >
      <div className="mb-6 rounded-lg border border-border bg-muted/40 p-5 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7] device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a]">
        <p>
          <strong className="font-semibold text-[#1e1e1e] device-dark:text-white">Tone:</strong>{" "}
          plain language, no slang dump. Do not blame the player. Say what
          happened in the match and what to do next.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {RULES.map((rule) => (
          <article
            key={rule.title}
            className="rounded-lg border border-border p-5 font-['Inter',sans-serif] device-dark:border-[#2c2c2c]"
          >
            <h3 className="mb-3 text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
              {rule.title}
            </h3>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#1e7e34]">
              Prefer
            </p>
            <p className="mb-3 text-sm text-[#1e1e1e] device-dark:text-white">{rule.good}</p>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#c44a4a]">
              Avoid
            </p>
            <p className="mb-3 text-sm text-[#525252] line-through decoration-[#c44a4a]/40 device-dark:text-[#b7b7b7]">
              {rule.bad}
            </p>
            <p className="text-xs text-[#525252] device-dark:text-[#b7b7b7]">{rule.note}</p>
          </article>
        ))}
      </div>
    </GuideSection>
  );
}
