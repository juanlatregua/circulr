"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Send,
  FileText,
  X,
  StickyNote,
  Save,
} from "lucide-react";
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
  const [internalNotes, setInternalNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

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
      const gens = gensRes.data || [];
      setGenerations(gens);
      // Load internal notes from the latest generation
      if (gens.length > 0 && gens[0].internal_notes) {
        setInternalNotes(gens[0].internal_notes);
      }
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

  async function handleApproveAndDeliver() {
    await handleStatusChange("delivered");
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

  async function handleSaveNotes() {
    if (generations.length === 0) {
      toast.error("No hay generaciones donde guardar notas");
      return;
    }
    setNotesSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("ai_generations")
        .update({ internal_notes: internalNotes })
        .eq("id", generations[0].id);
      toast.success("Notas guardadas");
    } catch {
      toast.error("Error al guardar notas");
    } finally {
      setNotesSaving(false);
    }
  }

  async function handlePreviewPdf() {
    try {
      const content =
        generations[0]?.edited_output || generations[0]?.raw_output || "";
      if (!content) {
        toast.error("No hay contenido para generar el PDF");
        return;
      }
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          content,
          title: project?.title,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
      } else {
        toast.error("Error al generar PDF");
      }
    } catch {
      toast.error("Error al generar PDF");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white" />
        <div className="h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-stone">Proyecto no encontrado.</p>
        <Link href="/consultant/projects" className="mt-4 inline-block text-teal hover:underline">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  const intakeContext = intake
    ? `Empresa: ${intake.sector || "N/A"}, ${intake.employees || "N/A"} empleados, ${intake.location || "N/A"}. Madurez CE: ${intake.ce_maturity}. Residuos: ${intake.main_waste_types?.join(", ") || "N/A"}. Necesidad: ${intake.main_pain || "N/A"}`
    : "Sin datos de intake";

  const statusActions: Record<string, { label: string; next: ProjectStatus; icon: React.ReactNode }> = {
    active: { label: "Enviar a revisión", next: "in_review", icon: <Send size={14} /> },
    in_review: { label: "Aprobar y entregar", next: "delivered", icon: <CheckCircle2 size={14} /> },
  };

  const action = statusActions[project.status];

  return (
    <div>
      <Link
        href="/consultant/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-mid hover:text-forest"
      >
        <ArrowLeft size={14} /> Volver a proyectos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-800 text-forest">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-mid">{project.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={project.status} />
          {action && (
            <button
              onClick={
                action.next === "delivered"
                  ? handleApproveAndDeliver
                  : () => handleStatusChange(action.next)
              }
              disabled={statusLoading}
              className="flex items-center gap-2 rounded-full gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {statusLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </button>
          )}
          <button
            onClick={handlePreviewPdf}
            className="flex items-center gap-1.5 rounded-full border border-sand px-3 py-2 text-sm text-mid hover:bg-mist transition-colors"
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* 40/60 Layout */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Left: Intake + Info (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <div className="rounded-xl border border-sand bg-white p-6">
            <h3 className="text-sm font-medium text-forest">Info del cliente</h3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs text-stone">Empresa</dt>
                <dd className="text-sm text-forest">
                  {(project as { client?: { company_name?: string } }).client?.company_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone">Contacto</dt>
                <dd className="text-sm text-forest">
                  {(project as { client?: { full_name?: string } }).client?.full_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone">Tipo</dt>
                <dd className="text-sm text-forest">{project.type?.replace("_", " ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone">Urgencia</dt>
                <dd className="text-sm text-forest capitalize">{project.urgency}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone">Creado</dt>
                <dd className="text-sm text-forest">{formatDate(project.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Intake data */}
          <div className="rounded-xl border border-sand bg-white p-6">
            <h3 className="text-sm font-medium text-forest mb-4">
              Datos del cuestionario
            </h3>
            {intake ? (
              <IntakeView intake={intake} />
            ) : (
              <p className="text-sm text-stone">
                El cliente no ha completado el cuestionario todavía.
              </p>
            )}
          </div>

          {/* Internal notes */}
          <div className="rounded-xl border border-sand bg-white p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-forest inline-flex items-center gap-1.5">
                <StickyNote size={14} className="text-coral" />
                Notas internas
              </h3>
              <button
                onClick={handleSaveNotes}
                disabled={notesSaving}
                className="flex items-center gap-1 rounded-lg bg-forest px-2.5 py-1 text-xs text-white hover:bg-forest-light disabled:opacity-50"
              >
                {notesSaving ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                Guardar
              </button>
            </div>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Notas privadas del consultor sobre este proyecto..."
              rows={4}
              className="w-full resize-none rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest placeholder:text-stone focus:border-forest-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Tabs (60%) */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="bg-white border border-sand">
              <TabsTrigger value="ai">IA Generator</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="messages">Mensajes</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="mt-4">
              <AIGenerator projectId={id} context={intakeContext} />

              {generations.length > 0 && (
                <div className="mt-4 rounded-xl border border-sand bg-white p-6">
                  <h3 className="text-sm font-medium text-forest mb-3">
                    Generaciones anteriores ({generations.length})
                  </h3>
                  <div className="space-y-2">
                    {generations.slice(0, 5).map((gen) => (
                      <div key={gen.id} className="rounded-lg bg-mist p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-stone">
                            {formatDate(gen.created_at)} · {gen.tokens_used} tokens
                          </span>
                          <span className="text-xs text-teal">{gen.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-mid line-clamp-2">
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
              <div className="rounded-xl border border-sand bg-white">
                {user ? (
                  <ProjectMessages projectId={id} currentUserId={user.id} />
                ) : (
                  <p className="p-6 text-sm text-stone">Cargando...</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-4xl h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-sand px-6 py-3">
              <h3 className="font-display font-700 text-forest">
                Vista previa PDF
              </h3>
              <button
                onClick={() => {
                  URL.revokeObjectURL(pdfPreviewUrl);
                  setPdfPreviewUrl(null);
                }}
                className="rounded-lg p-1.5 text-mid hover:bg-mist"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              src={pdfPreviewUrl}
              className="w-full h-[calc(90vh-56px)]"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
