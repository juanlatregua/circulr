"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolForm } from "@/components/tools/ToolForm";
import { ToolResult } from "@/components/tools/ToolResult";
import { TOOL_DEFINITIONS } from "@/lib/tools/definitions";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const tool = TOOL_DEFINITIONS["test-csrd"];

interface CsrdResult {
  risk_level: "ROJO" | "AMARILLO" | "VERDE";
  risk_summary: string;
  obligations: { title: string; description: string }[];
  roadmap: { step: string; description: string }[];
  cost_estimate: string;
  upsell_message: string;
  raw?: string;
}

export default function TestCsrdPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <TestCsrd />
    </Suspense>
  );
}

function TestCsrd() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CsrdResult | null>(null);
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
      // Call generate — API reads input_data from DB via order_id
      const orderRes = await fetch(`/api/tools/test-csrd/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: oid }),
      });
      if (orderRes.ok) {
        const json = await orderRes.json();
        setResult(json.result as CsrdResult);
      } else {
        const errJson = await orderRes.json().catch(() => null);
        setError(errJson?.error || "Error al generar. Contacta con info@circulr.es");
      }
    } catch {
      setError("Error al generar el resultado. Contacta con info@circulr.es");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/test-csrd/checkout", {
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

  const riskConfig = {
    ROJO: { color: "text-danger", bg: "bg-red-50", icon: XCircle, label: "Riesgo Alto" },
    AMARILLO: { color: "text-yellow-600", bg: "bg-yellow-50", icon: AlertTriangle, label: "Riesgo Medio" },
    VERDE: { color: "text-teal", bg: "bg-teal-light", icon: CheckCircle2, label: "Riesgo Bajo" },
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="public" />

      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full gradient-primary px-3 py-1 text-xs font-medium text-white">
              49€
            </span>
            <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-soft">
              <ShieldCheck size={28} className="text-coral" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-800 text-forest">{tool.name}</h1>
            <p className="mt-2 text-mid">{tool.longDescription}</p>
          </div>

          {generating && (
            <div className="rounded-2xl border border-sand bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
              <p className="mt-4 text-sm text-mid">Generando tu informe de cumplimiento...</p>
            </div>
          )}

          {!result && !generating && status !== "success" && (
            <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm">
              {error && <p className="mb-4 text-sm text-danger">{error}</p>}
              <ToolForm steps={tool.steps} onSubmit={handleSubmit} loading={loading} submitLabel="Pagar 49€ y obtener resultado" />
            </div>
          )}

          {result && (
            <ToolResult title="Resultado del Test CSRD" upsell={tool.upsell}>
              {/* Risk level */}
              {result.risk_level && riskConfig[result.risk_level] && (() => {
                const config = riskConfig[result.risk_level];
                const RiskIcon = config.icon;
                return (
                  <div className={`rounded-xl ${config.bg} p-6 text-center`}>
                    <RiskIcon size={32} className={`mx-auto ${config.color}`} />
                    <p className={`mt-2 font-display text-2xl font-800 ${config.color}`}>{config.label}</p>
                    <p className="mt-2 text-sm text-mid">{result.risk_summary}</p>
                  </div>
                );
              })()}

              {/* Obligations */}
              {result.obligations && result.obligations.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-display text-sm font-700 text-forest">Obligaciones legales urgentes</h3>
                  <div className="mt-3 space-y-3">
                    {result.obligations.map((ob, i) => (
                      <div key={i} className="rounded-xl border border-sand bg-mist p-4">
                        <p className="text-sm font-medium text-forest">{ob.title}</p>
                        <p className="mt-1 text-xs text-mid">{ob.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap */}
              {result.roadmap && result.roadmap.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-display text-sm font-700 text-forest">Hoja de ruta</h3>
                  <div className="mt-3 space-y-2">
                    {result.roadmap.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral-soft text-xs font-medium text-coral">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-forest">{item.step}</p>
                          <p className="text-xs text-mid">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cost estimate */}
              {result.cost_estimate && (
                <div className="mt-6 rounded-xl border border-sand bg-white p-4 text-center">
                  <p className="text-xs text-stone">Estimación de coste de cumplimiento</p>
                  <p className="mt-1 font-display text-lg font-700 text-forest">{result.cost_estimate}</p>
                </div>
              )}

              {/* Raw fallback */}
              {result.raw && (
                <div className="mt-4 rounded-xl border border-sand bg-mist p-4">
                  <pre className="whitespace-pre-wrap text-xs text-mid">{result.raw}</pre>
                </div>
              )}
            </ToolResult>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
