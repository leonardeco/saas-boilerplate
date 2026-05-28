"use client";
import { useEffect } from "react";

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar esta seccion</h2>
      <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
        {error.message || "Ocurrio un error inesperado."}
      </p>
      <button
        onClick={reset}
        className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
