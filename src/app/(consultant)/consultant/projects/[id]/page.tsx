"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/hooks/useProject";
import { useUser } from "@/hooks/useUser";
import { IntakeView } from "@/components/consultant/IntakeView";
import { AIGenerator } from "@/components/consultant/AIGenerator";
import { DeliverableEditor } from "@/components/consultant/DeliverableEditor";
import { ProjectMessages } from "@/components/shared/ProjectMessages";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { trackEvent } from "@/components/providers/PostHogProvider";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/formatters";
import type { Intake, AIGeneration, ProjectStatus } from "@/types";

interface ConsultantProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ConsultantProjectPage({ params }: ConsultantProjectPageProps) {
  const { id } = use(params);
  const { project, loading, refetch } = useProject(id);
  const { user } = useUser();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();

    Promise.all([
      supabase
        .from("intakes")
        .select("*")
        .eq("project_id", id)
        .single(),
      supabase
        .from("ai_generations")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]).then(([intakeRes, gensRes]) => {
      if (intakeRes.data) setIntake(intakeRes.data);
      setGenerations(gensRes.data || []);
    });
  }, [id]);

  async function handleStatusChange(newStatus: ProjectStatus) {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        trackEvent.statusChange(id, project?.status || "", newStatus);
        await refetch();
        toast.success("Estado actualizado");
      } else {
        toast.error("Error al actualizar estado");
      }
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleSaveDeliverable(content: string) {
    const supabase = createClient();
    if (generations.length > 0) {
      await supabase
        .from("ai_generations")
        .update({ edited_output: content, status: "reviewed" })
        .eq("id", generations[0].id);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-smoke" />
        <div className="h-64 animate-pulse rounded-xl bg-smoke" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-mid">Proyecto no encontrado.</p>
        <Link href="/consultant/projects" className="mt-4 inline-block text-lime hover:underline">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  // Build context string from intake for AI generator
  const intakeContext = intake
    ? `Empresa: ${intake.sector || "N/A"}, ${intake.employees || "N/A"} empleados, ${intake.location || "N/A"}. Madurez CE: ${intake.ce_maturity}. Residuos: ${intake.main_waste_types?.join(", ") || "N/A"}. Necesidad: ${intake.main_pain || "N/A"}`
    : "Sin datos de intake";

  const statusActions: Record<string, { label: string; next: ProjectStatus }> = {
    active: { label: "Enviar a revisión", next: "in_review" },
    in_review: { label: "Marcar como entregado", next: "delivered" },
  };

  const action = statusActions[project.status];

  return (
    <div>
      <Link
        href="/consultant/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-pale hover:text-off-white"
      >
        <ArrowLeft size={14} /> Volver a proyectos
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-800 text-off-white">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-pale">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          {action && (
            <button
              onClick={() => handleStatusChange(action.next)}
              disabled={statusLoading}
              className="flex items-center gap-2 rounded-lg bg-lime px-3 py-1.5 text-sm font-medium text-black hover:bg-lime-dim disabled:opacity-50"
            >
              {statusLoading && <Loader2 size={14} className="animate-spin" />}
              {action.label}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="intake" className="w-full">
            <TabsList className="bg-smoke border border-steel/30">
              <TabsTrigger value="intake">Intake</TabsTrigger>
              <TabsTrigger value="ai">IA Generator</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="messages">Mensajes</TabsTrigger>
            </TabsList>

            <TabsContent value="intake" className="mt-4">
              {intake ? (
                <IntakeView intake={intake} />
              ) : (
                <div className="rounded-xl border border-steel/30 bg-smoke p-6">
                  <p className="text-sm text-mid">
                    El cliente no ha completado el cuestionario todavía.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <AIGenerator projectId={id} context={intakeContext} />

              {generations.length > 0 && (
                <div className="mt-4 rounded-xl border border-steel/30 bg-smoke p-6">
                  <h3 className="text-sm font-medium text-off-white mb-3">
                    Generaciones anteriores ({generations.length})
                  </h3>
                  <div className="space-y-2">
                    {generations.slice(0, 5).map((gen) => (
                      <div key={gen.id} className="rounded-lg bg-ash p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-mid">
                            {formatDate(gen.created_at)} · {gen.tokens_used} tokens
                          </span>
                          <span className="text-xs text-lime">{gen.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-pale line-clamp-2">
                          {gen.raw_output?.slice(0, 150)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="editor" className="mt-4">
              <DeliverableEditor
                initialContent={
                  generations[0]?.edited_output ||
                  generations[0]?.raw_output ||
                  ""
                }
                onSave={handleSaveDeliverable}
              />
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              <div className="rounded-xl border border-steel/30 bg-smoke">
                {user ? (
                  <ProjectMessages projectId={id} currentUserId={user.id} />
                ) : (
                  <p className="p-6 text-sm text-mid">Cargando...</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-steel/30 bg-smoke p-6">
            <h3 className="text-sm font-medium text-off-white">Info del cliente</h3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs text-mid">Empresa</dt>
                <dd className="text-sm text-off-white">
                  {(project as { client?: { company_name?: string } }).client?.company_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-mid">Contacto</dt>
                <dd className="text-sm text-off-white">
                  {(project as { client?: { full_name?: string } }).client?.full_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-mid">Tipo</dt>
                <dd className="text-sm text-off-white">{project.type?.replace("_", " ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-mid">Urgencia</dt>
                <dd className="text-sm text-off-white capitalize">{project.urgency}</dd>
              </div>
              <div>
                <dt className="text-xs text-mid">Creado</dt>
                <dd className="text-sm text-off-white">{formatDate(project.created_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
