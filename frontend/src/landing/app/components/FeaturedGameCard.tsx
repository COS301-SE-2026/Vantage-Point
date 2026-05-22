import type { ReactNode } from "react";
import { History, Swords, Trophy, Zap } from "lucide-react";
import type { FeaturedGameSlide } from "../types/profile";

interface FeaturedGameCardProps {
  readonly slide: FeaturedGameSlide;
  readonly expanded: boolean;
  readonly onToggle?: () => void;
}

function StatRow({
  icon,
  label,
  value,
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string | number;
}>) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center" aria-hidden>
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-['Geist:Medium',sans-serif] text-[14px] font-medium leading-5 text-white">
          {label}
        </span>
        <span className="font-['Geist:Medium',sans-serif] text-[14px] font-medium leading-5 text-white">
          {value}
        </span>
      </div>
    </div>
  );
}

function StatIconLucide({
  Icon,
}: Readonly<{ Icon: typeof Trophy }>) {
  return <Icon className="size-5 text-white" strokeWidth={2} aria-hidden />;
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
      <p className="font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] text-[#1e1e1e]">
        {slide.game_name}
      </p>
    </button>
  );
}

/** Open state — Figma node 179:1051 (Group 16). */
function FeaturedGameCardOpen({
  slide,
  onToggle,
}: Readonly<{ slide: FeaturedGameSlide; onToggle?: () => void }>) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-[314px] w-full min-w-0 max-w-[520px] cursor-pointer overflow-hidden rounded-[13px] bg-[#7b7676] text-left transition-shadow hover:shadow-lg"
      aria-expanded={true}
    >
      <div className="max-w-full shrink-0 p-[15px] pr-0">
        <img
          src={slide.cover_image_url}
          alt=""
          className="h-[289px] max-w-full w-[271px] object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
        <h3 className="mb-6 font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] text-white">
          {slide.game_name}
        </h3>
        <div className="flex flex-col gap-4">
          <StatRow
            icon={<StatIconLucide Icon={Zap} />}
            label="Efficiency Score"
            value={slide.efficiency_score}
          />
          <StatRow
            icon={<StatIconLucide Icon={History} />}
            label="Time Spent"
            value={slide.time_spent_label}
          />
          <StatRow
            icon={<StatIconLucide Icon={Trophy} />}
            label="Win Rate"
            value={slide.win_rate_label}
          />
          <StatRow
            icon={<StatIconLucide Icon={Swords} />}
            label="KDA"
            value={slide.kda_label}
          />
        </div>
      </div>
    </button>
  );
}

export default function FeaturedGameCard({
  slide,
  expanded,
  onToggle,
}: Readonly<FeaturedGameCardProps>) {
  if (expanded) {
    return <FeaturedGameCardOpen slide={slide} onToggle={onToggle} />;
  }
  return <FeaturedGameCardClosed slide={slide} onToggle={onToggle} />;
}
