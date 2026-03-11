import { ProjectTimeline } from "@/components/client/ProjectTimeline";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Proyecto
      </h1>
      <p className="mt-1 text-sm text-pale">ID: {id}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-steel/30 bg-smoke p-6">
            <h2 className="font-display text-lg font-700 text-off-white">
              Detalles del proyecto
            </h2>
            <p className="mt-2 text-sm text-mid">
              Los detalles del proyecto se cargarán aquí.
            </p>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-steel/30 bg-smoke p-6">
            <h3 className="text-sm font-medium text-off-white">Progreso</h3>
            <div className="mt-4">
              <ProjectTimeline currentStatus="draft" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
