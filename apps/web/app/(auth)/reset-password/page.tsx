"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type State = "verifying" | "ready" | "loading" | "success" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<State>("verifying");
  const [error, setError] = useState("");

  // Verify token is valid before showing the form
  useEffect(() => {
    if (!token) { setState("invalid"); return; }

    fetch(`/api/auth/verify-reset-token?token=${token}`)
      .then((r) => r.json())
      .then((data: { valid: boolean }) => setState(data.valid ? "ready" : "invalid"))
      .catch(() => setState("invalid"));
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("loading");
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Las contrasenas no coinciden");
      setState("ready");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al restablecer");
      setState("success");
      // Auto-redirect after 2s (user is logged in via the returned tokens)
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setState("ready");
    }
  }

  // ─── States ──────────────────────────────────────────────────────────────

  if (state === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-gray-500">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace invalido o expirado</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Este enlace ya fue usado o expiro. Los enlaces de recuperacion son validos por 60 minutos.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Contrasena restablecida</h1>
          <p className="text-gray-500 text-sm mb-2">Tu contrasena fue actualizada correctamente.</p>
          <p className="text-xs text-gray-400">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Main form ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nueva contrasena</h1>
        <p className="text-gray-500 text-sm mb-6">Elige una contrasena segura de al menos 8 caracteres.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contrasena</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Minimo 8 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contrasena</label>
            <input
              name="confirm"
              type="password"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Repite tu contrasena"
            />
          </div>

          {/* Password strength hint */}
          <p className="text-xs text-gray-400">
            Usa una combinacion de letras, numeros y simbolos para mayor seguridad.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {state === "loading" && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {state === "loading" ? "Guardando..." : "Establecer nueva contrasena"}
          </button>
        </form>
      </div>
    </div>
  );
}
