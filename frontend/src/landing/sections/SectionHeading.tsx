import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

/** The shared eyebrow / title / blurb stack every section below the hero uses. */
export default function SectionHeading({
  eyebrow,
  title,
  blurb,
  align = "center",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  blurb?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl",
        align === "center" ? "text-center" : "mx-0 text-left",
        className,
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold leading-tight text-white md:text-5xl">
        {title}
      </h2>
      {blurb ? (
        <p
          className={cn(
            "mt-5 text-sm leading-relaxed text-neutral-400 md:text-base",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {blurb}
        </p>
      ) : null}
    </div>
  );
}
