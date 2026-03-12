"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination, paginate } from "@/components/shared/Pagination";
import { formatDate } from "@/lib/utils/formatters";
import type { Project, Profile } from "@/types";

const PAGE_SIZE = 10;

interface ProjectWithClient extends Project {
  client?: Profile;
}

export default function ConsultantProjectsPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("projects")
      .select("*, client:profiles!client_id(*)")
      .eq("consultant_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setProjects((data as unknown as ProjectWithClient[]) || []);
        setLoading(false);
      });
  }, [user]);

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const visible = paginate(projects, page, PAGE_SIZE);

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Proyectos
      </h1>
      <p className="mt-1 text-sm text-pale">
        Todos tus proyectos asignados.
      </p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-smoke" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-steel/30 bg-smoke p-12">
          <FolderOpen size={40} className="text-steel" />
          <p className="mt-4 text-sm text-mid">
            No tienes proyectos asignados todav&iacute;a.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {visible.map((project) => (
              <Link
                key={project.id}
                href={`/consultant/projects/${project.id}`}
                className="flex items-center justify-between rounded-xl border border-steel/30 bg-smoke p-5 transition-colors hover:border-steel"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-off-white">{project.title}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="mt-1 text-xs text-mid">
                    {project.client?.company_name || project.client?.full_name || "Cliente"}
                    {" · "}
                    {formatDate(project.updated_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
