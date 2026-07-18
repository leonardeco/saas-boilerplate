const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type City = {
  name: string;
  slug: string;
  isMajor: boolean;
  activationWave: string;
  departmentName: string;
};

async function getCities(): Promise<City[]> {
  try {
    const res = await fetch(`${API}/geo/cities`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: City[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const cities = await getCities();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
        NightTable CO · S0 Foundation
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Food & Nightlife premium en Colombia
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">
        Marketplace + SaaS para locales. Restaurantes, bares y discotecas con
        excelente calificación. Arquitectura v2 aprobada — sprint S0.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white">Ciudades (seed G2)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Catálogo nacional por olas. Datos desde{" "}
          <code className="text-cyan-300">GET /geo/cities</code>
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {cities.length === 0 && (
            <li className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-400">
              API no disponible. Arranca <code>apps/api</code> en :3001
            </li>
          )}
          {cities.map((c) => (
            <li
              key={c.slug}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="font-medium text-white">{c.name}</div>
              <div className="text-xs text-slate-400">{c.departmentName}</div>
              <div className="mt-2 text-xs text-cyan-400/90">{c.activationWave}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="font-semibold text-white">Stack S1</h2>
        <p className="mt-2 text-sm text-slate-300">
          TypeScript · Next.js 15 · Fastify 5 · PostgreSQL · Redis · Meilisearch ·
          BullMQ · Stripe
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Docs: <code>docs/architecture/v2.md</code> · ADRs en{" "}
          <code>docs/adr/</code>
        </p>
      </section>
    </main>
  );
}
