import LandingNav from "../../sections/LandingNav";
import HeroSection from "../../sections/HeroSection";
import ShowcaseSection from "../../sections/ShowcaseSection";
import WorkflowSection from "../../sections/WorkflowSection";
import PositioningSection from "../../sections/PositioningSection";
import PipelineSection from "../../sections/PipelineSection";
import TeamSection from "../../sections/TeamSection";
import CtaSection from "../../sections/CtaSection";
import LandingFooter from "../../sections/LandingFooter";

/**
 * The marketing page. Each section lives in `src/landing/sections` and is built
 * on the Aceternity UI primitives vendored into
 * `src/components/ui/aceternity`; the copy they render comes from
 * `src/landing/content.ts`.
 */
export default function Landing() {
  return (
    <div className="relative w-full">
      <LandingNav />
      <main>
        <HeroSection />
        <ShowcaseSection />
        <WorkflowSection />
        <PositioningSection />
        <PipelineSection />
        <TeamSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
