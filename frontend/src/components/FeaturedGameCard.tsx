import {
  iconEfficiencyScore,
  iconKda,
  iconTimeSpent,
  iconWinRate,
} from "../assets/images/profile";
import type { FeaturedGameSlide } from "../types/profile";

interface FeaturedGameCardProps {
  readonly slide: FeaturedGameSlide;
  /** Defaults to the open card (Figma 14:532); false renders the compact card. */
  readonly expanded?: boolean;
  /** Omit to render the card as static content, matching the profile design. */
  readonly onToggle?: () => void;
}

/** StatRow — Figma 14:538: 186×44, 20px icon at y=2, label 16px over value 15px. */
function StatRow({
  icon,
  label,
  value,
}: Readonly<{
  icon: string;
  label: string;
  value: string | number;
}>) {
  return (
    <div className="relative h-[44px] w-[186px] shrink-0" data-name="StatRow">
      <img
        src={icon}
        alt=""
        aria-hidden
        className="absolute left-0 top-[2px] size-[20px]"
      />
      <div className="absolute left-[28px] top-0 flex h-[44px] flex-col gap-[4px]">
        <span className="font-['Beaufort_for_LOL',serif] text-[16px] font-medium leading-[20px] whitespace-nowrap text-[#1e1e1e]">
          {label}
        </span>
        <span className="font-['Beaufort_for_LOL',serif] text-[15px] font-medium leading-[20px] whitespace-nowrap text-[#1e1e1e]">
          {value}
        </span>
      </div>
    </div>
  );
}

/** Closed state — Figma node 139:837 (Product Info Card). */
function FeaturedGameCardClosed({
  slide,
  onToggle,
}: Readonly<{ slide: FeaturedGameSlide; onToggle?: () => void }>) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-[314px] w-full min-w-0 max-w-[305px] cursor-pointer flex-col gap-4 rounded-[8px] border border-[#d9d9d9] bg-white p-4 text-left transition-shadow hover:shadow-md"
      aria-expanded={false}
    >
      <div className="relative h-[247px] w-full shrink-0 overflow-hidden rounded-[4px]">
        <img
          src={slide.card_image_url ?? slide.cover_image_url}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <p className="font-['Inter',sans-serif] text-[16px] font-normal leading-[1.4] text-[#1e1e1e]">
        {slide.game_name}
      </p>
    </button>
  );
}

/** Open state — Figma node 14:532 (FeaturedGameCardOpen), 446×314. */
function FeaturedGameCardOpen({
  slide,
}: Readonly<{ slide: FeaturedGameSlide }>) {
  return (
    <>
      <img
        src={slide.cover_image_url}
        alt=""
        aria-hidden
        data-name="Image"
        className="pointer-events-none absolute left-[15px] top-[15px] h-[289px] w-[204px] object-cover"
      />
      <div
        className="absolute left-[219px] top-0 flex h-[314px] w-[227px] flex-col gap-[24px] pl-[24px] pt-[24px]"
        data-name="Container"
        data-node-id="14:534"
      >
        <h3
          className="h-[22.4px] w-[186px] pl-[12px] pt-[6px] font-['League_Spartan',sans-serif] text-[16px] font-bold uppercase leading-[22.4px] tracking-[0.56px] whitespace-nowrap text-[#1e1e1e]"
          data-name="Heading 3"
        >
          {slide.game_name}
        </h3>
        <div className="flex h-[224px] w-[186px] flex-col gap-[16px]">
          <StatRow
            icon={iconEfficiencyScore}
            label="Efficiency Score"
            value={slide.efficiency_score}
          />
          <StatRow
            icon={iconTimeSpent}
            label="Time Spent"
            value={slide.time_spent_label}
          />
          <StatRow
            icon={iconWinRate}
            label="Win Rate"
            value={slide.win_rate_label}
          />
          <StatRow icon={iconKda} label="KDA" value={slide.kda_label} />
        </div>
      </div>
    </>
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
      className="relative h-[314px] w-[446px] max-w-full overflow-hidden rounded-[13px] bg-[#f0f0f0] shadow-[2px_2px_4px_0px_rgba(0,0,0,0.15)]"
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
