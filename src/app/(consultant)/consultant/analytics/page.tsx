"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  CheckCircle,
  Clock,
  Sparkles,
  Activity,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { Project, ProjectStatus } from "@/types";

interface AuditEntry {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  pending_payment: "Pago pendiente",
  active: "Activo",
  in_review: "En revisión",
  delivered: "Entregado",
  closed: "Cerrado",
};

const statusColors: Record<string, string> = {
  draft: "bg-steel/50",
  pending_payment: "bg-yellow-500",
  active: "bg-lime",
  in_review: "bg-blue-500",
  delivered: "bg-emerald-500",
  closed: "bg-mid",
};

export default function AnalyticsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchData() {
      const [projectsRes, gensRes, auditRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("consultant_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("ai_generations")
          .select("tokens_used")
          .eq("consultant_id", user!.id),
        supabase
          .from("audit_log")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

      const projs = projectsRes.data || [];
      setProjects(projs);
      setTotalTokens(
        (gensRes.data || []).reduce((sum, g) => sum + (g.tokens_used || 0), 0)
      );
      setAuditLog((auditRes.data as AuditEntry[]) || []);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  // Stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) =>
    ["delivered", "closed"].includes(p.status)
  ).length;

  // Avg delivery time (days between created_at and updated_at for delivered/closed)
  const deliveredProjects = projects.filter((p) =>
    ["delivered", "closed"].includes(p.status)
  );
  const avgDeliveryDays =
    deliveredProjects.length > 0
      ? Math.round(
          deliveredProjects.reduce((sum, p) => {
            const created = new Date(p.created_at).getTime();
            const updated = new Date(p.updated_at).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
          }, 0) / deliveredProjects.length
        )
      : 0;

  // Projects by status for chart
  const statusCounts = projects.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const stats = [
    {
      label: "Total proyectos",
      value: String(totalProjects),
      icon: FolderOpen,
    },
    {
      label: "Completados",
      value: String(completedProjects),
      icon: CheckCircle,
    },
    {
      label: "Tiempo medio entrega",
      value: avgDeliveryDays > 0 ? `${avgDeliveryDays}d` : "—",
      icon: Clock,
    },
    {
      label: "Tokens IA usados",
      value: totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : String(totalTokens),
      icon: Sparkles,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Analytics
      </h1>
      <p className="mt-1 text-sm text-pale">
        M&eacute;tricas de rendimiento y uso de IA.
      </p>

      {/* Stats cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-smoke"
              />
            ))
          : stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-steel/30 bg-smoke p-5"
              >
                <div className="flex items-center gap-3">
                  <stat.icon size={20} className="text-lime" />
                  <span className="text-sm text-pale">{stat.label}</span>
                </div>
                <p className="mt-3 font-display text-2xl font-700 text-off-white">
                  {stat.value}
                </p>
              </div>
            ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Projects by status chart */}
        <div className="rounded-xl border border-steel/30 bg-smoke p-5">
          <h2 className="font-display text-lg font-700 text-off-white mb-4">
            Proyectos por estado
          </h2>
          {loading ? (
            <div className="h-48 animate-pulse rounded bg-ash" />
          ) : Object.keys(statusCounts).length === 0 ? (
            <p className="text-sm text-mid py-8 text-center">
              Sin datos todav&iacute;a.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = statusCounts[key] || 0;
                if (count === 0) return null;
                const widthPercent = (count / maxCount) * 100;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-pale">{label}</span>
                      <span className="text-xs font-medium text-off-white">
                        {count}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-ash overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColors[key] || "bg-steel"} transition-all duration-500`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity feed */}
        <div className="rounded-xl border border-steel/30 bg-smoke p-5">
          <h2 className="font-display text-lg font-700 text-off-white mb-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-lime" />
              Actividad reciente
            </div>
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded bg-ash"
                />
              ))}
            </div>
          ) : auditLog.length === 0 ? (
            <p className="text-sm text-mid py-8 text-center">
              Sin actividad registrada.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-ash/30"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-lime" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-off-white truncate">
                      {formatAction(entry.action)}
                      {entry.resource_type && (
                        <span className="text-pale">
                          {" "}
                          &middot; {entry.resource_type}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-mid">
                      {formatRelativeTime(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    payment_completed: "Pago completado",
    status_change: "Cambio de estado",
    ai_generation: "Generación IA",
    deliverable_saved: "Entregable guardado",
    message_sent: "Mensaje enviado",
  };
  return map[action] || action.replace(/_/g, " ");
}
