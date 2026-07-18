"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Reservation = {
  id: string;
  guestName: string;
  guestEmail: string;
  partySize: number;
  status: string;
  createdAt: string;
};

export default function AgendaPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const [rows, setRows] = useState<Reservation[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErr("Inicia sesión");
        return;
      }
      const res = await fetch(apiUrl(`/bookings/agenda/${venueId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setErr("Sin acceso a la agenda de este local");
        return;
      }
      const json = await res.json();
      setRows(json.data ?? []);
    }
    load();
  }, [venueId]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-cyan-400">
        ← Panel
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Agenda</h1>
      {err && <p className="mt-4 text-amber-300">{err}</p>}
      <ul className="mt-6 space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
          >
            <span className="text-white">{r.guestName}</span> · {r.partySize} pax
            · <span className="text-cyan-300">{r.status}</span>
            <div className="text-xs text-slate-500">{r.guestEmail}</div>
          </li>
        ))}
        {!err && rows.length === 0 && (
          <li className="text-slate-500">Sin reservas aún</li>
        )}
      </ul>
    </main>
  );
}
