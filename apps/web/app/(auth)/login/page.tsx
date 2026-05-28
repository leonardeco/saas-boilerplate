"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OAuthButtons } from "@/components/ui/OAuthButtons";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [error, setError] = useState(oauthError ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Credenciales incorrectas");
      }
      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de nuevo</h1>
        <p className="text-gray-500 text-sm mb-6">Inicia sesion en tu cuenta</p>

        {/* OAuth buttons */}
        <OAuthButtons />

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Contrasena</label>
              <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">
                Olvidaste tu contrasena?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-red-600 text-sm">{decodeURIComponent(error)}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Iniciando sesion..." : "Iniciar sesion"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No tienes cuenta?{" "}
          <Link href="/register" className="text-brand-600 font-medium hover:underline">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
