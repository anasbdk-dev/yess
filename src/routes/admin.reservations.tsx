import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Phone, Trash2, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchReservations, deleteReservation } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reservations")({
  component: ReservationsPage,
});

function ReservationsPage() {
  const qc = useQueryClient();
  const { data: reservations = [], isLoading } = useQuery({ queryKey: ["reservations"], queryFn: fetchReservations });

  const remove = async (id: string) => {
    await deleteReservation(id);
    qc.invalidateQueries({ queryKey: ["reservations"] });
    toast.success("Reservation removed");
  };

  return (
    <div className="space-y-6 p-5 md:p-8">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Reservations</div>
        <h1 className="mt-2 font-display text-4xl">Upcoming bookings</h1>
      </header>

      {isLoading ? (
        <div className="rounded-2xl glass p-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : reservations.length === 0 ? (
        <div className="grid place-items-center rounded-2xl glass py-24 text-center">
          <CalendarCheck className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">No reservations yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reservations.map((r) => (
            <article key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl glass p-5">
              <div className="flex items-center gap-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/10 text-gold">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-xl">{r.name}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {r.date} • {r.time}
                  </div>
                  {r.notes && <div className="mt-1 text-xs italic text-amber-300/80">"{r.notes}"</div>}
                </div>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />{r.guests}</span>
                <span className="inline-flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{r.phone}</span>
                <button onClick={() => remove(r.id)} className="grid h-9 w-9 place-items-center rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
