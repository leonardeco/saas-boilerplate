import Link from "next/link";
import type { Metadata } from "next";
import { fetchJson } from "@/lib/api";

type Props = { params: Promise<{ city: string; slug: string }> };

type VenueDetail = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  address: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  qualityScore: number;
  curationBadge: boolean;
  bookingEnabled: boolean;
  claimStatus: string;
  minAge: number | null;
  coverAmount: number | null;
  hasGuestList: boolean;
  capacity: number | null;
  priceLevel: number | null;
  citySlug: string;
  cityName: string;
  lat: number;
  lng: number;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  try {
    const json = await fetchJson<{ data: VenueDetail }>(
      `/catalog/${city}/${slug}`,
    );
    return {
      title: `${json.data.name} | NightTable CO`,
      description: json.data.description ?? `Reserva en ${json.data.name}`,
    };
  } catch {
    return { title: "Local | NightTable CO" };
  }
}

export default async function VenuePage({ params }: Props) {
  const { city, slug } = await params;

  let venue: VenueDetail | null = null;
  try {
    const json = await fetchJson<{ data: VenueDetail }>(
      `/catalog/${city}/${slug}`,
    );
    venue = json.data;
  } catch {
    venue = null;
  }

  if (!venue) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-slate-400">Local no encontrado o no publicado.</p>
        <Link href={`/co/${city}`} className="mt-4 inline-block text-cyan-400">
          Volver a {city}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={`/co/${city}`}
        className="text-sm text-cyan-400 hover:underline"
      >
        ← {venue.cityName}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
          {venue.type}
        </span>
        {venue.curationBadge && (
          <span className="rounded bg-cyan-950 px-2 py-0.5 text-xs text-cyan-300">
            Premium curado
          </span>
        )}
      </div>
      <h1 className="mt-3 text-4xl font-bold text-white">{venue.name}</h1>
      <p className="mt-2 text-slate-400">{venue.address}</p>
      <p className="mt-4 text-slate-300">{venue.description}</p>

      <dl className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-sm">
        <div>
          <dt className="text-slate-500">Rating</dt>
          <dd className="text-white">
            ★ {venue.ratingAvg?.toFixed(1)} · {venue.ratingCount} reseñas
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Quality score</dt>
          <dd className="text-white">{venue.qualityScore}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Claim</dt>
          <dd className="text-white">{venue.claimStatus}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Reserva online</dt>
          <dd className="text-white">{venue.bookingEnabled ? "Sí" : "Próximamente"}</dd>
        </div>
        {venue.minAge != null && (
          <div>
            <dt className="text-slate-500">Edad mínima</dt>
            <dd className="text-white">{venue.minAge}+</dd>
          </div>
        )}
        {venue.coverAmount != null && (
          <div>
            <dt className="text-slate-500">Cover</dt>
            <dd className="text-white">
              ${venue.coverAmount.toLocaleString("es-CO")}
            </dd>
          </div>
        )}
        {venue.capacity != null && (
          <div>
            <dt className="text-slate-500">Aforo</dt>
            <dd className="text-white">{venue.capacity}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8">
        {venue.bookingEnabled ? (
          <p className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-4 text-emerald-200">
            Reservas online: motor de booking llega en S3. Este local ya está
            marcado <code>booking_enabled</code>.
          </p>
        ) : (
          <p className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-slate-300">
            Aún no acepta reserva online en NightTable. Claim del local en S4.
          </p>
        )}
      </div>
    </main>
  );
}
