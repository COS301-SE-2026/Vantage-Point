import { useState } from "react";
import {
  iconArrowDropDown,
  iconArrowDropDownDark,
} from "../assets/images/match-replay";
import ThemedIcon from "./ThemedIcon";

/**
 * Figma "AI Reccomendation" — 55:348 on the replay panel (200×109) and 32:458 on
 * the Map Analysis page (150×157.5). Both are the same Simple DS
 * "Text Content Heading": a vertically centred block of a 22px centred heading,
 * an 8px gap and an 18px-per-line subheading, inset 6px, with a Material
 * arrow_drop_down pinned to the top right.
 */
interface AiRecommendationCardProps {
  readonly heading: string;
  readonly body: string;
  /** Card box — Figma gives 200×109 (replay) and 150×157.5 (analysis); the
   *  replay panel is fluid now, so it passes a percentage instead. */
  readonly width: number | string;
  readonly height: number;
  /** Subheading block height is bodyLines × 18. */
  readonly bodyLines: number;
  /** arrow_drop_down instance box; the glyph is 12.5×6.25 at a 30px box. */
  readonly arrowBox: number;
  readonly arrowTop: number;
}

const ARROW_LEAF_WIDTH_AT_30 = 12.5;
const ARROW_LEAF_HEIGHT_AT_30 = 6.25;
const TEXT_INSET = 6;
const HEADING_HEIGHT = 22;
const HEADING_GAP = 8;
const BODY_LINE_HEIGHT = 18;

export default function AiRecommendationCard({
  heading,
  body,
  width,
  height,
  bodyLines,
  arrowBox,
  arrowTop,
}: Readonly<AiRecommendationCardProps>) {
  const [open, setOpen] = useState(true);

  const arrowScale = arrowBox / 30;
  const bodyHeight = bodyLines * BODY_LINE_HEIGHT;
  const collapsedHeight = HEADING_HEIGHT + HEADING_GAP * 2 + arrowTop * 2;

  return (
    <article
      data-name="AI Reccomendation"
      className="relative shrink-0 rounded-xl border border-vp-line bg-vp-raised"
      style={{ width, height: open ? height : collapsedHeight }}
    >
      <div
        className="flex h-full flex-col justify-center"
        style={{
          paddingLeft: TEXT_INSET,
          paddingRight: TEXT_INSET,
          gap: HEADING_GAP,
        }}
      >
        <h3
          className="text-center text-[15px] font-bold text-vp-ink"
          style={{ lineHeight: `${HEADING_HEIGHT}px` }}
        >
          {heading}
        </h3>
        {open ? (
          <p
            className="overflow-hidden text-[14px] text-vp-dim"
            style={{ height: bodyHeight, lineHeight: `${BODY_LINE_HEIGHT}px` }}
          >
            {body}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} ${heading}`}
        data-name="arrow_drop_down"
        className="absolute flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-colors hover:bg-vp-line"
        style={{ width: arrowBox, height: arrowBox, top: arrowTop, right: 1 }}
      >
        <ThemedIcon
          light={iconArrowDropDown}
          dark={iconArrowDropDownDark}
          width={ARROW_LEAF_WIDTH_AT_30 * arrowScale}
          height={ARROW_LEAF_HEIGHT_AT_30 * arrowScale}
          className={open ? "" : "rotate-180"}
        />
      </button>
    </article>
  );
}
