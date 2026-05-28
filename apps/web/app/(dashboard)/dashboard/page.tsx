import { requireAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

type Membership = {
  organization: { id: string; name: string; slug: string; subscription?: { status: string; plan?: { name: string } } };
  role: string;
};

export default async function DashboardPage() {
  const token = await requireAuth();
  const memberships = await apiRequest<Membership[]>("/organizations", { token }).catch(() => []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Tus organizaciones y estado actual</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="Organizaciones" value={memberships.length} />
        <StatCard label="Plan activo" value={memberships[0]?.organization.subscription?.plan?.name ?? "FREE"} />
        <StatCard label="Tu rol" value={memberships[0]?.role ?? "—"} />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Workspaces</h2>
      <div className="space-y-3">
        {memberships.map((m) => (
          <div key={m.organization.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{m.organization.name}</p>
              <p className="text-xs text-gray-400">{m.organization.slug}</p>
            </div>
            <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-3 py-1 rounded-full">
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
