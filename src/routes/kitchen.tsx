import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCheck, ChefHat, Clock, LogOut, X } from "lucide-react";
import { timeSince } from "@/lib/store";
import { setOrderStatus } from "@/lib/api";
import { useOrders } from "@/hooks/useRealtimeOrders";
import type { OrderStatus } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/kitchen")({
  head: () => ({ meta: [{ title: "Kitchen Display — AURALIS" }] }),
  component: () => (
    <AuthGuard allow={["admin", "kitchen"]}>
      <Kitchen />
    </AuthGuard>
  ),
});

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "delivered",
  delivered: null,
  cancelled: null,
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "border-gold/60 bg-gold/10 text-gold",
  preparing: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  ready: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  delivered: "border-border bg-secondary text-muted-foreground",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

const FILTERS: Array<{ key: "active" | OrderStatus | "all"; label: string }> = [
  { key: "active", label: "Active" },
  { key: "new", label: "New" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "delivered", label: "Delivered" },
  { key: "all", label: "All" },
];

function Kitchen() {
  const { data: orders = [] } = useOrders();
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("active");
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(i);
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") return orders.filter((o) => o.status === "new" || o.status === "preparing" || o.status === "ready");
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const counts = useMemo(() => ({
    new: orders.filter((o) => o.status === "new").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  }), [orders]);

  const advance = (id: string, next: OrderStatus) => setOrderStatus(id, next);
  const cancel = (id: string) => setOrderStatus(id, "cancelled");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b hairline glass-strong">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden md:inline rounded-full border hairline px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gold">
              Kitchen Display
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Stat label="New" value={counts.new} accent="text-gold" />
            <Stat label="Cooking" value={counts.preparing} accent="text-amber-300" />
            <Stat label="Ready" value={counts.ready} accent="text-emerald-300" />
            <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-card">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <nav className="border-t hairline">
          <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-6 py-3 scrollbar-hide">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em] ${filter === f.key ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1600px] p-5">
        {visible.length === 0 ? (
          <div className="grid place-items-center rounded-2xl glass py-32 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-sm text-muted-foreground">No orders in this view.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((order) => {
              const status = order.status as OrderStatus;
              const next = STATUS_FLOW[status];
              return (
                <article key={order.id} className={`flex flex-col overflow-hidden rounded-2xl border-2 glass ${STATUS_STYLE[status]}`}>
                  <header className="flex items-center justify-between border-b hairline p-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Table</div>
                      <div className="font-display text-2xl gold-text">{order.table_name}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] ${STATUS_STYLE[status]}`}>
                      {status}
                    </span>
                  </header>
                  <ul className="flex-1 space-y-2 p-4 text-sm">
                    {order.order_items.map((it) => (
                      <li key={it.id} className="rounded-lg bg-background/30 px-3 py-2">
                        <div className="flex justify-between gap-2">
                          <span><span className="text-gold font-medium">{it.qty}×</span> {it.name}</span>
                        </div>
                        {it.notes && <div className="mt-1 text-xs italic text-amber-300/80">"{it.notes}"</div>}
                      </li>
                    ))}
                  </ul>
                  <footer className="space-y-3 border-t hairline p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{timeSince(order.created_at!)} ago</span>
                      <span className="font-display text-base text-foreground">${Number(order.total).toFixed(2)}</span>
                    </div>
                    {(status === "new" || status === "preparing" || status === "ready") && (
                      <div className="flex gap-2">
                        {next && (
                          <button onClick={() => advance(order.id, next)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:bg-gold-soft">
                            <CheckCheck className="h-3.5 w-3.5" /> Mark {next}
                          </button>
                        )}
                        <button onClick={() => cancel(order.id)} className="grid h-10 w-10 place-items-center rounded-xl border hairline text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border hairline px-3 py-1.5 text-center">
      <div className={`font-display text-lg leading-none ${accent}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
    </div>
  );
}
