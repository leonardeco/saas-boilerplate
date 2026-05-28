"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("Mi Organizacion");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800)); // simulated save
    setSaved(true);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configuracion</h1>
      <p className="text-gray-500 text-sm mb-8">Administra tu organizacion</p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg">
        <h2 className="font-semibold text-gray-800 mb-4">Informacion general</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la organizacion</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {saved && <p className="text-green-600 text-sm">Guardado correctamente</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-200 rounded-xl p-6 max-w-lg mt-8">
        <h2 className="font-semibold text-red-600 mb-2">Zona de peligro</h2>
        <p className="text-sm text-gray-500 mb-4">
          Eliminar la organizacion es una accion permanente e irreversible.
        </p>
        <button className="border border-red-500 text-red-600 hover:bg-red-50 font-medium px-5 py-2 rounded-lg text-sm transition">
          Eliminar organizacion
        </button>
      </div>
    </div>
  );
}
