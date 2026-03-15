"use client";

import { useState, useRef } from "react";
import {
  Presentation,
  Loader2,
  Copy,
  CheckCircle2,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const PRESENTATION_TYPES = [
  {
    value: "diagnostico",
    label: "Diagnóstico inicial",
    description: "Evaluación completa del estado actual de sostenibilidad",
  },
  {
    value: "propuesta",
    label: "Propuesta de servicio",
    description: "Propuesta comercial de consultoría para un cliente",
  },
  {
    value: "resultados_huella",
    label: "Resultados huella de carbono",
    description: "Presentación de resultados del cálculo de emisiones",
  },
  {
    value: "plan_csrd",
    label: "Plan CSRD",
    description: "Hoja de ruta de preparación para la directiva CSRD",
  },
];

const SECTORS = [
  "Industria",
  "Hostelería",
  "Comercio",
  "Servicios profesionales",
  "Construcción",
  "Transporte y logística",
  "Alimentación",
  "Tecnología",
  "Otro",
];

const SIZES = [
  "1-10 empleados (micro)",
  "11-50 empleados (pequeña)",
  "51-250 empleados (mediana)",
  "250+ empleados (grande)",
];

export default function PresentationsPage() {
  const [tipo, setTipo] = useState("diagnostico");
  const [empresa, setEmpresa] = useState("");
  const [sector, setSector] = useState("Servicios profesionales");
  const [tamano, setTamano] = useState("11-50 empleados (pequeña)");
  const [datosClave, setDatosClave] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (!empresa.trim()) {
      toast.error("Introduce el nombre de la empresa");
      return;
    }

    setIsGenerating(true);
    setOutput("");

    try {
      const res = await fetch("/api/ai/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          empresa: empresa.trim(),
          sector,
          tamano,
          datos_clave: datosClave.trim() || undefined,
        }),
      });

      if (!res.ok) {
        toast.error("Error al generar la presentación");
        setIsGenerating(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setOutput(content);
      }

      toast.success("Presentación generada");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presentacion-${tipo}-${empresa.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Generador de Presentaciones
      </h1>
      <p className="mt-1 text-sm text-mid">
        Genera outlines profesionales de presentaciones de sostenibilidad con
        IA.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Form (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Presentation type */}
          <div className="rounded-xl border border-sand bg-white p-6">
            <h3 className="text-sm font-medium text-forest mb-3">
              Tipo de presentación
            </h3>
            <div className="space-y-2">
              {PRESENTATION_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setTipo(pt.value)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    tipo === pt.value
                      ? "border-forest-accent bg-teal-light/50"
                      : "border-sand hover:border-forest/20"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      tipo === pt.value ? "text-forest-accent" : "text-forest"
                    }`}
                  >
                    {pt.label}
                  </p>
                  <p className="text-xs text-stone mt-0.5">{pt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Company details */}
          <div className="rounded-xl border border-sand bg-white p-6 space-y-4">
            <h3 className="text-sm font-medium text-forest">
              Datos de la empresa
            </h3>

            <div>
              <label className="text-xs font-medium text-mid">
                Nombre de la empresa *
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ej: Hostelería García S.L."
                className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest placeholder:text-stone focus:border-forest-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-mid">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-mid">Tamaño</label>
              <select
                value={tamano}
                onChange={(e) => setTamano(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-mid">
                Datos clave (opcional)
              </label>
              <textarea
                value={datosClave}
                onChange={(e) => setDatosClave(e.target.value)}
                placeholder="Ej: Facturación 2M€, 3 sedes, ya tiene ISO 14001, principal problema es la gestión de residuos..."
                rows={3}
                className="mt-1 w-full resize-none rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest placeholder:text-stone focus:border-forest-accent focus:outline-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !empresa.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Presentation size={16} />
              )}
              {isGenerating ? "Generando..." : "Generar presentación"}
            </button>
          </div>
        </div>

        {/* Output (60%) */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-sand bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-sand px-6 py-3">
              <h3 className="font-display font-700 text-forest">
                Outline de presentación
              </h3>
              {output && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg border border-sand px-2.5 py-1 text-xs text-mid hover:bg-mist transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 size={12} className="text-teal" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1 rounded-lg border border-sand px-2.5 py-1 text-xs text-mid hover:bg-mist transition-colors"
                  >
                    <Download size={12} />
                    Exportar
                  </button>
                  <button
                    onClick={() => setOutput("")}
                    className="flex items-center gap-1 rounded-lg border border-sand px-2.5 py-1 text-xs text-mid hover:bg-mist transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={outputRef}
              className="p-6 min-h-[500px] max-h-[700px] overflow-y-auto"
            >
              {output ? (
                <div className="prose-circulr text-sm">
                  {output.split("\n").map((line, i) => {
                    if (!line.trim()) return <br key={i} />;
                    if (line.startsWith("## ")) {
                      return (
                        <h2
                          key={i}
                          className="font-display text-lg font-700 text-forest mt-6 mb-2 first:mt-0"
                        >
                          {line.slice(3)}
                        </h2>
                      );
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p
                          key={i}
                          className="font-semibold text-forest mt-3 mb-1"
                        >
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <div key={i} className="flex gap-2 pl-2 mb-1">
                          <span className="text-teal mt-0.5">•</span>
                          <span>{line.slice(2)}</span>
                        </div>
                      );
                    }
                    return (
                      <p key={i} className="mb-1.5">
                        {line}
                      </p>
                    );
                  })}
                  {isGenerating && (
                    <span className="inline-flex items-center gap-1 text-mid mt-2">
                      <Loader2 size={12} className="animate-spin" />
                      Generando...
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <Presentation size={48} className="text-sand" />
                  <p className="mt-4 text-sm text-stone max-w-xs">
                    Selecciona el tipo, introduce los datos de la empresa y
                    genera un outline profesional.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
