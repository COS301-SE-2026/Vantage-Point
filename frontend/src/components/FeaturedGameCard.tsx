import {
  iconEfficiencyScore,
  iconEfficiencyScoreWhite,
  iconKda,
  iconKdaWhite,
  iconTimeSpent,
  iconTimeSpentWhite,
  iconWinRate,
  iconWinRateWhite,
} from "../assets/images/profile";
import type { FeaturedGameSlide } from "../types/profile";
import ThemedIcon from "./ThemedIcon";

interface FeaturedGameCardProps {
  readonly slide: FeaturedGameSlide;
  /** Defaults to the open card (Figma 14:532); false renders the compact card. */
  readonly expanded?: boolean;
  /** Omit to render the card as static content, matching the profile design. */
  readonly onToggle?: () => void;
}

/** StatRow from Figma 14:538: 186×44, 20px icon at y=2, label 16px over value 15px. */
function StatRow({
  icon,
  iconDark,
  label,
  value,
}: Readonly<{
  icon: string;
  /** Figma 14:738+: the stroke is baked into the SVG, so dark needs its own file. */
  iconDark: string;
  label: string;
  value: string | number;
}>) {
  return (
    <div className="relative h-[44px] w-full shrink-0" data-name="StatRow">
      <ThemedIcon
        light={icon}
        dark={iconDark}
        className="absolute left-0 top-[2px] size-[20px]"
      />
      <div className="absolute left-[28px] top-0 flex h-[44px] flex-col gap-[4px]">
        <span className="text-[16px] font-medium leading-[20px] whitespace-nowrap text-vp-ink">
          {label}
        </span>
        <span className="text-[15px] font-medium leading-[20px] whitespace-nowrap text-vp-ink">
          {value}
        </span>
      </div>
    </div>
  );
}

/** Closed state: Figma node 139:837 (Product Info Card). */
function FeaturedGameCardClosed({
  slide,
  onToggle,
}: Readonly<{ slide: FeaturedGameSlide; onToggle?: () => void }>) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-[314px] w-full min-w-0 max-w-[305px] cursor-pointer flex-col gap-4 rounded-[8px] border border-vp-line bg-vp-surface p-4 text-left transition-shadow hover:shadow-md"
      aria-expanded={false}
    >
      <div className="relative h-[247px] w-full shrink-0 overflow-hidden rounded-[4px]">
        <img
          src={slide.card_image_url ?? slide.cover_image_url}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <p className="text-[16px] font-normal leading-[1.4] text-vp-ink">
        {slide.game_name}
      </p>
    </button>
  );
}

/**
 * Open state: Figma node 14:532 (FeaturedGameCardOpen), 446×314. Laid out as a
 * flex row rather than the absolute Figma offsets so the stat column can take
 * the extra width; at 446 the art still lands at x15 and the column at x219.
 */
function FeaturedGameCardOpen({
  slide,
}: Readonly<{ slide: FeaturedGameSlide }>) {
  return (
    <div className="flex h-[314px] w-full items-stretch">
      <img
        src={slide.cover_image_url}
        alt=""
        aria-hidden
        data-name="Image"
        className="pointer-events-none my-[15px] ml-[15px] h-[289px] w-[204px] shrink-0 object-cover"
      />
      <div
        className="flex min-w-0 flex-1 flex-col gap-[24px] pl-[24px] pt-[24px]"
        data-name="Container"
        data-node-id="14:534"
      >
        <h3
          className="h-[22.4px] w-full pl-[12px] pt-[6px] font-['League_Spartan',sans-serif] text-[16px] font-bold uppercase leading-[22.4px] tracking-[0.56px] whitespace-nowrap text-vp-ink"
          data-name="Heading 3"
        >
          {slide.game_name}
        </h3>
        <div className="flex h-[224px] w-full flex-col gap-[16px] pr-[16px]">
          <StatRow
            icon={iconEfficiencyScore}
            iconDark={iconEfficiencyScoreWhite}
            label="Efficiency Score"
            value={slide.efficiency_score}
          />
          <StatRow
            icon={iconTimeSpent}
            iconDark={iconTimeSpentWhite}
            label="Time Spent"
            value={slide.time_spent_label}
          />
          <StatRow
            icon={iconWinRate}
            iconDark={iconWinRateWhite}
            label="Win Rate"
            value={slide.win_rate_label}
          />
          <StatRow
            icon={iconKda}
            iconDark={iconKdaWhite}
            label="KDA"
            value={slide.kda_label}
          />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedGameCard({
  slide,
  expanded = true,
  onToggle,
}: Readonly<FeaturedGameCardProps>) {
  if (!expanded) {
    return <FeaturedGameCardClosed slide={slide} onToggle={onToggle} />;
  }

  const card = (
    <div
      className="relative h-[314px] w-full min-w-[446px] overflow-hidden rounded-[13px] bg-vp-surface shadow-[2px_2px_4px_0px_rgba(0,0,0,0.15)]"
      data-name="FeaturedGameCardOpen"
      data-node-id="14:532"
    >
      <FeaturedGameCardOpen slide={slide} />
    </div>
  );

  if (!onToggle) {
    return card;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="cursor-pointer border-0 bg-transparent p-0 text-left"
      aria-expanded
    >
      {card}
    </button>
  );
}
