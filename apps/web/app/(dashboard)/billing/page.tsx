"use client";
import { useState } from "react";

const plans = [
  {
    name: "FREE",
    price: "$0",
    period: "siempre",
    features: ["1 organizacion", "3 proyectos", "1 miembro"],
    priceId: null,
    highlight: false,
  },
  {
    name: "PRO",
    price: "$29",
    period: "mes",
    features: ["Organizaciones ilimitadas", "Proyectos ilimitados", "Hasta 10 miembros", "Soporte prioritario"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? "price_pro",
    highlight: true,
  },
  {
    name: "ENTERPRISE",
    price: "$99",
    period: "mes",
    features: ["Todo en PRO", "Miembros ilimitados", "SLA garantizado", "Onboarding dedicado"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE ?? "price_enterprise",
    highlight: false,
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(priceId: string, planName: string) {
    setLoading(planName);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Facturacion</h1>
      <p className="text-gray-500 text-sm mb-8">Elige el plan que se adapta a tu negocio</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 flex flex-col ${
              plan.highlight
                ? "border-brand-500 bg-brand-600 text-white shadow-lg"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            {plan.highlight && (
              <span className="text-xs font-bold uppercase tracking-widest bg-white text-brand-600 px-2 py-0.5 rounded-full self-start mb-3">
                Popular
              </span>
            )}
            <p className="text-lg font-bold mb-1">{plan.name}</p>
            <p className="text-3xl font-black mb-0.5">{plan.price}</p>
            <p className={`text-xs mb-5 ${plan.highlight ? "text-brand-100" : "text-gray-400"}`}>
              /{plan.period}
            </p>
            <ul className="space-y-2 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlight ? "text-brand-50" : "text-gray-600"}`}>
                  <span className={plan.highlight ? "text-white" : "text-brand-500"}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {plan.priceId ? (
              <button
                onClick={() => handleCheckout(plan.priceId!, plan.name)}
                disabled={loading === plan.name}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${
                  plan.highlight
                    ? "bg-white text-brand-700 hover:bg-brand-50"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                {loading === plan.name ? "Redirigiendo..." : "Suscribirse"}
              </button>
            ) : (
              <span className="text-center text-sm font-medium opacity-60">Plan actual</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md">
        <h2 className="font-semibold text-gray-800 mb-1">Gestionar suscripcion</h2>
        <p className="text-sm text-gray-500 mb-4">
          Actualiza tu metodo de pago, descarga facturas o cancela en el portal de Stripe.
        </p>
        <button
          onClick={handlePortal}
          disabled={loading === "portal"}
          className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-5 py-2 rounded-lg text-sm transition disabled:opacity-50"
        >
          {loading === "portal" ? "Abriendo..." : "Abrir portal de facturacion"}
        </button>
      </div>
    </div>
  );
}
