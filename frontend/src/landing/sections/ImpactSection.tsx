import { BackgroundBeamsWithCollision } from "@/components/ui/aceternity/background-beams-with-collision";

const CLAIMS = [
  {
    figure: "18 000",
    unit: "coordinates",
    body: "recorded in a single 30-minute match, and never shown to the player.",
  },
  {
    figure: "0",
    unit: "overlays",
    body: "to install. Vantage Point works from the match history Riot already publishes.",
  },
  {
    figure: "1",
    unit: "question",
    body: "we answer that a scoreboard cannot: where should you have been standing?",
  },
];

export default function ImpactSection() {
  return (
    /* The component ships a light gradient and a fixed height; both are
       overridden here so the band sits flush with the rest of the page. */
    <BackgroundBeamsWithCollision className="h-auto min-h-[34rem] py-24 md:h-auto from-[#05060a] to-[#0a0b10] dark:from-[#05060a] dark:to-[#0a0b10]">
      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold leading-tight text-white md:text-5xl">
          The data was always there.
          <span className="block text-[#e0b46c]">Nobody was reading it.</span>
        </h2>

        <dl className="mt-16 grid gap-10 sm:grid-cols-3">
          {CLAIMS.map((claim) => (
            <div key={claim.unit} className="text-center">
              <dt className="text-4xl font-bold text-white md:text-6xl">
                {claim.figure}
                <span className="mt-1 block text-xs font-medium uppercase tracking-[0.2em] text-[#e0b46c]">
                  {claim.unit}
                </span>
              </dt>
              <dd className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
                {claim.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
