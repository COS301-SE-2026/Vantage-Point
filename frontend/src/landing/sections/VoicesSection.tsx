import { AnimatedTestimonials } from "@/components/ui/aceternity/animated-testimonials";
import { InfiniteMovingCards } from "@/components/ui/aceternity/infinite-moving-cards";
import SectionHeading from "./SectionHeading";
import { MARQUEE_NOTES, TESTIMONIALS } from "../content";

export default function VoicesSection() {
  return (
    <section id="voices" className="scroll-mt-24 bg-[#05060a] py-24">
      <div className="px-4 sm:px-6">
        <SectionHeading
          eyebrow="From the playtests"
          title="The pattern people notice first"
          blurb="Vantage Point is a capstone project in active development; the quotes below are illustrative scenarios drawn from our playtest scripts, not customer testimonials."
        />
      </div>

      {/* The idle portraits sit at a random ±10° tilt, so their boxes poke past
          the viewport on narrow screens. */}
      <div className="overflow-x-clip">
        <AnimatedTestimonials testimonials={TESTIMONIALS} autoplay />
      </div>

      <div className="mt-4 flex justify-center px-4">
        <InfiniteMovingCards
          items={MARQUEE_NOTES}
          direction="right"
          speed="slow"
        />
      </div>
    </section>
  );
}
