"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, ensureSession } from "@/lib/auth-client";

export default function AdminPage() {
  const [citySlug, setCitySlug] = useState("bogota");
  const [provider, setProvider] = useState("mock");
  const [jobs, setJobs] = useState<unknown[]>([]);
  const [claims, setClaims] = useState<
    Array<{ id: string; venueId: string; contactEmail: string }>
  >([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    try {
      if (!(await ensureSession())) {
        setMsg("Inicia sesión como SUPERADMIN");
        return;
      }
      const [j, c] = await Promise.all([
        apiFetch("/admin/ingestion"),
        apiFetch("/claims/pending"),
      ]);
      if (j.ok) setJobs((await j.json()).data ?? []);
      if (c.ok) setClaims((await c.json()).data ?? []);
      if (!j.ok && !c.ok) setMsg("Forbidden — necesitas SUPERADMIN");
    } catch {
      setMsg("Error de red o sin rol SUPERADMIN");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function runIngest(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await apiFetch("/admin/ingestion", {
      method: "POST",
      body: JSON.stringify({ citySlug, provider }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Forbidden — necesitas SUPERADMIN");
      return;
    }
    setMsg(`Job encolado ${data.data?.id}`);
    refresh();
  }

  async function approve(id: string) {
    await apiFetch(`/claims/${id}/approve`, { method: "POST" });
    refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-cyan-400">
        ← Inicio
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Admin plataforma</h1>
      <p className="mt-2 text-sm text-slate-400">
        Requiere <code>platform_role = SUPERADMIN</code> · cookies httpOnly
      </p>

      <form
        onSubmit={runIngest}
        className="mt-8 space-y-3 rounded-xl border border-slate-800 p-4"
      >
        <h2 className="font-semibold text-white">Ingestión</h2>
        <input
          value={citySlug}
          onChange={(e) => setCitySlug(e.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          placeholder="city slug"
        />
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        >
          <option value="mock">mock</option>
          <option value="osm">osm</option>
          <option value="google_places">google_places</option>
          <option value="all">all</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-cyan-500 px-4 py-2 text-slate-950"
        >
          Encolar job
        </button>
      </form>

      {msg && <p className="mt-4 text-sm text-amber-200">{msg}</p>}

      <section className="mt-10">
        <h2 className="font-semibold text-white">Claims pendientes</h2>
        <ul className="mt-3 space-y-2">
          {claims.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded border border-slate-800 px-3 py-2 text-sm"
            >
              <span className="text-slate-300">
                {c.contactEmail} · {c.venueId.slice(0, 8)}
              </span>
              <button
                type="button"
                onClick={() => approve(c.id)}
                className="text-emerald-400"
              >
                Aprobar
              </button>
            </li>
          ))}
          {claims.length === 0 && <li className="text-slate-500">Ninguno</li>}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-white">Jobs recientes</h2>
        <pre className="mt-3 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-400">
          {JSON.stringify(jobs, null, 2)}
        </pre>
      </section>
    </main>
  );
}
