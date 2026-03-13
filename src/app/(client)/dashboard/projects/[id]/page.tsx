"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/hooks/useProject";
import { useUser } from "@/hooks/useUser";
import { ProjectTimeline } from "@/components/client/ProjectTimeline";
import { ProjectMessages } from "@/components/shared/ProjectMessages";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DocumentUpload } from "@/components/client/DocumentUpload";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatEUR } from "@/lib/utils/formatters";
import { trackEvent } from "@/components/providers/PostHogProvider";
import type { Document as DocType } from "@/types";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { project, loading, refetch } = useProject(id);
  const { user } = useUser();
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [approving, setApproving] = useState(false);

  // Show payment confirmation toast
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast.success("Pago procesado correctamente. Tu proyecto está activo.");
      trackEvent.paymentSuccess(id, 0);
    } else if (payment === "cancelled") {
      toast.error("Pago cancelado. Puedes intentarlo de nuevo.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;
    const supabase = createClient();
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setDocuments(data || []));
  }, [id]);

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
        <Link href="/dashboard/projects" className="mt-4 inline-block text-teal hover:underline">
          Volver a proyectos
        </Link>
      </div>
    );
  }

  const deliverables = documents.filter((d) =>
    d.type === "final_deliverable" || d.type === "generated_draft"
  );
  const uploads = documents.filter((d) => d.type === "client_upload");

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-mid hover:text-forest"
      >
        <ArrowLeft size={14} /> Volver a proyectos
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-800 text-forest">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-mid">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          {project.status === "delivered" && (
            <button
              onClick={async () => {
                setApproving(true);
                try {
                  const res = await fetch(`/api/projects/${id}/approve`, { method: "POST" });
                  if (res.ok) {
                    await refetch();
                    toast.success("Entregable aprobado");
                  } else {
                    toast.error("Error al aprobar");
                  }
                } finally {
                  setApproving(false);
                }
              }}
              disabled={approving}
              className="flex items-center gap-2 rounded-full bg-gradient-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Aprobar entregable
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="docs" className="w-full">
            <TabsList className="bg-white border border-sand">
              <TabsTrigger value="docs">Documentos</TabsTrigger>
              <TabsTrigger value="deliverables">Entregables</TabsTrigger>
              <TabsTrigger value="messages">Mensajes</TabsTrigger>
            </TabsList>

            <TabsContent value="docs" className="mt-4">
              <div className="rounded-xl border border-sand bg-white p-6">
                <h3 className="text-sm font-medium text-forest mb-4">Tus documentos</h3>
                {uploads.length === 0 ? (
                  <p className="text-sm text-stone">No has subido documentos todavía.</p>
                ) : (
                  <div className="space-y-2">
                    {uploads.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg bg-mist p-3">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-mid" />
                          <span className="text-sm text-forest">{doc.filename}</span>
                        </div>
                        <span className="text-xs text-stone">{formatDate(doc.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <DocumentUpload projectId={id} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deliverables" className="mt-4">
              <div className="rounded-xl border border-sand bg-white p-6">
                <h3 className="text-sm font-medium text-forest mb-4">Entregables</h3>
                {deliverables.length === 0 ? (
                  <p className="text-sm text-stone">
                    Los entregables de tu consultor aparecerán aquí.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {deliverables.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg bg-mist p-3">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-teal" />
                          <span className="text-sm text-forest">{doc.filename}</span>
                        </div>
                        <button className="text-teal hover:opacity-90">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

        <div className="space-y-6">
          <div className="rounded-xl border border-sand bg-white p-6">
            <h3 className="text-sm font-medium text-forest">Detalles</h3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs text-stone">Tipo</dt>
                <dd className="text-sm text-forest">{project.type?.replace("_", " ") || "—"}</dd>
              </div>
              {project.price_eur && (
                <div>
                  <dt className="text-xs text-stone">Precio</dt>
                  <dd className="text-sm text-forest">{formatEUR(project.price_eur / 100)}</dd>
                </div>
              )}
              {project.deadline && (
                <div>
                  <dt className="text-xs text-stone">Deadline</dt>
                  <dd className="text-sm text-forest">{formatDate(project.deadline)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-stone">Creado</dt>
                <dd className="text-sm text-forest">{formatDate(project.created_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-sand bg-white p-6">
            <h3 className="text-sm font-medium text-forest">Progreso</h3>
            <div className="mt-4">
              <ProjectTimeline currentStatus={project.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
