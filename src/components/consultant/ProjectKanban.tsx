import Link from "next/link";
import type { Project, ProjectStatus } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";

const columns: { status: ProjectStatus; label: string }[] = [
  { status: "active", label: "Activos" },
  { status: "in_review", label: "En revisión" },
  { status: "delivered", label: "Entregados" },
];

interface ProjectKanbanProps {
  projects: Project[];
}

export function ProjectKanban({ projects }: ProjectKanbanProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => (
        <div key={col.status} className="rounded-xl border border-sand bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-forest">{col.label}</h3>
            <span className="text-xs text-stone">
              {projects.filter((p) => p.status === col.status).length}
            </span>
          </div>
          <div className="space-y-3">
            {projects
              .filter((p) => p.status === col.status)
              .map((project) => (
                <Link
                  key={project.id}
                  href={`/consultant/projects/${project.id}`}
                  className="block rounded-lg border border-sand bg-mist p-3 transition-colors hover:border-stone"
                >
                  <h4 className="text-sm font-medium text-forest">{project.title}</h4>
                  <p className="mt-1 text-xs text-stone line-clamp-2">{project.description}</p>
                  <div className="mt-2">
                    <StatusBadge status={project.status} />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
