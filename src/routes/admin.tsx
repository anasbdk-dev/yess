import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  CalendarCheck,
  ChefHat,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  QrCode,
  UtensilsCrossed,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useRealtimeOrders";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — AURALIS" }] }),
  component: () => (
    <AuthGuard allow={["admin"]}>
      <AdminLayout />
    </AuthGuard>
  ),
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/orders", label: "Orders", icon: ListOrdered },
  { to: "/admin/tables", label: "Tables", icon: QrCode },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarCheck },
];

function AdminLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: orders = [] } = useOrders();
  const activeCount = orders.filter((o) => o.status === "new" || o.status === "preparing").length;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b hairline glass-strong lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-5 lg:block">
          <Logo />
          <Link to="/kitchen" className="lg:mt-6 inline-flex items-center gap-2 rounded-full border hairline px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-gold hover:bg-gold/10">
            <ChefHat className="h-3 w-3" /> Kitchen
          </Link>
        </div>
        <nav className="px-3 pb-4 lg:pb-0">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1.5 scrollbar-hide">
            {NAV.map((n) => {
              const isActive = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-gold/15 text-gold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                  >
                    <n.icon className="h-4 w-4" />
                    <span>{n.label}</span>
                    {n.to === "/admin/orders" && activeCount > 0 && (
                      <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{activeCount}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="hidden p-5 lg:block lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
          <div className="rounded-2xl border hairline bg-background/40 p-4 text-center">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Logged in</div>
            <div className="mt-1 truncate font-display text-sm">{user?.email}</div>
            <button
              onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border hairline px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
