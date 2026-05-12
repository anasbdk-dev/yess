import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Dish } from "@/lib/types";
import { formatPrice, useCart } from "@/lib/store";
import { BadgePill } from "./BadgePill";
import { toast } from "sonner";

interface Props {
  dish: Dish | null;
  onClose: () => void;
}

export function OrderModal({ dish, onClose }: Props) {
  const addToCart = useCart((s) => s.addToCart);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (dish) { setQty(1); setNotes(""); }
  }, [dish]);

  return (
    <AnimatePresence>
      {dish && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-md sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl glass-strong gold-glow"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/60 text-foreground hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={dish.image} alt={dish.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {dish.badges.map((b) => <BadgePill key={b} badge={b} />)}
                </div>
                <h2 className="font-display text-3xl text-foreground">{dish.name}</h2>
              </div>
            </div>
            <div className="space-y-5 p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{dish.description}</p>
              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Special requests
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="No onions, extra cheese, medium rare…"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-input/50 px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-3 rounded-full bg-secondary px-2 py-1.5">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="grid h-9 w-9 place-items-center rounded-full bg-background hover:bg-card"
                  ><Minus className="h-4 w-4" /></button>
                  <span className="w-6 text-center font-display text-lg">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-gold text-primary-foreground hover:bg-gold-soft"
                  ><Plus className="h-4 w-4" /></button>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Total</div>
                  <div className="font-display text-2xl gold-text">{formatPrice(dish.price * qty)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-border bg-transparent px-4 py-3.5 text-sm font-medium hover:bg-secondary"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => {
                    addToCart(dish, qty, notes || undefined);
                    toast.success(`${dish.name} added`, { description: `${qty} × ${formatPrice(dish.price)}` });
                    onClose();
                  }}
                  className="rounded-xl bg-gold px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-gold-soft hover:shadow-[0_8px_30px_-8px_oklch(0.82_0.13_85_/_0.6)]"
                >
                  Add to Order
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
