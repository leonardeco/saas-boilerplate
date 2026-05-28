"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <p className="text-6xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salio mal</h1>
      <p className="text-gray-500 text-sm mb-8 text-center max-w-sm">
        Ocurrio un error inesperado. Puedes intentar de nuevo o contactar soporte si el problema persiste.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-6 font-mono">ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
        >
          Intentar de nuevo
        </button>
        <a
          href="/dashboard"
          className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold px-6 py-2.5 rounded-lg text-sm transition"
        >
          Ir al dashboard
        </a>
      </div>
    </div>
  );
}
