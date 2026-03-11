"use client";

import { useState } from "react";
import { Save, FileText } from "lucide-react";

interface DeliverableEditorProps {
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
}

export function DeliverableEditor({ initialContent = "", onSave }: DeliverableEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(content);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-steel/30 bg-smoke">
      <div className="flex items-center justify-between border-b border-steel/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-lime" />
          <span className="text-sm font-medium text-off-white">Editor de entregable</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-lime px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-lime-dim disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[400px] w-full resize-y bg-transparent p-4 font-mono text-sm text-off-white placeholder:text-mid focus:outline-none"
        placeholder="Escribe o pega el contenido del entregable aquí..."
      />
    </div>
  );
}
