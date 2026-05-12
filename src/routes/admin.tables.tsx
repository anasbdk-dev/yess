import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Edit2, Plus, Printer, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTables, createTable, deleteTable, updateTable } from "@/lib/api";
import { useOrders } from "@/hooks/useRealtimeOrders";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tables")({
  component: TablesPage,
});

function TablesPage() {
  const qc = useQueryClient();
  const { data: tables = [] } = useQuery({ queryKey: ["tables"], queryFn: fetchTables });
  const { data: orders = [] } = useOrders();

  const [name, setName] = useState("");
  const [seats, setSeats] = useState(2);
  const [vip, setVip] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const refresh = () => qc.invalidateQueries({ queryKey: ["tables"] });

  const downloadQR = (id: string, name: string) => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `qr-${name.replace(/\s+/g, "-")}.svg`;
    a.click(); URL.revokeObjectURL(url);
  };

  const printQR = (id: string, name: string) => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    const w = window.open("", "_blank", "width=480,height=600");
    if (!w) return;
    w.document.write(`<html><head><title>QR ${name}</title><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#111;color:#fff}h1{font-weight:300;letter-spacing:.3em;text-transform:uppercase}</style></head><body><h1>${name}</h1>${svg.outerHTML}<p>AURALIS</p></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-6 p-5 md:p-8">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Tables</div>
        <h1 className="mt-2 font-display text-4xl">QR codes & seating</h1>
      </header>

      <div className="rounded-2xl glass p-5">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!name) return;
          try { await createTable(name, seats, vip); setName(""); setSeats(2); setVip(false); refresh(); toast.success("Table added"); }
          catch (err: any) { toast.error(err.message); }
        }} className="flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-[160px]">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Table 8 / VIP 3" className="w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-sm" />
          </label>
          <label>
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Seats</span>
            <input type="number" min={1} max={30} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="w-24 rounded-lg border border-border bg-input/60 px-3 py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} /> VIP
          </label>
          <button className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-gold-soft">
            <Plus className="h-4 w-4" /> Add table
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((t) => {
          const url = `${baseUrl}/menu?t=${encodeURIComponent(t.qr_token)}`;
          const tableOrders = orders.filter((o) => o.table_id === t.id);
          const revenue = tableOrders.reduce((s, o) => s + (o.status !== "cancelled" ? Number(o.total) : 0), 0);
          return (
            <article key={t.id} className="rounded-2xl glass p-5">
              <header className="flex items-start justify-between">
                <div>
                  <div className="font-display text-2xl">{t.name} {t.is_vip && <span className="ml-1 text-[10px] uppercase tracking-widest text-gold">VIP</span>}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{t.seats} seats</div>
                </div>
                <button onClick={async () => {
                  const newName = prompt("Rename table", t.name);
                  if (newName) { await updateTable(t.id, { name: newName }); refresh(); }
                }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </header>
              <div className="my-4 flex justify-center rounded-xl bg-white p-4">
                <QRCodeSVG id={`qr-${t.id}`} value={url} size={160} bgColor="#ffffff" fgColor="#1a1714" level="M" />
              </div>
              <div className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground break-all">{t.qr_token}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border hairline p-2">
                  <div className="font-display gold-text">{tableOrders.length}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Orders</div>
                </div>
                <div className="rounded-lg border hairline p-2">
                  <div className="font-display gold-text">${revenue.toFixed(0)}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Revenue</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button onClick={() => downloadQR(t.id, t.name)} className="inline-flex items-center justify-center rounded-lg border hairline py-2 text-xs hover:bg-secondary"><Download className="h-3 w-3" /></button>
                <button onClick={() => printQR(t.id, t.name)} className="inline-flex items-center justify-center rounded-lg border hairline py-2 text-xs hover:bg-secondary"><Printer className="h-3 w-3" /></button>
                <button onClick={async () => {
                  if (!confirm(`Delete ${t.name}?`)) return;
                  await deleteTable(t.id); refresh(); toast.success("Table removed");
                }} className="inline-flex items-center justify-center rounded-lg border hairline py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
