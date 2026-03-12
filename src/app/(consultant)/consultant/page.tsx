"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Users, Sparkles, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { ProjectKanban } from "@/components/consultant/ProjectKanban";
import type { Project } from "@/types";

export default function ConsultantDashboard() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [genCount, setGenCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchData() {
      const [projectsRes, gensRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("consultant_id", user!.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("ai_generations")
          .select("id", { count: "exact" })
          .eq("consultant_id", user!.id),
      ]);

      setProjects(projectsRes.data || []);
      setGenCount(gensRes.count || 0);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  const activeProjects = projects.filter((p) =>
    ["active", "in_review"].includes(p.status)
  );
  const uniqueClients = new Set(projects.map((p) => p.client_id)).size;
  const deliveredCount = projects.filter((p) =>
    ["delivered", "closed"].includes(p.status)
  ).length;
  const deliveryRate =
    projects.length > 0
      ? Math.round((deliveredCount / projects.length) * 100) + "%"
      : "—";

  const stats = [
    { label: "Proyectos activos", value: String(activeProjects.length), icon: FolderOpen },
    { label: "Clientes", value: String(uniqueClients), icon: Users },
    { label: "Generaciones IA", value: String(genCount), icon: Sparkles },
    { label: "Tasa de entrega", value: deliveryRate, icon: BarChart3 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Panel del Consultor
      </h1>
      <p className="mt-1 text-sm text-pale">
        Gestiona tus proyectos y genera entregables con IA.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-steel/30 bg-smoke p-5"
          >
            <div className="flex items-center gap-3">
              <stat.icon size={20} className="text-lime" />
              <span className="text-sm text-pale">{stat.label}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-700 text-off-white">
              {loading ? "…" : stat.value}
            </p>
          </div>
        ))}
      </div>

      {!loading && activeProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-700 text-off-white mb-4">
            Vista Kanban
          </h2>
          <ProjectKanban projects={projects} />
        </div>
      )}
    </div>
  );
}
