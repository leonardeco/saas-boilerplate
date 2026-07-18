import Link from "next/link";
import { fetchJson, type City } from "@/lib/api";

async function getCities(): Promise<City[]> {
  try {
    const json = await fetchJson<{ data: City[] }>("/geo/cities");
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const cities = await getCities();
  const wave1 = cities.filter((c) => c.activationWave === "wave-1");

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          NightTable CO
        </p>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/dashboard" className="text-slate-300 hover:text-white">
            Panel
          </Link>
          <Link href="/admin" className="text-slate-300 hover:text-white">
            Admin
          </Link>
          <Link href="/login" className="text-slate-300 hover:text-white">
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-cyan-500 px-3 py-1.5 font-medium text-slate-950"
          >
            Registro
          </Link>
        </nav>
      </header>

      <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Food & Nightlife premium en Colombia
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-300">
        Descubre restaurantes, bares y discotecas con excelente calificación.
        Reserva en locales reclamados. Marketplace + SaaS multi-sede.
      </p>

      <section className="mt-14">
        <h2 className="text-xl font-semibold text-white">
          Ciudades wave-1 (activación)
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Catálogo nacional G2 · demo seed en varias ciudades
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {(wave1.length ? wave1 : cities).map((c) => (
            <li key={c.slug}>
              <Link
                href={`/co/${c.slug}`}
                className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-cyan-700/40"
              >
                <div className="font-medium text-white">{c.name}</div>
                <div className="text-xs text-slate-400">{c.departmentName}</div>
                <div className="mt-2 text-xs text-cyan-400/90">
                  {c.activationWave} · ver locales
                </div>
              </Link>
            </li>
          ))}
          {cities.length === 0 && (
            <li className="rounded-xl border border-slate-800 p-4 text-slate-400">
              API no disponible en :3001
            </li>
          )}
        </ul>
      </section>

      <section className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300">
        <p>
          <strong className="text-white">S1</strong> — Auth JWT · migraciones ·
          catálogo premium · SEO ciudad/local · seed demo
        </p>
        <p className="mt-2 text-slate-500">
          Docs: docs/architecture/v2.md · Swagger API: /docs
        </p>
      </section>
    </main>
  );
}
