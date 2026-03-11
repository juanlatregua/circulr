"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { useAIStream } from "@/hooks/useAIStream";
import { PROMPTS, type PromptType } from "@/lib/ai/prompts";

interface AIGeneratorProps {
  projectId: string;
  context: string;
}

export function AIGenerator({ projectId, context }: AIGeneratorProps) {
  const { content, loading, error, generate, reset } = useAIStream();
  const [selectedType, setSelectedType] = useState<PromptType>("ce_diagnosis");
  const [copied, setCopied] = useState(false);

  const promptTypes: { key: PromptType; label: string }[] = [
    { key: "csrd_gap_analysis", label: "Análisis CSRD" },
    { key: "ce_diagnosis", label: "Diagnóstico CE" },
    { key: "implementation_plan", label: "Plan de implementación" },
  ];

  async function handleGenerate() {
    const promptFn = PROMPTS[selectedType];
    const prompt = typeof promptFn === "function"
      ? (promptFn as (context: string) => string)(context)
      : "";
    await generate(prompt, projectId);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-steel/30 bg-smoke p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-lime" />
        <h3 className="font-display text-lg font-700 text-off-white">AI Generator</h3>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {promptTypes.map((pt) => (
          <button
            key={pt.key}
            onClick={() => { setSelectedType(pt.key); reset(); }}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              selectedType === pt.key
                ? "bg-lime text-black"
                : "bg-ash text-pale hover:text-off-white"
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-lime px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-lime-dim disabled:opacity-50"
      >
        {loading ? "Generando..." : "Generar con IA"}
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {content && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-mid">Resultado</span>
            <button onClick={handleCopy} className="text-mid hover:text-off-white">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="mt-2 max-h-96 overflow-y-auto rounded-lg bg-ash p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-off-white">{content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
