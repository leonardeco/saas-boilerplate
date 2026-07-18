import Link from "next/link";
import type { Metadata } from "next";
import { fetchJson, type VenueCard } from "@/lib/api";

type Props = {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ lens?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const name = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    title: `${name} — Food & Nightlife premium | NightTable CO`,
    description: `Restaurantes, bares y discotecas top en ${name}, Colombia.`,
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city } = await params;
  const sp = await searchParams;
  const lens = sp.lens === "salir" ? "salir" : "comer";

  let venues: VenueCard[] = [];
  let error: string | null = null;
  try {
    const json = await fetchJson<{ data: VenueCard[] }>(
      `/catalog/search?city=${encodeURIComponent(city)}&lens=${lens}&premiumOnly=true`,
    );
    venues = json.data;
  } catch {
    error = "No se pudo cargar el catálogo. ¿API y seed activos?";
  }

  const title = city.replace(/-/g, " ");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-cyan-400 hover:underline">
        ← NightTable CO
      </Link>
      <h1 className="mt-4 text-3xl font-bold capitalize text-white">
        {title}
      </h1>
      <p className="mt-2 text-slate-400">
        Locales premium · lentes Comer / Salir
      </p>

      <div className="mt-6 flex gap-2">
        <Link
          href={`/co/${city}?lens=comer`}
          className={`rounded-full px-4 py-1.5 text-sm ${
            lens === "comer"
              ? "bg-cyan-500 text-slate-950"
              : "bg-slate-800 text-slate-200"
          }`}
        >
          Comer
        </Link>
        <Link
          href={`/co/${city}?lens=salir`}
          className={`rounded-full px-4 py-1.5 text-sm ${
            lens === "salir"
              ? "bg-fuchsia-500 text-slate-950"
              : "bg-slate-800 text-slate-200"
          }`}
        >
          Salir
        </Link>
      </div>

      {error && (
        <p className="mt-8 rounded-lg border border-amber-800/50 bg-amber-950/30 p-4 text-amber-200">
          {error}
        </p>
      )}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {venues.map((v) => (
          <li key={v.id}>
            <Link
              href={`/co/${city}/${v.slug}`}
              className="block rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-cyan-700/50"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-white">{v.name}</h2>
                <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                  {v.type}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                {v.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>
                  ★ {v.ratingAvg?.toFixed(1) ?? "—"} ({v.ratingCount})
                </span>
                <span>score {v.qualityScore}</span>
                {v.curationBadge && (
                  <span className="text-cyan-400">curado</span>
                )}
                {v.bookingEnabled && (
                  <span className="text-emerald-400">reserva online</span>
                )}
              </div>
            </Link>
          </li>
        ))}
        {!error && venues.length === 0 && (
          <li className="text-slate-500">
            Sin venues publicados en esta ciudad/lente. Ejecuta el seed.
          </li>
        )}
      </ul>
    </main>
  );
}
