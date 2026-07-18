import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad | NightTable CO",
  description: "Política de privacidad y tratamiento de datos — NightTable CO",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 prose prose-invert prose-slate">
      <Link href="/" className="text-sm text-cyan-400 no-underline">
        ← Inicio
      </Link>
      <h1 className="text-3xl font-bold text-white">Política de privacidad</h1>
      <p className="text-slate-400 text-sm">
        Última actualización: 2026-07-18 · NightTable CO (Colombia)
      </p>

      <section className="mt-8 space-y-4 text-slate-300 text-sm leading-relaxed">
        <p>
          Esta política describe cómo tratamos datos personales al usar la
          plataforma NightTable CO (web y apps). Cumplimos principios de{" "}
          <strong>Habeas Data</strong> (Ley 1581 de 2012 y normas
          complementarias en Colombia).
        </p>

        <h2 className="text-lg font-semibold text-white">1. Responsable</h2>
        <p>
          El responsable del tratamiento es el operador de NightTable CO.
          Contacto de privacidad:{" "}
          <em>privacy@yourdomain.com</em> (configura este correo antes del
          lanzamiento).
        </p>

        <h2 className="text-lg font-semibold text-white">2. Datos que tratamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Identificación: nombre, email, teléfono (opcional)</li>
          <li>Cuenta: contraseña hasheada o datos OAuth (Google/GitHub)</li>
          <li>Reservas: local, fecha/hora, tamaño de grupo, notas</li>
          <li>Reseñas y calificaciones que publiques</li>
          <li>Datos de locales y staff (organizaciones multi-sede)</li>
          <li>Datos técnicos: IP, logs de seguridad, cookies de sesión</li>
          <li>Pagos de planes SaaS: gestionados por Stripe (no almacenamos tarjetas)</li>
        </ul>

        <h2 className="text-lg font-semibold text-white">3. Finalidades</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Crear y administrar tu cuenta</li>
          <li>Gestionar reservas y notificaciones (email / WhatsApp si lo autorizas)</li>
          <li>Mostrar catálogo y mejorar calidad del servicio</li>
          <li>Facturación de planes a locales</li>
          <li>Seguridad, prevención de fraude y cumplimiento legal</li>
        </ul>

        <h2 className="text-lg font-semibold text-white">4. Bases y derechos</h2>
        <p>
          Puedes ejercer acceso, actualización, rectificación y supresión
          escribiendo a privacidad. Conservamos datos el tiempo necesario para
          las finalidades y obligaciones legales.
        </p>

        <h2 className="text-lg font-semibold text-white">5. Encargados</h2>
        <p>
          Proveedores de infraestructura (hosting, base de datos, email, pagos,
          mapas/POI) bajo contratos y medidas de seguridad razonables. Algunos
          pueden estar fuera de Colombia; aplicamos salvaguardas adecuadas.
        </p>

        <h2 className="text-lg font-semibold text-white">6. Cookies</h2>
        <p>
          Usamos cookies httpOnly de sesión de autenticación. No vendemos datos
          personales.
        </p>

        <h2 className="text-lg font-semibold text-white">7. Menores</h2>
        <p>
          El servicio no está dirigido a menores de 14 años. Locales nightlife
          pueden restringir 18+.
        </p>

        <h2 className="text-lg font-semibold text-white">8. Cambios</h2>
        <p>
          Publicaremos actualizaciones en esta página con nueva fecha.
        </p>
      </section>
    </main>
  );
}
