import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos | NightTable CO",
  description: "Términos de uso de NightTable CO",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-cyan-400">
        ← Inicio
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-white">Términos de uso</h1>
      <p className="mt-2 text-sm text-slate-400">Última actualización: 2026-07-18</p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-slate-300">
        <p>
          Al usar NightTable CO aceptas estos términos. Si no estás de acuerdo,
          no uses la plataforma.
        </p>
        <h2 className="text-lg font-semibold text-white">Servicio</h2>
        <p>
          NightTable facilita el descubrimiento y reserva en restaurantes, bares
          y discotecas. La experiencia final depende del local (confirmación,
          políticas de cancelación, dress code, cover, edad mínima).
        </p>
        <h2 className="text-lg font-semibold text-white">Cuentas</h2>
        <p>
          Eres responsable de la confidencialidad de tu acceso. Proporciona
          información veraz. Podemos suspender cuentas por abuso, fraude o
          violación de estos términos.
        </p>
        <h2 className="text-lg font-semibold text-white">Reservas</h2>
        <p>
          Un HOLD es temporal. La confirmación sujeta a disponibilidad. Los
          no-shows reiterados pueden limitar el uso del servicio.
        </p>
        <h2 className="text-lg font-semibold text-white">Locales (SaaS)</h2>
        <p>
          Los operadores de locales garantizan derechos sobre la ficha que
          reclaman y el cumplimiento de normas locales (licencias, 18+, etc.).
          Los planes de suscripción se facturan vía Stripe.
        </p>
        <h2 className="text-lg font-semibold text-white">Contenido</h2>
        <p>
          Las reseñas deben ser honestas y no ilícitas. Podemos moderar o
          eliminar contenido que viole estas reglas.
        </p>
        <h2 className="text-lg font-semibold text-white">Limitación</h2>
        <p>
          El servicio se ofrece &quot;tal cual&quot;. No respondemos por daños
          indirectos en la máxima medida permitida por la ley colombiana.
        </p>
        <h2 className="text-lg font-semibold text-white">Contacto</h2>
        <p>legal@yourdomain.com</p>
      </div>
    </main>
  );
}
