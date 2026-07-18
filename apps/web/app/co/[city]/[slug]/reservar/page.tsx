"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { apiFetch } from "@/lib/auth-client";

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  reservedCount: number;
  label: string | null;
};

type Venue = {
  id: string;
  name: string;
  bookingEnabled: boolean;
};

export default function ReservarPage() {
  const params = useParams<{ city: string; slug: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const vRes = await fetch(
          apiUrl(`/catalog/${params.city}/${params.slug}`),
        );
        const vJson = await vRes.json();
        setVenue(vJson.data);
        if (vJson.data?.id) {
          const sRes = await fetch(apiUrl(`/bookings/slots/${vJson.data.id}`));
          const sJson = await sRes.json();
          setSlots(sJson.data ?? []);
        }
      } catch {
        setErr("No se pudo cargar el local");
      }
    }
    load();
  }, [params.city, params.slug]);

  async function hold(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!venue) return;
    try {
      const res = await apiFetch("/bookings/hold", {
        method: "POST",
        body: JSON.stringify({
          venueId: venue.id,
          slotId,
          partySize,
          guestName,
          guestEmail,
          guestPhone: guestPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Error en hold");
        return;
      }
      setReservationId(data.data.id);
      setMsg(
        `HOLD creado (expira ${data.data.holdExpiresAt}). Confirma para asegurar la mesa.`,
      );
    } catch {
      setErr("Error de red");
    }
  }

  async function confirm() {
    if (!reservationId) return;
    setErr(null);
    try {
      const res = await apiFetch(`/bookings/${reservationId}/confirm`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "No se pudo confirmar");
        return;
      }
      setMsg(`Reserva CONFIRMADA · id ${data.data.id}`);
    } catch {
      setErr("Error de red");
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <Link
        href={`/co/${params.city}/${params.slug}`}
        className="text-sm text-cyan-400"
      >
        ← Volver
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">
        Reservar {venue?.name ?? "…"}
      </h1>

      {!venue?.bookingEnabled && (
        <p className="mt-4 text-amber-300">
          Este local no tiene reservas online activas.
        </p>
      )}

      <form onSubmit={hold} className="mt-8 space-y-4">
        <label className="block text-sm text-slate-300">
          Horario
          <select
            required
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          >
            <option value="">Selecciona…</option>
            {slots.map((s) => {
              const left = s.capacity - s.reservedCount;
              return (
                <option key={s.id} value={s.id} disabled={left < 1}>
                  {new Date(s.startsAt).toLocaleString("es-CO")} · {left} cupos
                </option>
              );
            })}
          </select>
        </label>
        <label className="block text-sm text-slate-300">
          Personas
          <input
            type="number"
            min={1}
            max={20}
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Nombre
          <input
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            required
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Teléfono
          <input
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        {err && <p className="text-sm text-red-400">{err}</p>}
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-cyan-500 py-2 font-medium text-slate-950"
        >
          Reservar (HOLD)
        </button>
      </form>

      {reservationId && (
        <button
          type="button"
          onClick={confirm}
          className="mt-3 w-full rounded-lg bg-emerald-500 py-2 font-medium text-slate-950"
        >
          Confirmar reserva
        </button>
      )}
    </main>
  );
}
