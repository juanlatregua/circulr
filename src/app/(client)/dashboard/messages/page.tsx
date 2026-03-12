"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { ProjectMessages } from "@/components/shared/ProjectMessages";
import { Pagination, paginate } from "@/components/shared/Pagination";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/formatters";

const PAGE_SIZE = 10;

interface Conversation {
  projectId: string;
  projectTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchConversations() {
      // Get projects with messages
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title")
        .eq("client_id", user!.id)
        .in("status", ["active", "in_review", "delivered"]);

      if (!projects || projects.length === 0) {
        setLoading(false);
        return;
      }

      const convos: Conversation[] = [];

      for (const project of projects) {
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .eq("project_id", project.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .is("read_at", null)
          .neq("sender_id", user!.id);

        if (messages && messages.length > 0) {
          convos.push({
            projectId: project.id,
            projectTitle: project.title,
            lastMessage: messages[0].content,
            lastMessageAt: messages[0].created_at,
            unreadCount: count || 0,
          });
        } else {
          convos.push({
            projectId: project.id,
            projectTitle: project.title,
            lastMessage: "",
            lastMessageAt: "",
            unreadCount: 0,
          });
        }
      }

      convos.sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));
      setConversations(convos);
      if (convos.length > 0 && !selectedProject) {
        setSelectedProject(convos[0].projectId);
      }
      setLoading(false);
    }

    fetchConversations();
  }, [user]);

  const totalPages = Math.max(1, Math.ceil(conversations.length / PAGE_SIZE));
  const visibleConvos = paginate(conversations, page, PAGE_SIZE);

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-off-white">Mensajes</h1>
        <div className="mt-8 h-96 animate-pulse rounded-xl bg-smoke" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-800 text-off-white">Mensajes</h1>
        <p className="mt-1 text-sm text-pale">
          Comunicaci&oacute;n directa con tu consultor asignado.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-steel/30 bg-smoke p-12">
          <MessageSquare size={40} className="text-steel" />
          <p className="mt-4 text-sm text-mid">
            No hay conversaciones todav&iacute;a. Los mensajes aparecer&aacute;n aqu&iacute; cuando tengas un proyecto activo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">Mensajes</h1>
      <p className="mt-1 text-sm text-pale">
        Comunicaci&oacute;n directa con tu consultor asignado.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {/* Conversation list */}
        <div>
          <div className="space-y-2">
            {visibleConvos.map((convo) => (
              <button
                key={convo.projectId}
                onClick={() => setSelectedProject(convo.projectId)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  selectedProject === convo.projectId
                    ? "border-lime bg-lime/5"
                    : "border-steel/30 bg-smoke hover:border-steel"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-off-white">{convo.projectTitle}</span>
                  {convo.unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lime text-xs font-medium text-black">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
                {convo.lastMessage && (
                  <p className="mt-1 text-xs text-mid line-clamp-1">{convo.lastMessage}</p>
                )}
                {convo.lastMessageAt && (
                  <p className="mt-1 text-xs text-mid">{formatRelativeTime(convo.lastMessageAt)}</p>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-2 rounded-xl border border-steel/30 bg-smoke">
          {selectedProject && user ? (
            <ProjectMessages projectId={selectedProject} currentUserId={user.id} />
          ) : (
            <div className="flex h-96 items-center justify-center">
              <p className="text-sm text-mid">Selecciona una conversaci&oacute;n</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
