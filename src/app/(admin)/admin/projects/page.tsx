"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatEUR } from "@/lib/utils/formatters";
import type { Project, Profile, ProjectStatus } from "@/types";

interface ProjectWithProfiles extends Project {
  client: Pick<Profile, "full_name" | "company_name"> | null;
  consultant: Pick<Profile, "full_name"> | null;
}

export default function AdminProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<ProjectWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("projects")
      .select(
        "*, client:profiles!projects_client_id_fkey(full_name, company_name), consultant:profiles!projects_consultant_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects((data as unknown as ProjectWithProfiles[]) || []);
        setLoading(false);
      });
  }, [user]);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses: { value: string; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "draft", label: "Borrador" },
    { value: "pending_payment", label: "Pago pendiente" },
    { value: "active", label: "Activo" },
    { value: "in_review", label: "En revisión" },
    { value: "delivered", label: "Entregado" },
    { value: "closed", label: "Cerrado" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Proyectos
      </h1>
      <p className="mt-1 text-sm text-mid">
        Todos los proyectos de la plataforma.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone"
          />
          <input
            type="text"
            placeholder="Buscar por título, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-sand bg-white py-2 pl-9 pr-3 text-sm text-forest placeholder:text-stone focus:border-teal focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-sand bg-white px-3 py-2 text-sm text-forest focus:border-teal focus:outline-none"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="mt-4 flex gap-4 text-sm text-mid">
        <span>
          Total:{" "}
          <strong className="text-forest">{projects.length}</strong>
        </span>
        <span>
          Activos:{" "}
          <strong className="text-forest">
            {
              projects.filter((p) =>
                ["active", "in_review"].includes(p.status)
              ).length
            }
          </strong>
        </span>
        <span>
          Mostrando:{" "}
          <strong className="text-forest">{filtered.length}</strong>
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-sand bg-white p-12">
          <FolderOpen size={40} className="text-sand" />
          <p className="mt-4 text-sm text-stone">
            {search || statusFilter !== "all"
              ? "Sin resultados."
              : "No hay proyectos."}
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sand text-xs uppercase text-stone">
                <th className="pb-3 pr-4 font-medium">T&iacute;tulo</th>
                <th className="pb-3 pr-4 font-medium">Cliente</th>
                <th className="pb-3 pr-4 font-medium">Consultor</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 pr-4 font-medium">Precio</th>
                <th className="pb-3 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filtered.map((p) => (
                <tr key={p.id} className="text-forest">
                  <td className="py-3 pr-4">
                    <span className="font-medium">{p.title}</span>
                  </td>
                  <td className="py-3 pr-4 text-mid">
                    {p.client?.company_name || p.client?.full_name || "—"}
                  </td>
                  <td className="py-3 pr-4 text-mid">
                    {p.consultant?.full_name || "Sin asignar"}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={p.status as ProjectStatus} />
                  </td>
                  <td className="py-3 pr-4 text-mid">
                    {p.price_eur
                      ? formatEUR(p.price_eur / 100)
                      : "—"}
                  </td>
                  <td className="py-3 text-mid">
                    {formatDate(p.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
