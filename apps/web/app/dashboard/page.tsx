"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Venue = {
  id: string;
  name: string;
  slug: string;
  bookingEnabled: boolean;
  claimStatus: string;
  type: string;
};

export default function DashboardPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErr("Inicia sesión");
        return;
      }
      const res = await fetch(apiUrl("/venues/mine"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setErr("No autorizado o error de API");
        return;
      }
      const json = await res.json();
      setVenues(json.data ?? []);
    }
    load();
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Panel del local</h1>
        <Link href="/" className="text-sm text-cyan-400">
          Inicio
        </Link>
      </div>
      <p className="mt-2 text-slate-400">
        Sedes de tu organización (claim en S4).
      </p>
      {err && <p className="mt-4 text-amber-300">{err}</p>}
      <ul className="mt-8 space-y-3">
        {venues.map((v) => (
          <li
            key={v.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="font-medium text-white">{v.name}</div>
            <div className="text-xs text-slate-400">
              {v.type} · {v.claimStatus} · booking{" "}
              {v.bookingEnabled ? "on" : "off"}
            </div>
            <div className="mt-2 flex gap-3 text-sm">
              <Link
                href={`/dashboard/agenda/${v.id}`}
                className="text-cyan-400"
              >
                Agenda
              </Link>
              <Link
                href={`/dashboard/billing`}
                className="text-cyan-400"
              >
                Billing
              </Link>
            </div>
          </li>
        ))}
        {!err && venues.length === 0 && (
          <li className="text-slate-500">
            Sin sedes. Reclama un local (claim) o espera aprobación admin.
          </li>
        )}
      </ul>
      <Link
        href="/mis-reservas"
        className="mt-8 inline-block text-sm text-cyan-400"
      >
        Mis reservas (comensal) →
      </Link>
    </main>
  );
}
