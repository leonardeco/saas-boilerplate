"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth-client";
import { OAuthButtons } from "@/components/oauth-buttons";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<{
    google: boolean;
    github: boolean;
  }>({ google: true, github: true });

  useEffect(() => {
    const err = search.get("error");
    if (err) setError(err);
    apiFetch("/auth/oauth/providers")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setProviders(j.data);
      })
      .catch(() => undefined);
  }, [search]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Error al iniciar sesión",
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("No se pudo conectar con la API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-8">
        <OAuthButtons providers={providers} />
        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-800" />
          o con email
          <div className="h-px flex-1 bg-slate-800" />
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Contraseña
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 py-2 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "…" : "Entrar"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-cyan-400">
        ← Inicio
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Iniciar sesión</h1>
      <p className="mt-2 text-xs text-slate-500">
        Sesión por cookies httpOnly · OAuth Google/GitHub
      </p>
      <Suspense fallback={<p className="mt-8 text-slate-500">Cargando…</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-sm text-slate-400">
        ¿Sin cuenta?{" "}
        <Link href="/register" className="text-cyan-400">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
