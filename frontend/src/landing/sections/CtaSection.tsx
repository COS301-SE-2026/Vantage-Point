import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { LampContainer } from "@/components/ui/aceternity/lamp";
import { Button as MovingBorderButton } from "@/components/ui/aceternity/moving-border";

export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <section id="start" className="scroll-mt-24">
      <LampContainer
        /* The lamp reads its glow and backdrop from these two variables so it
           lands on the Vantage Point gold instead of the stock cyan. */
        className="min-h-[34rem] rounded-none [--lamp-bg:#05060a] [--lamp-color:#e0b46c] md:min-h-[38rem]"
      >
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <h2 className="bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl">
            Stop guessing.
            <br />
            Start reading the map.
          </h2>
          <p className="mt-6 max-w-lg text-center text-sm text-neutral-400 md:text-base">
            Link your Riot ID and your last match is analysed in under a minute.
            Free while we are in beta.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <MovingBorderButton
              as="button"
              onClick={() => navigate("/register")}
              borderRadius="1.75rem"
              containerClassName="h-14 w-56"
              borderClassName="bg-[radial-gradient(#e0b46c_40%,transparent_60%)]"
              className="border-white/10 bg-[#0a0b10]/90 text-sm font-semibold tracking-wide"
            >
              <span className="inline-flex items-center gap-2">
                Create an account
                <ArrowRight className="h-4 w-4" />
              </span>
            </MovingBorderButton>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-full border border-white/15 px-7 py-3 text-sm font-semibold tracking-wide text-neutral-300 transition hover:border-white/35 hover:text-white"
            >
              Log in
            </button>
          </div>
        </motion.div>
      </LampContainer>
    </section>
  );
}
