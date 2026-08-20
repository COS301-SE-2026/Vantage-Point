import { useState } from "react";

interface AiRecommendationCardProps {
  readonly heading: string;
  readonly body: string;
  /** Notes arrive open; a caller with less room can start them closed. */
  readonly defaultOpen?: boolean;
  readonly className?: string;
}

/**
 * One AI coaching note: a heading you can click to fold the note away, and the
 * note itself under it.
 *
 * Figma drew this as a fixed 200x109 (replay) / 150x157.5 (analysis) box with the
 * text centred in it and a Material arrow_drop_down floating over the top right
 * corner. That box clipped anything longer than its line budget and left a band of
 * dead space under anything shorter, so the card sizes to its own text now and the
 * disclosure is the whole heading row rather than a hit target in the corner. The
 * gold tick to the left of the heading is what marks the note as machine-written.
 */
export default function AiRecommendationCard({
  heading,
  body,
  defaultOpen = true,
  className = "",
}: Readonly<AiRecommendationCardProps>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article
      data-name="AI Reccomendation"
      className={`overflow-hidden rounded-lg border border-vp-line bg-vp-raised ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-[8px] border-0 bg-transparent px-[10px] py-[8px] text-left transition-colors hover:bg-vp-line/60"
      >
        <span
          aria-hidden
          className="h-[13px] w-[2px] shrink-0 rounded-full bg-vp-gold"
        />
        <span className="min-w-0 flex-1 text-[13px] font-bold leading-[17px] text-vp-ink">
          {heading}
        </span>
        {/* A rotated corner rather than an icon asset, so the caret picks up the
            text colour and needs no light/dark pair of its own. */}
        <span
          aria-hidden
          className={`size-[6px] shrink-0 border-b-[1.5px] border-r-[1.5px] border-vp-faint transition-transform duration-200 ${
            open ? "translate-y-[1px] rotate-[225deg]" : "rotate-45"
          }`}
        />
      </button>

      {open ? (
        <p className="pb-[10px] pl-[20px] pr-[10px] text-[13px] leading-[17px] text-vp-dim">
          {body}
        </p>
      ) : null}
    </article>
  );
}
