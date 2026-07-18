"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, ensureSession } from "@/lib/auth-client";

type Reservation = {
  id: string;
  venueId: string;
  partySize: number;
  status: string;
  guestName: string;
  createdAt: string;
};

export default function MisReservasPage() {
  const [rows, setRows] = useState<Reservation[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!(await ensureSession())) {
        setErr("Inicia sesión para ver tus reservas");
        return;
      }
      const res = await apiFetch("/bookings/mine");
      if (!res.ok) {
        setErr("Error al cargar");
        return;
      }
      const json = await res.json();
      setRows(json.data ?? []);
    }
    load();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-cyan-400">
        ← Inicio
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Mis reservas</h1>
      {err && (
        <p className="mt-4 text-amber-300">
          {err}{" "}
          <Link href="/login" className="text-cyan-400 underline">
            Login
          </Link>
        </p>
      )}
      <ul className="mt-6 space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-slate-800 px-4 py-3 text-sm text-slate-200"
          >
            {r.status} · {r.partySize} pax · {r.guestName}
          </li>
        ))}
        {!err && rows.length === 0 && (
          <li className="text-slate-500">Aún no tienes reservas</li>
        )}
      </ul>
    </main>
  );
}
