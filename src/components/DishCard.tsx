import { motion } from "framer-motion";
import { Flame, Clock } from "lucide-react";
import type { Dish } from "@/lib/types";
import { BadgePill } from "./BadgePill";
import { formatPrice } from "@/lib/store";

interface Props {
  dish: Dish;
  onSelect: (d: Dish) => void;
  index?: number;
}

export function DishCard({ dish, onSelect, index = 0 }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(dish)}
      className="group relative overflow-hidden rounded-2xl text-left glass hover:gold-glow transition-shadow duration-500 disabled:opacity-50"
      disabled={!dish.available}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        {dish.badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {dish.badges.slice(0, 2).map((b) => <BadgePill key={b} badge={b} />)}
          </div>
        )}
        {!dish.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Unavailable
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight text-foreground">{dish.name}</h3>
          <span className="font-display text-xl gold-text shrink-0">{formatPrice(dish.price)}</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground text-balance">{dish.description}</p>
        <div className="flex items-center gap-3 pt-1 text-[11px] uppercase tracking-wider text-muted-foreground/80">
          {dish.calories != null && (
            <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" />{dish.calories} kcal</span>
          )}
          {dish.prepTime != null && (
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{dish.prepTime} min</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
