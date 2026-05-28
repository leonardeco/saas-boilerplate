import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-5xl font-bold mb-4 text-center">SaaS Boilerplate</h1>
      <p className="text-xl text-brand-100 mb-10 text-center max-w-xl">
        Auth · Multi-tenancy · Billing · Dashboard — todo listo para escalar.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition"
        >
          Empezar gratis
        </Link>
        <Link
          href="/login"
          className="border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition"
        >
          Iniciar sesion
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {[
          { title: "Auth completo", desc: "Register, login, JWT + refresh tokens, roles" },
          { title: "Multi-tenancy", desc: "Organizaciones, miembros, permisos por rol" },
          { title: "Billing Stripe", desc: "Planes, suscripciones, webhooks y portal de facturacion" },
        ].map((f) => (
          <div key={f.title} className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-brand-100 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
