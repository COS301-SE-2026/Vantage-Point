import type { ReactNode } from "react";

type GuideSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  delayMs?: number;
};

export function GuideSection({
  id,
  eyebrow,
  title,
  description,
  children,
  delayMs = 0,
}: GuideSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="sg-fade-in scroll-mt-24 border-b border-border py-14 md:py-20 device-dark:border-[#2c2c2c]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <header className="mb-8 max-w-3xl">
        <p className="mb-2 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground device-dark:text-[#929292]">
          {eyebrow}
        </p>
        <h2
          id={`${id}-heading`}
          className="font-['Inter',sans-serif] text-2xl font-semibold tracking-tight text-[#1e1e1e] md:text-3xl device-dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-3 font-['Inter',sans-serif] text-base leading-relaxed text-[#525252] device-dark:text-[#b7b7b7]">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

export const NAV_ITEMS = [
  { id: "colour", label: "Colour" },
  { id: "typography", label: "Typography" },
  { id: "logo", label: "Logo & Icons" },
  { id: "tokens", label: "Tokens" },
  { id: "components", label: "Components" },
  { id: "layout", label: "Layout" },
  { id: "accessibility", label: "Accessibility" },
  { id: "voice", label: "Voice" },
  { id: "changelog", label: "Changelog" },
] as const;
