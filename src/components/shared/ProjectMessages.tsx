"use client";

import { useMessages } from "@/hooks/useMessages";
import { MessageThread } from "@/components/shared/MessageThread";

interface ProjectMessagesProps {
  projectId: string;
  currentUserId: string;
}

export function ProjectMessages({ projectId, currentUserId }: ProjectMessagesProps) {
  const { messages, loading, error, sendMessage } = useMessages(projectId);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-stone">Cargando mensajes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-[500px]">
      <MessageThread
        messages={messages}
        currentUserId={currentUserId}
        onSend={sendMessage}
      />
    </div>
  );
}
