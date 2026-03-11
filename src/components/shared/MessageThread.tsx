"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import { formatRelativeTime } from "@/lib/utils/formatters";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onSend: (content: string) => Promise<void>;
}

export function MessageThread({ messages, currentUserId, onSend }: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSend(newMessage.trim());
      setNewMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2",
              msg.sender_id === currentUserId
                ? "ml-auto bg-lime/20 text-off-white"
                : "bg-ash text-off-white"
            )}
          >
            <p className="text-sm">{msg.content}</p>
            <p className="mt-1 text-xs text-mid">{formatRelativeTime(msg.created_at)}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-steel/30 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-lg border border-steel/30 bg-ash px-4 py-2 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="rounded-lg bg-lime p-2 text-black transition-colors hover:bg-lime-dim disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
