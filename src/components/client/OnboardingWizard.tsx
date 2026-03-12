"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trackEvent } from "@/components/providers/PostHogProvider";

interface OnboardingStep {
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { title: "Tu empresa", description: "Información básica sobre tu organización" },
  { title: "Situación regulatoria", description: "Tu contexto regulatorio y operativo" },
  { title: "Objetivos", description: "Qué quieres lograr con CIRCULR" },
];

const SECTORS = [
  "Manufactura",
  "Alimentación y bebidas",
  "Construcción",
  "Textil y moda",
  "Energía",
  "Químico",
  "Automoción",
  "Tecnología",
  "Logística y transporte",
  "Retail",
  "Otro",
];

const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const WASTE_TYPES = [
  "Plásticos",
  "Metales",
  "Orgánicos",
  "Papel/Cartón",
  "Electrónicos",
  "Textiles",
  "Construcción y demolición",
  "Químicos/Peligrosos",
];

const PROJECT_TYPES = [
  { key: "ce_diagnosis", label: "Diagnóstico de Economía Circular", desc: "Evaluación completa de madurez circular" },
  { key: "csrd_response", label: "Respuesta CSRD", desc: "Análisis de gaps y plan de acción ESRS" },
  { key: "implementation", label: "Implementación", desc: "Acompañamiento en estrategias circulares" },
  { key: "training", label: "Formación", desc: "Capacitación en economía circular" },
];

interface FormData {
  // Step 1: Company
  sector: string;
  employees: string;
  annual_revenue: string;
  location: string;
  // Step 2: Regulatory
  has_csrd_questionnaire: boolean;
  csrd_sender: string;
  csrd_deadline: string;
  has_pending_inspection: boolean;
  main_waste_types: string[];
  energy_cost_concern: boolean;
  ce_maturity: "none" | "basic" | "intermediate" | "advanced";
  // Step 3: Goals
  project_type: string;
  main_pain: string;
  urgency: "standard" | "urgent" | "critical";
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    sector: "",
    employees: "",
    annual_revenue: "",
    location: "",
    has_csrd_questionnaire: false,
    csrd_sender: "",
    csrd_deadline: "",
    has_pending_inspection: false,
    main_waste_types: [],
    energy_cost_concern: false,
    ce_maturity: "none",
    project_type: "ce_diagnosis",
    main_pain: "",
    urgency: "standard",
  });

  function updateForm<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleWasteType(type: string) {
    setForm((prev) => ({
      ...prev,
      main_waste_types: prev.main_waste_types.includes(type)
        ? prev.main_waste_types.filter((t) => t !== type)
        : [...prev.main_waste_types, type],
    }));
  }

  function validateStep(step: number): string | null {
    if (step === 0) {
      if (!form.sector) return "Selecciona un sector";
      if (!form.employees) return "Selecciona el número de empleados";
    }
    // Step 1 and 2 have no hard requirements — all fields optional
    return null;
  }

  function handleNext() {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    setError(null);
    setCurrentStep((s) => s + 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al completar onboarding");
      }

      const { checkoutUrl, projectId } = await res.json();

      trackEvent.onboardingComplete(form.project_type);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        router.push(`/dashboard/projects/${projectId}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.title} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= currentStep
                  ? "bg-lime text-black"
                  : "bg-steel/30 text-mid"
              }`}
            >
              {i < currentStep ? <Check size={16} /> : i + 1}
            </div>
            <span className="ml-2 hidden text-sm text-pale sm:block">{step.title}</span>
            {i < steps.length - 1 && (
              <div className="mx-4 h-px w-12 bg-steel/30" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-steel/30 bg-smoke p-6">
        <h2 className="font-display text-xl font-700 text-off-white">
          {steps[currentStep].title}
        </h2>
        <p className="mt-1 text-sm text-pale">{steps[currentStep].description}</p>

        <div className="mt-6 space-y-4">
          {/* Step 1: Company Info */}
          {currentStep === 0 && (
            <>
              <div>
                <Label className="text-pale">Sector</Label>
                <select
                  value={form.sector}
                  onChange={(e) => updateForm("sector", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-steel/30 bg-ash px-4 py-2.5 text-sm text-off-white focus:border-lime focus:outline-none"
                >
                  <option value="">Selecciona un sector</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-pale">Número de empleados</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateForm("employees", size)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        form.employees === size
                          ? "bg-lime text-black"
                          : "bg-ash text-pale hover:text-off-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="revenue" className="text-pale">Facturación anual (aprox.)</Label>
                <Input
                  id="revenue"
                  value={form.annual_revenue}
                  onChange={(e) => updateForm("annual_revenue", e.target.value)}
                  placeholder="Ej: 5M€"
                  className="mt-1 border-steel/30 bg-ash text-off-white placeholder:text-mid focus:border-lime"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-pale">Ubicación principal</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => updateForm("location", e.target.value)}
                  placeholder="Ej: Madrid, España"
                  className="mt-1 border-steel/30 bg-ash text-off-white placeholder:text-mid focus:border-lime"
                />
              </div>
            </>
          )}

          {/* Step 2: Regulatory */}
          {currentStep === 1 && (
            <>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.has_csrd_questionnaire}
                    onChange={(e) => updateForm("has_csrd_questionnaire", e.target.checked)}
                    className="h-4 w-4 rounded border-steel/30 accent-lime"
                  />
                  <span className="text-sm text-off-white">¿Has recibido un cuestionario CSRD?</span>
                </label>

                {form.has_csrd_questionnaire && (
                  <div className="ml-7 space-y-3">
                    <div>
                      <Label htmlFor="csrd_sender" className="text-pale">¿De quién?</Label>
                      <Input
                        id="csrd_sender"
                        value={form.csrd_sender}
                        onChange={(e) => updateForm("csrd_sender", e.target.value)}
                        placeholder="Ej: Empresa matriz, cliente..."
                        className="mt-1 border-steel/30 bg-ash text-off-white placeholder:text-mid focus:border-lime"
                      />
                    </div>
                    <div>
                      <Label htmlFor="csrd_deadline" className="text-pale">Fecha límite</Label>
                      <Input
                        id="csrd_deadline"
                        type="date"
                        value={form.csrd_deadline}
                        onChange={(e) => updateForm("csrd_deadline", e.target.value)}
                        className="mt-1 border-steel/30 bg-ash text-off-white focus:border-lime"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.has_pending_inspection}
                    onChange={(e) => updateForm("has_pending_inspection", e.target.checked)}
                    className="h-4 w-4 rounded border-steel/30 accent-lime"
                  />
                  <span className="text-sm text-off-white">¿Tienes inspecciones ambientales pendientes?</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.energy_cost_concern}
                    onChange={(e) => updateForm("energy_cost_concern", e.target.checked)}
                    className="h-4 w-4 rounded border-steel/30 accent-lime"
                  />
                  <span className="text-sm text-off-white">¿Los costes energéticos son una preocupación?</span>
                </label>
              </div>

              <div>
                <Label className="text-pale">Principales tipos de residuos</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WASTE_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleWasteType(type)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        form.main_waste_types.includes(type)
                          ? "bg-lime text-black"
                          : "bg-ash text-pale hover:text-off-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-pale">Madurez en economía circular</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    { key: "none", label: "Sin experiencia" },
                    { key: "basic", label: "Básico" },
                    { key: "intermediate", label: "Intermedio" },
                    { key: "advanced", label: "Avanzado" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => updateForm("ce_maturity", opt.key)}
                      className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                        form.ce_maturity === opt.key
                          ? "bg-lime text-black"
                          : "bg-ash text-pale hover:text-off-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Goals */}
          {currentStep === 2 && (
            <>
              <div>
                <Label className="text-pale">¿Qué servicio necesitas?</Label>
                <div className="mt-2 space-y-2">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.key}
                      type="button"
                      onClick={() => updateForm("project_type", pt.key)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        form.project_type === pt.key
                          ? "border-lime bg-lime/10"
                          : "border-steel/30 bg-ash hover:border-steel"
                      }`}
                    >
                      <span className="text-sm font-medium text-off-white">{pt.label}</span>
                      <p className="mt-0.5 text-xs text-mid">{pt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-pale">Urgencia</Label>
                <div className="mt-2 flex gap-2">
                  {([
                    { key: "standard", label: "Estándar" },
                    { key: "urgent", label: "Urgente" },
                    { key: "critical", label: "Crítico" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => updateForm("urgency", opt.key)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm transition-colors ${
                        form.urgency === opt.key
                          ? "bg-lime text-black"
                          : "bg-ash text-pale hover:text-off-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="pain" className="text-pale">
                  ¿Cuál es tu principal dolor o necesidad?
                </Label>
                <Textarea
                  id="pain"
                  value={form.main_pain}
                  onChange={(e) => updateForm("main_pain", e.target.value)}
                  placeholder="Describe brevemente tu situación y qué esperas conseguir..."
                  rows={4}
                  className="mt-1 border-steel/30 bg-ash text-off-white placeholder:text-mid focus:border-lime"
                />
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-pale transition-colors hover:text-off-white disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Anterior
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-lime-dim"
            >
              Siguiente <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-lime-dim disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  Completar <Check size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
