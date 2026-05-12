import { motion } from "framer-motion";
import type { Badge } from "@/lib/types";
import { BADGE_LABELS } from "@/lib/types";
import { Crown, Sparkles, Flame, TrendingUp, Tag, Star, ChefHat, Hourglass } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STYLES: Record<Badge, { bg: string; fg: string; icon: LucideIcon }> = {
  vip: { bg: "bg-gold/20", fg: "text-gold", icon: Crown },
  exclusive: { bg: "bg-gold/15", fg: "text-gold-soft", icon: Sparkles },
  bestseller: { bg: "bg-orange-500/15", fg: "text-orange-300", icon: TrendingUp },
  discount: { bg: "bg-emerald-500/15", fg: "text-emerald-300", icon: Tag },
  new: { bg: "bg-sky-500/15", fg: "text-sky-300", icon: Star },
  chef: { bg: "bg-rose-500/15", fg: "text-rose-300", icon: ChefHat },
  spicy: { bg: "bg-red-500/15", fg: "text-red-300", icon: Flame },
  limited: { bg: "bg-purple-500/15", fg: "text-purple-300", icon: Hourglass },
};

export function BadgePill({ badge }: { badge: Badge }) {
  const s = STYLES[badge];
  const Icon = s.icon;
  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${s.bg} ${s.fg} backdrop-blur-md`}
    >
      <Icon className="h-2.5 w-2.5" />
      {BADGE_LABELS[badge]}
    </motion.span>
  );
}
