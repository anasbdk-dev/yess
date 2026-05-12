import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Dish } from "./types";

const SERVICE_RATE = 0.1;
const TAX_RATE = 0.08;

export interface Totals {
  subtotal: number;
  service: number;
  tax: number;
  total: number;
}

export function calcTotals(items: CartItem[]): Totals {
  const subtotal = items.reduce((s, i) => s + i.dish.price * i.qty, 0);
  const service = +(subtotal * SERVICE_RATE).toFixed(2);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  const total = +(subtotal + service + tax).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), service, tax, total };
}

interface CartState {
  cart: CartItem[];
  addToCart: (dish: Dish, qty: number, notes?: string) => void;
  updateQty: (dishId: string, qty: number) => void;
  removeFromCart: (dishId: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (dish, qty, notes) =>
        set((s) => {
          const existing = s.cart.find((c) => c.dish.id === dish.id);
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.dish.id === dish.id ? { ...c, qty: c.qty + qty, notes: notes ?? c.notes } : c,
              ),
            };
          }
          return { cart: [...s.cart, { dish, qty, notes }] };
        }),
      updateQty: (dishId, qty) =>
        set((s) => ({
          cart: qty <= 0
            ? s.cart.filter((c) => c.dish.id !== dishId)
            : s.cart.map((c) => (c.dish.id === dishId ? { ...c, qty } : c)),
        })),
      removeFromCart: (dishId) =>
        set((s) => ({ cart: s.cart.filter((c) => c.dish.id !== dishId) })),
      clearCart: () => set({ cart: [] }),
    }),
    { name: "auralis-cart" },
  ),
);

export function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export function timeSince(ts: number | string) {
  const t = typeof ts === "string" ? new Date(ts).getTime() : ts;
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}
