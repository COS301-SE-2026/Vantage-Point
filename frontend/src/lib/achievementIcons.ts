import type { LucideIcon } from "lucide-react";
import {
  Castle,
  Crosshair,
  Droplet,
  Eye,
  Flame,
  Swords,
  Users,
} from "lucide-react";

/** Lucide icon per profile achievement id. */
const ACHIEVEMENT_ICONS: Readonly<Record<string, LucideIcon>> = {
  "triple-kill": Swords,
  "first-blood": Droplet,
  "killing-spree": Flame,
  "high-kp": Users,
  vision: Eye,
  damage: Crosshair,
  turrets: Castle,
};

export function getAchievementIcon(achievementId: string): LucideIcon | null {
  return ACHIEVEMENT_ICONS[achievementId] ?? null;
}
