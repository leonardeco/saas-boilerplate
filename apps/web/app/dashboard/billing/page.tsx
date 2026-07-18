"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type Plan = {
  id: string;
  name: string;
  maxVenues: number;
  featuredListing: boolean;
};

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl("/billing/plans"))
      .then((r) => r.json())
      .then((j) => setPlans(j.data ?? []))
      .catch(() => setMsg("No se pudieron cargar planes"));
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-cyan-400">
        ← Panel
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Planes SaaS</h1>
      <p className="mt-2 text-slate-400">
        Checkout Stripe requiere <code>STRIPE_SECRET_KEY</code> y price IDs.
      </p>
      {msg && <p className="mt-4 text-amber-300">{msg}</p>}
      <ul className="mt-8 space-y-3">
        {plans.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="font-semibold text-white">{p.name}</div>
            <div className="text-sm text-slate-400">
              max venues {p.maxVenues}
              {p.featuredListing ? " · featured" : ""}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
