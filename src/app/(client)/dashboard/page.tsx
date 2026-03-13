"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, MessageSquare, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Project } from "@/types";
import { formatRelativeTime } from "@/lib/utils/formatters";

export default function DashboardPage() {
  const { user, profile } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchData() {
      const [projectsRes, messagesRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("client_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("messages")
          .select("id, project_id, sender_id, read_at")
          .is("read_at", null)
          .neq("sender_id", user!.id),
      ]);

      setProjects(projectsRes.data || []);
      setUnreadCount(messagesRes.data?.length || 0);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  const activeProjects = projects.filter((p) =>
    ["active", "in_review"].includes(p.status)
  );

  const nextDeadline = projects
    .filter((p) => p.deadline && ["active", "in_review"].includes(p.status))
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))[0]?.deadline;

  const stats = [
    { label: "Proyectos activos", value: String(activeProjects.length), icon: FolderOpen },
    { label: "Mensajes sin leer", value: String(unreadCount), icon: MessageSquare },
    { label: "Próximo deadline", value: nextDeadline ? new Date(nextDeadline).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—", icon: Clock },
    { label: "Total proyectos", value: String(projects.length), icon: TrendingUp },
  ];

  if (!profile?.onboarded && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="font-display text-2xl font-800 text-forest">
          Bienvenido a CIRCULR
        </h1>
        <p className="mt-2 text-sm text-mid">
          Completa tu perfil para empezar.
        </p>
        <Link
          href="/dashboard/onboarding"
          className="mt-6 rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Completar onboarding
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-mid">
        {profile?.company_name ? `${profile.company_name} — ` : ""}Gestiona tus proyectos de economía circular.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-sand bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <stat.icon size={20} className="text-teal" />
              <span className="text-sm text-mid">{stat.label}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-700 text-forest">
              {loading ? "…" : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-700 text-forest">
              Proyectos recientes
            </h2>
            <Link href="/dashboard/projects" className="flex items-center gap-1 text-sm text-teal hover:underline">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between rounded-xl border border-sand bg-white p-4 transition-colors hover:border-sand"
              >
                <div>
                  <h3 className="text-sm font-medium text-forest">{project.title}</h3>
                  <p className="mt-0.5 text-xs text-stone">{formatRelativeTime(project.created_at)}</p>
                </div>
                <StatusBadge status={project.status} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && !loading && profile?.onboarded && (
        <div className="mt-8 rounded-xl border border-sand bg-white p-6 text-center">
          <h2 className="font-display text-lg font-700 text-forest">
            No tienes proyectos todavía
          </h2>
          <p className="mt-2 text-sm text-mid">
            Solicita tu primer diagnóstico de economía circular.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="mt-4 inline-block rounded-full bg-gradient-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Nuevo proyecto
          </Link>
        </div>
      )}
    </div>
  );
}
