import { ContainerScroll } from "@/components/ui/aceternity/container-scroll-animation";
import { PointerHighlight } from "@/components/ui/aceternity/pointer-highlight";
import imgShowcase from "../../assets/images/landing/showcase-replay.webp";

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="scroll-mt-24 bg-[#05060a]">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center">
            <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-neutral-500">
              The dashboard
            </p>
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Your match, replayed as
            </h2>
            <div className="mt-2 flex justify-center text-3xl font-bold md:text-5xl">
              <PointerHighlight
                rectangleClassName="border-[#e0b46c]/60"
                pointerClassName="text-[#e0b46c]"
                containerClassName="mx-auto"
              >
                <span className="relative z-10 px-2 text-[#e0b46c]">
                  a map, not a scoreboard
                </span>
              </PointerHighlight>
            </div>
            <p className="mx-auto mt-6 max-w-xl text-sm text-neutral-400 md:text-base">
              Scrub the timeline, toggle kills, deaths and paths, and watch the
              analysis land on the exact tile where the fight was decided.
            </p>
          </div>
        }
      >
        <img
          src={imgShowcase}
          alt="Vantage Point match replay: the Summoner's Rift map with kill, death and path overlays alongside the player list"
          draggable={false}
          className="mx-auto h-full w-full rounded-2xl object-cover object-left-top"
        />
      </ContainerScroll>
    </section>
  );
}
