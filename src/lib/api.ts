import { supabase } from "@/integrations/supabase/client";
import { dishFromRow, type Dish, type DishRow, type TableRow, type ReservationRow } from "./types";

// ----- DISHES -----
export async function fetchDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DishRow[]).map(dishFromRow);
}

export async function upsertDish(d: Partial<DishRow> & { id?: string }): Promise<void> {
  if (d.id) {
    const { error } = await supabase.from("dishes").update(d).eq("id", d.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("dishes").insert(d as DishRow);
    if (error) throw error;
  }
}

export async function deleteDish(id: string) {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;
}

// ----- TABLES -----
export async function fetchTables(): Promise<TableRow[]> {
  const { data, error } = await supabase.from("tables").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function fetchTableByToken(token: string): Promise<TableRow | null> {
  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("qr_token", token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTable(name: string, seats: number, isVip = false) {
  const { error } = await supabase.from("tables").insert({ name, seats, is_vip: isVip });
  if (error) throw error;
}

export async function updateTable(id: string, patch: Partial<TableRow>) {
  const { error } = await supabase.from("tables").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTable(id: string) {
  const { error } = await supabase.from("tables").delete().eq("id", id);
  if (error) throw error;
}

// ----- RESERVATIONS -----
export async function fetchReservations(): Promise<ReservationRow[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReservation(r: Omit<ReservationRow, "id" | "created_at" | "status">) {
  const { error } = await supabase.from("reservations").insert(r);
  if (error) throw error;
}

export async function deleteReservation(id: string) {
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) throw error;
}

// ----- ORDERS -----
export async function setOrderStatus(id: string, status: import("./types").OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function placeOrder(input: {
  table_id: string;
  table_name: string;
  items: Array<{ dish_id: string; name: string; price: number; qty: number; image?: string; notes?: string }>;
  subtotal: number;
  service: number;
  tax: number;
  total: number;
  notes?: string;
}) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      table_id: input.table_id,
      table_name: input.table_name,
      subtotal: input.subtotal,
      service: input.service,
      tax: input.tax,
      total: input.total,
      notes: input.notes,
      status: "new",
    })
    .select()
    .single();
  if (error) throw error;
  const items = input.items.map((i) => ({
    order_id: order.id,
    dish_id: i.dish_id,
    name: i.name,
    price: i.price,
    qty: i.qty,
    image: i.image ?? "",
    notes: i.notes,
  }));
  const { error: itemsErr } = await supabase.from("order_items").insert(items);
  if (itemsErr) throw itemsErr;
  return order;
}
