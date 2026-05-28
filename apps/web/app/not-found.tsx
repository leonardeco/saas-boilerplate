import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <p className="text-8xl font-black text-brand-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagina no encontrada</h1>
      <p className="text-gray-500 text-sm mb-8 text-center max-w-sm">
        La pagina que buscas no existe o fue movida.
      </p>
      <Link
        href="/dashboard"
        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
      >
        Volver al dashboard
      </Link>
    </div>
  );
}
