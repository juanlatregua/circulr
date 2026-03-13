"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolForm } from "@/components/tools/ToolForm";
import { ToolResult } from "@/components/tools/ToolResult";
import { TOOL_DEFINITIONS } from "@/lib/tools/definitions";
import { BookOpen } from "lucide-react";

const tool = TOOL_DEFINITIONS["memoria-sostenibilidad"];

export default function MemoriaSostenibilidadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <MemoriaSostenibilidad />
    </Suspense>
  );
}

function MemoriaSostenibilidad() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<{ content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const orderId = searchParams.get("order");
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "success" && orderId && !result) {
      generateResults(orderId);
    }
  }, [status, orderId]);

  async function generateResults(oid: string) {
    setGenerating(true);
    try {
      const res = await fetch("/api/tools/memoria-sostenibilidad/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: oid, input_data: {} }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json.result as { content: string });
      }
    } catch {
      setError("Error al generar. Contacta con info@circulr.es");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/memoria-sostenibilidad/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_data: data }),
      });
      if (!res.ok) throw new Error("Error al crear checkout");
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch {
      setError("Error al procesar el pago. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="public" />

      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full gradient-primary px-3 py-1 text-xs font-medium text-white">
              299€
            </span>
            <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-soft">
              <BookOpen size={28} className="text-coral" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-800 text-forest">{tool.name}</h1>
            <p className="mt-2 text-mid">{tool.longDescription}</p>
          </div>

          {generating && (
            <div className="rounded-2xl border border-sand bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
              <p className="mt-4 text-sm text-mid">Generando tu memoria de sostenibilidad...</p>
              <p className="mt-1 text-xs text-stone">Este proceso puede tardar 1-2 minutos</p>
            </div>
          )}

          {!result && !generating && status !== "success" && (
            <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm">
              {error && <p className="mb-4 text-sm text-danger">{error}</p>}
              <ToolForm steps={tool.steps} onSubmit={handleSubmit} loading={loading} submitLabel="Pagar 299€ y generar" />
            </div>
          )}

          {result && (
            <ToolResult title="Tu Memoria de Sostenibilidad" upsell={tool.upsell}>
              <div className="rounded-xl border border-sand bg-white p-6">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-mid">
                  {result.content}
                </div>
              </div>
            </ToolResult>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
