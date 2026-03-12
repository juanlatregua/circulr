"use client";

import { useEffect, useState } from "react";
import { Users, FolderOpen, CreditCard, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { formatEUR } from "@/lib/utils/formatters";

interface PlatformStats {
  totalUsers: number;
  totalClients: number;
  totalConsultants: number;
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalGenerations: number;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchStats() {
      const [profilesRes, projectsRes, invoicesRes, gensRes] =
        await Promise.all([
          supabase.from("profiles").select("id, role"),
          supabase.from("projects").select("id, status"),
          supabase
            .from("invoices")
            .select("amount_eur, status")
            .eq("status", "paid"),
          supabase.from("ai_generations").select("id", { count: "exact" }),
        ]);

      const profiles = profilesRes.data || [];
      const projects = projectsRes.data || [];
      const invoices = invoicesRes.data || [];

      setStats({
        totalUsers: profiles.length,
        totalClients: profiles.filter((p) => p.role === "client").length,
        totalConsultants: profiles.filter((p) => p.role === "consultant")
          .length,
        totalProjects: projects.length,
        activeProjects: projects.filter((p) =>
          ["active", "in_review"].includes(p.status)
        ).length,
        totalRevenue: invoices.reduce(
          (sum, inv) => sum + (inv.amount_eur || 0),
          0
        ),
        totalGenerations: gensRes.count || 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  const cards = stats
    ? [
        {
          label: "Usuarios totales",
          value: String(stats.totalUsers),
          sub: `${stats.totalClients} clientes / ${stats.totalConsultants} consultores`,
          icon: Users,
        },
        {
          label: "Proyectos",
          value: String(stats.totalProjects),
          sub: `${stats.activeProjects} activos`,
          icon: FolderOpen,
        },
        {
          label: "Ingresos totales",
          value: formatEUR(stats.totalRevenue / 100),
          sub: "Facturas pagadas",
          icon: CreditCard,
        },
        {
          label: "Generaciones IA",
          value: String(stats.totalGenerations),
          sub: "Total acumulado",
          icon: Sparkles,
        },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-800 text-off-white">
          Panel de Administraci&oacute;n
        </h1>
        <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400">
          Admin
        </span>
      </div>
      <p className="mt-1 text-sm text-pale">
        Vista general de la plataforma CIRCULR.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-smoke"
              />
            ))
          : cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-steel/30 bg-smoke p-5"
              >
                <div className="flex items-center gap-3">
                  <card.icon size={20} className="text-lime" />
                  <span className="text-sm text-pale">{card.label}</span>
                </div>
                <p className="mt-3 font-display text-2xl font-700 text-off-white">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-mid">{card.sub}</p>
              </div>
            ))}
      </div>
    </div>
  );
}
