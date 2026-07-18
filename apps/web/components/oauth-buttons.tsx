"use client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function OAuthButtons({ providers }: { providers?: { google?: boolean; github?: boolean } }) {
  const google = providers?.google !== false;
  const github = providers?.github !== false;

  return (
    <div className="space-y-2">
      {google && (
        <a
          href={`${API}/auth/oauth/google/start`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 py-2.5 text-sm font-medium text-white hover:border-slate-500"
        >
          <span aria-hidden>G</span> Continuar con Google
        </a>
      )}
      {github && (
        <a
          href={`${API}/auth/oauth/github/start`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 py-2.5 text-sm font-medium text-white hover:border-slate-500"
        >
          <span aria-hidden>⌘</span> Continuar con GitHub
        </a>
      )}
    </div>
  );
}
