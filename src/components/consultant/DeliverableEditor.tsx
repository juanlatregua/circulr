"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Save, FileText, Eye, PenLine, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DeliverableEditorProps {
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function DeliverableEditor({ initialContent = "", onSave }: DeliverableEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<SaveStatus>("idle");
  const [preview, setPreview] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialContent);

  const doSave = useCallback(
    async (text: string) => {
      if (text === lastSavedRef.current) return;
      setAutoSaveStatus("saving");
      try {
        await onSave(text);
        lastSavedRef.current = text;
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } catch {
        setAutoSaveStatus("error");
      }
    },
    [onSave]
  );

  function handleChange(value: string) {
    setContent(value);
    // Debounce auto-save: 2s after last keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSave(value), 2000);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function handleManualSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaving(true);
    try {
      await onSave(content);
      lastSavedRef.current = content;
      setAutoSaveStatus("saved");
      toast.success("Entregable guardado");
      setTimeout(() => setAutoSaveStatus((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-steel/30 bg-smoke">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-steel/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-lime" />
            <span className="text-sm font-medium text-off-white">Editor de entregable</span>
          </div>
          {/* Auto-save status */}
          <span className="text-xs text-mid">
            {autoSaveStatus === "saving" && "Guardando..."}
            {autoSaveStatus === "saved" && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check size={12} /> Guardado
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="text-red-400">Error al guardar</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <button
            onClick={() => setPreview(!preview)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
              preview
                ? "bg-lime/20 text-lime"
                : "text-pale hover:bg-ash/50 hover:text-off-white"
            )}
          >
            {preview ? <PenLine size={13} /> : <Eye size={13} />}
            {preview ? "Editar" : "Vista previa"}
          </button>
          {/* Manual save */}
          <button
            onClick={handleManualSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-lime px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-lime-dim disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className="min-h-[400px] p-4 prose-invert">
          <MarkdownPreview content={content} />
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Contenido del entregable"
          className="min-h-[400px] w-full resize-y bg-transparent p-4 font-mono text-sm text-off-white placeholder:text-mid focus:outline-none"
          placeholder="Escribe o pega el contenido del entregable aquí..."
        />
      )}
    </div>
  );
}

/** Lightweight markdown-to-HTML preview (headings, bold, italic, bullets, paragraphs) */
function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-sm text-mid italic">Sin contenido.</p>;
  }

  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm text-off-white leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={i} className="h-2" />;

        // Headings
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={i} className="font-display text-base font-700 text-off-white mt-4">
              {applyInline(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="font-display text-lg font-700 text-off-white mt-5">
              {applyInline(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="font-display text-xl font-800 text-off-white mt-6">
              {applyInline(trimmed.slice(2))}
            </h2>
          );
        }

        // Bullets
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <p key={i} className="pl-4">
              <span className="text-lime mr-2">&bull;</span>
              {applyInline(trimmed.slice(2))}
            </p>
          );
        }

        // Paragraph
        return <p key={i}>{applyInline(trimmed)}</p>;
      })}
    </div>
  );
}

/** Apply bold and italic inline formatting */
function applyInline(text: string): React.ReactNode {
  // Split on **bold** and *italic* patterns
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-off-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
