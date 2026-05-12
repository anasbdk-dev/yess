import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDishes, upsertDish, deleteDish } from "@/lib/api";
import { formatPrice } from "@/lib/store";
import type { Badge, Category, Dish } from "@/lib/types";
import { BADGE_LABELS, CATEGORY_LABELS } from "@/lib/types";
import { BadgePill } from "@/components/BadgePill";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: Products,
});

const ALL_BADGES: Badge[] = ["vip", "exclusive", "bestseller", "discount", "new", "chef", "spicy", "limited"];
const CATS: Category[] = ["starters", "mains", "desserts", "drinks", "specials"];

interface FormData {
  id?: string;
  name: string; description: string; price: number;
  category: Category; image: string;
  calories?: number; prep_time?: number;
  badges: Badge[]; available: boolean; is_vip_only: boolean;
}

const empty: FormData = {
  name: "", description: "", price: 0, category: "mains",
  image: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=900&q=80",
  badges: [], available: true, is_vip_only: false,
};

function Products() {
  const qc = useQueryClient();
  const { data: dishes = [], isLoading } = useQuery({ queryKey: ["dishes"], queryFn: fetchDishes });

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [editing, setEditing] = useState<FormData | null>(null);

  const filtered = useMemo(() => {
    return dishes.filter((d) => {
      if (cat !== "all" && d.category !== cat) return false;
      if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [dishes, q, cat]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["dishes"] });

  const onToggle = async (d: Dish) => {
    await upsertDish({ id: d.id, available: !d.available });
    refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this dish?")) return;
    await deleteDish(id);
    refresh();
    toast.success("Dish removed");
  };

  const onSave = async (f: FormData) => {
    try {
      await upsertDish({
        ...(f.id ? { id: f.id } : {}),
        name: f.name,
        description: f.description,
        price: f.price,
        category: f.category,
        image: f.image,
        calories: f.calories ?? null,
        prep_time: f.prep_time ?? null,
        badges: f.badges,
        available: f.available,
        is_vip_only: f.is_vip_only,
      });
      refresh();
      setEditing(null);
      toast.success("Dish saved");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 p-5 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Menu</div>
          <h1 className="mt-2 font-display text-4xl">Dishes & beverages</h1>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-gold-soft"
        >
          <Plus className="h-4 w-4" /> New dish
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" className="w-full rounded-full border border-border bg-input/60 py-2.5 pl-10 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="scrollbar-hide flex gap-1 overflow-x-auto">
          {(["all", ...CATS] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] ${cat === c ? "bg-gold text-primary-foreground" : "border hairline text-muted-foreground hover:text-foreground"}`}>
              {c === "all" ? "All" : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full">
          <thead className="border-b hairline text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Dish</th>
              <th className="hidden px-3 py-3 text-left md:table-cell">Category</th>
              <th className="hidden px-3 py-3 text-left lg:table-cell">Badges</th>
              <th className="px-3 py-3 text-right">Price</th>
              <th className="px-3 py-3 text-center">Active</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {isLoading && <tr><td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.map((d) => (
              <tr key={d.id} className="hover:bg-secondary/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={d.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{d.description}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-3 text-sm text-muted-foreground md:table-cell">{CATEGORY_LABELS[d.category]}</td>
                <td className="hidden px-3 py-3 lg:table-cell">
                  <div className="flex flex-wrap gap-1">{d.badges.slice(0, 3).map((b) => <BadgePill key={b} badge={b} />)}</div>
                </td>
                <td className="px-3 py-3 text-right font-display gold-text">{formatPrice(d.price)}</td>
                <td className="px-3 py-3 text-center">
                  <button onClick={() => onToggle(d)} className={`relative inline-flex h-5 w-9 items-center rounded-full ${d.available ? "bg-gold" : "bg-secondary"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-background transition-transform ${d.available ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => setEditing({
                      id: d.id, name: d.name, description: d.description, price: d.price,
                      category: d.category, image: d.image, calories: d.calories ?? undefined,
                      prep_time: d.prepTime ?? undefined, badges: d.badges, available: d.available,
                      is_vip_only: d.isVipOnly,
                    })} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onDelete(d.id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">No dishes match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <EditModal data={editing} onClose={() => setEditing(null)} onSave={onSave} />}
    </div>
  );
}

function EditModal({ data, onClose, onSave }: { data: FormData; onClose: () => void; onSave: (f: FormData) => void }) {
  const [f, setF] = useState<FormData>(data);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl rounded-3xl glass-strong p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button>
        <h2 className="font-display text-2xl">{f.id ? "Edit dish" : "New dish"}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="ip" /></Field>
          <Field label="Price"><input required type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} className="ip" /></Field>
          <Field label="Category" full>
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category })} className="ip">
              {CATS.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </Field>
          <Field label="Image URL" full><input value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} className="ip" /></Field>
          <Field label="Description" full><textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="ip resize-none" /></Field>
          <Field label="Calories"><input type="number" value={f.calories ?? ""} onChange={(e) => setF({ ...f, calories: e.target.value ? Number(e.target.value) : undefined })} className="ip" /></Field>
          <Field label="Prep time (min)"><input type="number" value={f.prep_time ?? ""} onChange={(e) => setF({ ...f, prep_time: e.target.value ? Number(e.target.value) : undefined })} className="ip" /></Field>
          <Field label="Badges" full>
            <div className="flex flex-wrap gap-2">
              {ALL_BADGES.map((b) => {
                const on = f.badges.includes(b);
                return (
                  <button type="button" key={b} onClick={() => setF({ ...f, badges: on ? f.badges.filter((x) => x !== b) : [...f.badges, b] })} className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wider ${on ? "bg-gold text-primary-foreground" : "border hairline text-muted-foreground"}`}>
                    {BADGE_LABELS[b]}
                  </button>
                );
              })}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} /> Available
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.is_vip_only} onChange={(e) => setF({ ...f, is_vip_only: e.target.checked })} /> VIP only
          </label>
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-3 text-sm">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-primary-foreground hover:bg-gold-soft">Save</button>
          </div>
        </form>
        <style>{`.ip{width:100%;background:oklch(0.13 0.005 60 / 0.6);border:1px solid var(--color-border);border-radius:10px;padding:10px 12px;font-size:14px;color:var(--color-foreground)}.ip:focus{outline:none;border-color:var(--color-gold)}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
