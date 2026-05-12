import type { Database } from "@/integrations/supabase/types";

export type Category = "starters" | "mains" | "desserts" | "drinks" | "specials";

export type Badge =
  | "vip" | "exclusive" | "bestseller" | "discount"
  | "new" | "chef" | "spicy" | "limited";

export type DishRow = Database["public"]["Tables"]["dishes"]["Row"];
export type TableRow = Database["public"]["Tables"]["tables"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type ReservationRow = Database["public"]["Tables"]["reservations"]["Row"];

export type OrderStatus = "new" | "preparing" | "ready" | "delivered" | "cancelled";

/** Normalized Dish for UI use (camelCase) */
export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  calories: number | null;
  prepTime: number | null;
  badges: Badge[];
  available: boolean;
  isVipOnly: boolean;
}

export function dishFromRow(r: DishRow): Dish {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    price: Number(r.price),
    category: r.category as Category,
    image: r.image ?? "",
    calories: r.calories,
    prepTime: r.prep_time,
    badges: (r.badges ?? []) as Badge[],
    available: r.available,
    isVipOnly: r.is_vip_only,
  };
}

export interface CartItem {
  dish: Dish;
  qty: number;
  notes?: string;
}

export interface OrderWithItems extends OrderRow {
  order_items: OrderItemRow[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  starters: "Starters",
  mains: "Main Courses",
  desserts: "Desserts",
  drinks: "Drinks",
  specials: "Chef Specials",
};

export const BADGE_LABELS: Record<Badge, string> = {
  vip: "VIP",
  exclusive: "Exclusive",
  bestseller: "Bestseller",
  discount: "Discount",
  new: "New",
  chef: "Chef Choice",
  spicy: "Spicy",
  limited: "Limited",
};
