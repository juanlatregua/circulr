"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Trash2, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "¿Qué es la CSRD y me afecta?",
  "¿Cómo calculo mi huella de carbono?",
  "¿Qué obligaciones tengo con la Ley de Residuos?",
  "¿Qué es una memoria de sostenibilidad?",
];

export function AsesorIA() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const errorMsg =
          err?.message || "Ha ocurrido un error. Inténtalo de nuevo.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMsg },
        ]);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Lo siento, ha ocurrido un error de conexión. Inténtalo de nuevo.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Abrir asistente IA"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex h-dvh w-full flex-col bg-white shadow-2xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl sm:border sm:border-sand">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sand bg-forest px-4 py-3 sm:rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20">
                <MessageCircle size={16} className="text-teal" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AsesorIA</h3>
                <p className="text-[11px] text-cream/60">
                  Asistente de sostenibilidad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="rounded-lg p-1.5 text-cream/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Limpiar chat"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-cream/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-light">
                  <MessageCircle size={24} className="text-forest-accent" />
                </div>
                <h4 className="font-display text-lg font-700 text-forest">
                  ¡Hola! Soy AsesorIA
                </h4>
                <p className="mt-1 text-sm text-mid max-w-[280px]">
                  Tu asistente de sostenibilidad. Pregúntame sobre normativa,
                  huella de carbono o economía circular.
                </p>

                <div className="mt-6 grid gap-2 w-full max-w-[300px]">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-xl border border-sand bg-white px-3 py-2.5 text-left text-sm text-forest transition-colors hover:border-forest-accent hover:bg-teal-light/50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-forest text-white rounded-br-md"
                        : "bg-mist text-forest rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      msg.content
                    )}
                    {msg.role === "assistant" &&
                      msg.content === "" &&
                      isStreaming && (
                        <span className="inline-flex items-center gap-1 text-mid">
                          <Loader2 size={12} className="animate-spin" />
                          Escribiendo...
                        </span>
                      )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-sand px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre sostenibilidad..."
                disabled={isStreaming}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-sand bg-mist px-3 py-2.5 text-sm text-forest placeholder:text-stone focus:border-forest-accent focus:outline-none disabled:opacity-50"
                style={{ maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white transition-colors hover:bg-forest-light disabled:opacity-40"
                aria-label="Enviar mensaje"
              >
                {isStreaming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-stone">
              IA puede cometer errores. Verifica la información importante.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function MessageContent({ content }: { content: string }) {
  if (!content) return null;

  // Simple markdown rendering for bold, links, and lists
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;

        // List items
        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          return (
            <div key={i} className="flex gap-1.5 pl-1">
              <span className="text-teal mt-0.5">•</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInline(line.trim().slice(2)),
                }}
              />
            </div>
          );
        }

        // Numbered list items
        const numbered = line.trim().match(/^(\d+)\.\s(.+)/);
        if (numbered) {
          return (
            <div key={i} className="flex gap-1.5 pl-1">
              <span className="text-teal font-medium">{numbered[1]}.</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formatInline(numbered[2]),
                }}
              />
            </div>
          );
        }

        return (
          <p
            key={i}
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />
        );
      })}
    </div>
  );
}

function formatInline(text: string): string {
  return text
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    )
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="text-forest-accent underline underline-offset-2 hover:text-forest-accent-dark" target="_blank" rel="noopener">$1</a>'
    );
}
