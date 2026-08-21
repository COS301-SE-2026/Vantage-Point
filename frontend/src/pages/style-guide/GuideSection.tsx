import type { ReactNode } from "react";

type GuideSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  delayMs?: number;
};

/**
 * One band of the guide.
 *
 * The page inherits Beaufort from its root, so nothing in here sets a family.
 * Body copy sits at 15px rather than the Tailwind default: the display serif
 * loses too much at `text-sm` to read as running text.
 */
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
      className="sg-fade-in scroll-mt-24 border-b border-vp-line py-14 md:py-20"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <header className="mb-8 max-w-3xl">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-vp-gold">
          {eyebrow}
        </p>
        <h2
          id={`${id}-heading`}
          className="text-[26px] font-bold leading-tight tracking-tight text-vp-ink md:text-[32px]"
        >
          {title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-vp-dim">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

/** A titled block inside a section. Small caps carry the hierarchy. */
export function SubHeading({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
      {children}
    </h3>
  );
}

/** The guide's own panel, matched to `components/dashboard/primitives.tsx`. */
export function GuidePanel({
  children,
  className = "",
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <div
      className={`rounded-xl border border-vp-line bg-vp-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/** Inline code. Mono, because a token name is not display copy. */
export function Code({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <code className="rounded bg-vp-raised px-1 py-0.5 font-mono text-[12px] text-vp-ink">
      {children}
    </code>
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
] as const;
