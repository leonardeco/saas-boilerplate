"use client";
import { useState } from "react";

type Member = { id: string; name: string; email: string; role: string };

const mockMembers: Member[] = [
  { id: "1", name: "Tu nombre", email: "tu@email.com", role: "OWNER" },
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al invitar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Miembros</h1>
      <p className="text-gray-500 text-sm mb-8">Gestiona los miembros de tu organizacion</p>

      {/* Invite form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Invitar miembro</h2>
        <form onSubmit={invite} className="flex gap-3 flex-wrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="correo@email.com"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="MEMBER">Miembro</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Invitar"}
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Members list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-5 py-3 text-gray-500">{m.email}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                    {m.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {m.role !== "OWNER" && (
                    <button
                      onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
