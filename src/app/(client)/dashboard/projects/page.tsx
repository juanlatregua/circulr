"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination, paginate } from "@/components/shared/Pagination";
import { formatDate, formatEUR } from "@/lib/utils/formatters";
import type { Project } from "@/types";

const PAGE_SIZE = 10;

export default function ProjectsListPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("projects")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects(data || []);
        setLoading(false);
      });
  }, [user]);

  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const visible = paginate(projects, page, PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-800 text-forest">
            Proyectos
          </h1>
          <p className="mt-1 text-sm text-mid">
            Todos tus proyectos de econom&iacute;a circular.
          </p>
        </div>
        <Link
          href="/dashboard/onboarding"
          className="flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} /> Nuevo proyecto
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-sand bg-white p-12">
          <FolderOpen size={40} className="text-sand" />
          <p className="mt-4 text-sm text-stone">
            No tienes proyectos todav&iacute;a.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="mt-4 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Crear primer proyecto
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {visible.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between rounded-xl border border-sand bg-white p-5 transition-colors hover:border-sand"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-forest">{project.title}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="mt-1 text-xs text-stone line-clamp-1">
                    {project.description}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  {project.price_eur && (
                    <p className="text-sm font-medium text-forest">
                      {formatEUR(project.price_eur / 100)}
                    </p>
                  )}
                  <p className="text-xs text-stone">{formatDate(project.created_at)}</p>
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
