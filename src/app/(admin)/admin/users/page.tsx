"use client";

import { useEffect, useState } from "react";
import { Users, Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatters";
import type { Profile } from "@/types";

const roleConfig: Record<string, { label: string; className: string }> = {
  client: { label: "Cliente", className: "bg-blue-500/20 text-blue-400" },
  consultant: {
    label: "Consultor",
    className: "bg-emerald-500/20 text-emerald-400",
  },
  admin: { label: "Admin", className: "bg-red-500/20 text-red-400" },
};

export default function AdminUsersPage() {
  const { user } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProfiles(data || []);
        setLoading(false);
      });
  }, [user]);

  async function handleRoleChange(profileId: string, newRole: string) {
    setUpdating(profileId);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", profileId);

    if (!error) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? { ...p, role: newRole as Profile["role"] }
            : p
        )
      );
    }
    setUpdating(null);
  }

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.company_name?.toLowerCase().includes(q) ||
      p.role.includes(q)
    );
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Usuarios
      </h1>
      <p className="mt-1 text-sm text-pale">
        Gestiona los usuarios de la plataforma.
      </p>

      {/* Search */}
      <div className="mt-6 relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-mid"
        />
        <input
          type="text"
          placeholder="Buscar por nombre, empresa o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-steel/30 bg-smoke py-2 pl-9 pr-3 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
        />
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-4">
        <span className="text-sm text-pale">
          Total: <strong className="text-off-white">{profiles.length}</strong>
        </span>
        <span className="text-sm text-pale">
          Clientes:{" "}
          <strong className="text-off-white">
            {profiles.filter((p) => p.role === "client").length}
          </strong>
        </span>
        <span className="text-sm text-pale">
          Consultores:{" "}
          <strong className="text-off-white">
            {profiles.filter((p) => p.role === "consultant").length}
          </strong>
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-smoke" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-steel/30 bg-smoke p-12">
          <Users size={40} className="text-steel" />
          <p className="mt-4 text-sm text-mid">
            {search ? "Sin resultados." : "No hay usuarios."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-steel/30 text-xs uppercase text-mid">
                <th className="pb-3 pr-4 font-medium">Nombre</th>
                <th className="pb-3 pr-4 font-medium">Empresa</th>
                <th className="pb-3 pr-4 font-medium">Sector</th>
                <th className="pb-3 pr-4 font-medium">Rol</th>
                <th className="pb-3 pr-4 font-medium">Registrado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/20">
              {filtered.map((p) => {
                const config = roleConfig[p.role] || roleConfig.client;

                return (
                  <tr key={p.id} className="text-off-white">
                    <td className="py-3 pr-4">
                      <span className="font-medium">
                        {p.full_name || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-pale">
                      {p.company_name || "—"}
                    </td>
                    <td className="py-3 pr-4 text-pale">
                      {p.sector || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={config.className}>
                        {config.label}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-pale">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="py-3">
                      {p.id === user?.id ? (
                        <span className="text-xs text-mid">T&uacute;</span>
                      ) : (
                        <div className="relative">
                          {updating === p.id && (
                            <Loader2
                              size={14}
                              className="absolute -left-5 top-1/2 -translate-y-1/2 animate-spin text-lime"
                            />
                          )}
                          <select
                            value={p.role}
                            onChange={(e) =>
                              handleRoleChange(p.id, e.target.value)
                            }
                            disabled={updating === p.id}
                            className="rounded border border-steel/30 bg-smoke px-2 py-1 text-xs text-off-white focus:border-lime focus:outline-none disabled:opacity-50"
                          >
                            <option value="client">Cliente</option>
                            <option value="consultant">Consultor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
