"use client";
import { useState } from "react";
import Link from "next/link";

type State = "idle" | "loading" | "success";

export default function ForgotPasswordPage() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("loading");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al enviar");
      setState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setState("idle");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {state === "success" ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Revisa tu email</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Si existe una cuenta con ese email, recibiras un enlace para restablecer tu contrasena en los proximos minutos.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              No ves el email? Revisa tu carpeta de spam.
            </p>
            <Link href="/login" className="text-brand-600 font-medium text-sm hover:underline">
              Volver al login
            </Link>
          </div>
        ) : (
          <>
            {/* Back link */}
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver al login
            </Link>

            {/* Icon */}
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Olvidaste tu contrasena?</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Ingresa el email de tu cuenta y te enviaremos un enlace para crear una nueva contrasena.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

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
                {state === "loading" ? "Enviando..." : "Enviar enlace de recuperacion"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
