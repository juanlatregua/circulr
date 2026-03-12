"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

export function useMessages(projectId: string): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Mark unread messages as read
  const markAsRead = useCallback(
    async (userId: string) => {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("project_id", projectId)
        .neq("sender_id", userId)
        .is("read_at", null);
    },
    [projectId]
  );

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error: fetchError } = await supabase
          .from("messages")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true });

        if (fetchError) throw fetchError;
        setMessages(data || []);

        // Mark messages as read when opening conversation
        if (user) {
          markAsRead(user.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading messages");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);

          // Mark new messages as read immediately if we're viewing the conversation
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && (payload.new as Message).sender_id !== user.id) {
            markAsRead(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: sendError } = await supabase.from("messages").insert({
        project_id: projectId,
        sender_id: user.id,
        content,
      });

      if (sendError) throw sendError;
    },
    [projectId]
  );

  return { messages, loading, error, sendMessage };
}
