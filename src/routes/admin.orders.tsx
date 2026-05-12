import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { formatPrice, timeSince } from "@/lib/store";
import { setOrderStatus } from "@/lib/api";
import { useOrders } from "@/hooks/useRealtimeOrders";
import type { OrderStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

const STATUSES: Array<OrderStatus | "all"> = ["all", "new", "preparing", "ready", "delivered", "cancelled"];

const STYLE: Record<OrderStatus, string> = {
  new: "bg-gold/10 text-gold",
  preparing: "bg-amber-400/10 text-amber-300",
  ready: "bg-emerald-400/10 text-emerald-300",
  delivered: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(() => orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (q && !o.table_name.toLowerCase().includes(q.toLowerCase()) && !o.id.includes(q)) return false;
    return true;
  }), [orders, q, filter]);

  const change = async (id: string, s: OrderStatus) => {
    try { await setOrderStatus(id, s); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6 p-5 md:p-8">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Orders</div>
        <h1 className="mt-2 font-display text-4xl">Service queue</h1>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by table or id…" className="w-full rounded-full border border-border bg-input/60 py-2.5 pl-10 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="scrollbar-hide flex gap-1 overflow-x-auto">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] ${filter === s ? "bg-gold text-primary-foreground" : "border hairline text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      {isLoading && <div className="rounded-2xl glass p-16 text-center text-sm text-muted-foreground">Loading…</div>}

      <div className="grid gap-3">
        {filtered.map((o) => (
          <article key={o.id} className="rounded-2xl glass p-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Table</div>
                  <div className="font-display text-2xl gold-text">{o.table_name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Order</div>
                  <div className="text-sm">#{o.id.slice(0, 6)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Placed</div>
                  <div className="text-sm">{timeSince(o.created_at!)} ago</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select value={o.status} onChange={(e) => change(o.id, e.target.value as OrderStatus)} className={`rounded-full border-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] ${STYLE[o.status as OrderStatus]}`}>
                  {(["new", "preparing", "ready", "delivered", "cancelled"] as OrderStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => change(o.id, "cancelled")} className="grid h-8 w-8 place-items-center rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <ul className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
              {o.order_items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 rounded-lg bg-background/30 px-3 py-2">
                  <span className="truncate"><span className="text-gold">{it.qty}×</span> {it.name}{it.notes && <em className="ml-1 text-xs text-muted-foreground">— {it.notes}</em>}</span>
                  <span className="text-muted-foreground">{formatPrice(Number(it.price) * it.qty)}</span>
                </li>
              ))}
            </ul>
            <footer className="mt-4 flex items-center justify-between border-t hairline pt-3 text-xs text-muted-foreground">
              <span>Subtotal {formatPrice(Number(o.subtotal))} • Service {formatPrice(Number(o.service))} • Tax {formatPrice(Number(o.tax))}</span>
              <span className="font-display text-base text-foreground">{formatPrice(Number(o.total))}</span>
            </footer>
          </article>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl glass p-16 text-center text-sm text-muted-foreground">No orders match.</div>
        )}
      </div>
    </div>
  );
}
