import { requireAuth } from "@/lib/auth";
import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/members", label: "Miembros" },
  { href: "/settings", label: "Configuracion" },
  { href: "/billing", label: "Facturacion" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-xl font-bold text-brand-700">SaaS Boilerplate</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-brand-50 hover:text-brand-700 transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="POST" className="px-4 py-4 border-t border-gray-100">
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            Cerrar sesion
          </button>
        </form>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
