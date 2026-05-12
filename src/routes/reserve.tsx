import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Check, Clock, Phone, User, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createReservation } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(30),
  guests: z.number().int().min(1).max(30),
  date: z.string().min(4),
  time: z.string().min(3),
  notes: z.string().max(400).optional(),
});

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve a Table — AURALIS" },
      { name: "description", content: "Reserve your table at AURALIS." },
    ],
  }),
  component: Reserve,
});

function Reserve() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", guests: 2, date: "", time: "", notes: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error("Please complete all required fields."); return; }
    setBusy(true);
    try {
      await createReservation({
        name: parsed.data.name,
        phone: parsed.data.phone,
        guests: parsed.data.guests,
        date: parsed.data.date,
        time: parsed.data.time,
        notes: parsed.data.notes ?? null,
      });
      setDone(true); toast.success("Reservation received");
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen px-4 py-10 md:px-6">
      <header className="mx-auto mb-10 flex max-w-3xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Logo />
      </header>

      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold">Reservations</div>
          <h1 className="mt-3 font-display text-5xl text-balance">Reserve your evening.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Tell us when you'd like to dine and we'll make sure your table is set.
          </p>
        </div>

        {done ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl glass-strong p-10 text-center gold-glow">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15">
              <Check className="h-8 w-8 text-gold" />
            </div>
            <h2 className="mt-6 font-display text-3xl gold-text">Merci, {form.name.split(" ")[0]}.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your table for {form.guests} on {form.date} at {form.time} is being confirmed. We'll text you shortly at {form.phone}.
            </p>
            <Link to="/" className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-gold-soft">
              Return home
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-3xl glass-strong p-6 md:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field icon={User} label="Full name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" placeholder="Mr. Laurent" /></Field>
              <Field icon={Phone} label="Phone"><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" placeholder="+1 555 123 4567" /></Field>
              <Field icon={Users} label="Guests"><input required type="number" min={1} max={30} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} className="input-base" /></Field>
              <Field icon={Calendar} label="Date"><input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-base" /></Field>
              <Field icon={Clock} label="Time"><input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input-base" /></Field>
            </div>
            <Field label="Notes (optional)"><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-base resize-none" placeholder="Anniversary, allergies, seating preference…" /></Field>
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-gold py-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:bg-gold-soft disabled:opacity-60">
              {busy ? "Submitting…" : "Request reservation"}
            </button>
          </form>
        )}
      </div>
      <style>{`
        .input-base { width:100%; background: oklch(0.13 0.005 60 / 0.6); border:1px solid var(--color-border); border-radius:12px; padding:14px 16px 14px 44px; font-size:14px; color: var(--color-foreground); }
        .input-base:focus { outline:none; border-color: var(--color-gold); box-shadow: 0 0 0 3px oklch(0.82 0.13 85 / 0.18); }
        textarea.input-base { padding-left:16px; }
      `}</style>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon?: any; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
        {children}
      </div>
    </label>
  );
}
