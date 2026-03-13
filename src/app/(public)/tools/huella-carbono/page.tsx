"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolForm } from "@/components/tools/ToolForm";
import { ToolResult } from "@/components/tools/ToolResult";
import { TOOL_DEFINITIONS } from "@/lib/tools/definitions";
import { Leaf, TrendingDown, TrendingUp, Minus, Zap, Car, Flame, Trash2 } from "lucide-react";
import type { CarbonResult } from "@/lib/tools/carbon-calculator";

const tool = TOOL_DEFINITIONS["huella-carbono"];

export default function HuellaCarbono() {
  const [result, setResult] = useState<CarbonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/huella-carbono/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_data: data }),
      });
      if (!res.ok) throw new Error("Error al calcular");
      const json = await res.json();
      setResult(json.result as CarbonResult);
    } catch {
      setError("Error al calcular la huella de carbono. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const ComparisonIcon = result?.comparison === "below" ? TrendingDown : result?.comparison === "above" ? TrendingUp : Minus;
  const comparisonColor = result?.comparison === "below" ? "text-teal" : result?.comparison === "above" ? "text-coral" : "text-mid";
  const comparisonLabel = result?.comparison === "below" ? "Por debajo de la media" : result?.comparison === "above" ? "Por encima de la media" : "En la media";

  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="public" />

      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full bg-teal-light px-3 py-1 text-xs font-medium text-teal">
              Gratis
            </span>
            <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-soft">
              <Leaf size={28} className="text-coral" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-800 text-forest">{tool.name}</h1>
            <p className="mt-2 text-mid">{tool.longDescription}</p>
          </div>

          {!result ? (
            <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm">
              {error && <p className="mb-4 text-sm text-danger">{error}</p>}
              <ToolForm steps={tool.steps} onSubmit={handleSubmit} loading={loading} submitLabel="Calcular huella" />
            </div>
          ) : (
            <ToolResult
              title="Tu huella de carbono"
              upsell={tool.upsell}
            >
              {/* Total */}
              <div className="text-center py-4">
                <p className="font-display text-5xl font-800 text-forest">{result.total_tco2e}</p>
                <p className="mt-1 text-sm text-mid">tCO₂e / año</p>
              </div>

              {/* Scope breakdown */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-sand bg-mist p-4 text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-coral-soft">
                    <Flame size={16} className="text-coral" />
                  </div>
                  <p className="mt-2 font-display text-xl font-700 text-forest">{result.scope1.total}</p>
                  <p className="text-xs text-mid">Alcance 1 (tCO₂e)</p>
                  <p className="mt-1 text-xs text-stone">Gas + Transporte</p>
                </div>
                <div className="rounded-xl border border-sand bg-mist p-4 text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-coral-soft">
                    <Zap size={16} className="text-coral" />
                  </div>
                  <p className="mt-2 font-display text-xl font-700 text-forest">{result.scope2.total}</p>
                  <p className="text-xs text-mid">Alcance 2 (tCO₂e)</p>
                  <p className="mt-1 text-xs text-stone">Electricidad</p>
                </div>
                <div className="rounded-xl border border-sand bg-mist p-4 text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-coral-soft">
                    <Trash2 size={16} className="text-coral" />
                  </div>
                  <p className="mt-2 font-display text-xl font-700 text-forest">{result.scope3.total}</p>
                  <p className="text-xs text-mid">Alcance 3 (tCO₂e)</p>
                  <p className="mt-1 text-xs text-stone">Residuos</p>
                </div>
              </div>

              {/* Comparison */}
              <div className="mt-6 rounded-xl border border-sand bg-white p-4">
                <div className="flex items-center gap-3">
                  <ComparisonIcon size={20} className={comparisonColor} />
                  <div>
                    <p className={`text-sm font-medium ${comparisonColor}`}>{comparisonLabel}</p>
                    <p className="text-xs text-stone">
                      Tu empresa: {result.per_employee} tCO₂e/empleado — Media sector ({result.sector}): {result.sector_average} tCO₂e/empleado
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick wins */}
              <div className="mt-6">
                <h3 className="font-display text-sm font-700 text-forest">Acciones recomendadas</h3>
                <ul className="mt-3 space-y-2">
                  {result.quick_wins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-mid">
                      <Car size={14} className="mt-0.5 shrink-0 text-teal" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reset */}
              <button
                onClick={() => setResult(null)}
                className="mt-6 w-full rounded-full border border-sand px-4 py-2.5 text-sm font-medium text-forest hover:bg-mist transition-colors"
              >
                Calcular de nuevo
              </button>
            </ToolResult>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
