"use client";

import { useState } from "react";
import type { ToolStep } from "@/lib/tools/definitions";

interface ToolFormProps {
  steps: ToolStep[];
  onSubmit: (data: Record<string, unknown>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function ToolForm({ steps, onSubmit, loading, submitLabel = "Enviar" }: ToolFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  function updateField(name: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function toggleCheckbox(name: string, value: string) {
    setFormData((prev) => {
      const current = (prev[name] as string[]) || [];
      return {
        ...prev,
        [name]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (isLast) {
      onSubmit(formData);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-sand bg-cream/50 px-4 py-2.5 text-sm text-forest placeholder:text-stone focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/30";

  return (
    <div>
      {/* Progress bar */}
      {steps.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                    i <= currentStep
                      ? "gradient-primary text-white"
                      : "bg-sand text-stone"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`hidden sm:block text-xs ${i <= currentStep ? "text-forest font-medium" : "text-stone"}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-sand">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleNext} className="space-y-4">
        <h3 className="font-display text-lg font-700 text-forest">{step.title}</h3>

        {step.fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-forest">
              {field.label}
            </label>

            {field.type === "select" && (
              <select
                id={field.name}
                value={(formData[field.name] as string) || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                className={inputClass}
              >
                <option value="">Selecciona...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "textarea" && (
              <textarea
                id={field.name}
                value={(formData[field.name] as string) || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
                rows={3}
                className={inputClass}
              />
            )}

            {field.type === "boolean" && (
              <div className="mt-1 flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField(field.name, true)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formData[field.name] === true
                      ? "bg-teal text-white"
                      : "border border-sand text-mid hover:bg-mist"
                  }`}
                >
                  Si
                </button>
                <button
                  type="button"
                  onClick={() => updateField(field.name, false)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    formData[field.name] === false
                      ? "bg-coral text-white"
                      : "border border-sand text-mid hover:bg-mist"
                  }`}
                >
                  No
                </button>
              </div>
            )}

            {field.type === "checkboxes" && (
              <div className="mt-1 flex flex-wrap gap-2">
                {field.options?.map((opt) => {
                  const checked = ((formData[field.name] as string[]) || []).includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleCheckbox(field.name, opt.value)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        checked
                          ? "bg-teal-light text-teal font-medium border border-teal/30"
                          : "border border-sand text-mid hover:bg-mist"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {(field.type === "text" || field.type === "email" || field.type === "number") && (
              <input
                id={field.name}
                type={field.type}
                value={(formData[field.name] as string) ?? ""}
                onChange={(e) =>
                  updateField(
                    field.name,
                    field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value
                  )
                }
                required={field.required}
                placeholder={field.placeholder}
                min={field.min}
                step={field.step}
                className={inputClass}
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="rounded-full border border-sand px-6 py-2.5 text-sm font-medium text-forest hover:bg-mist transition-colors"
            >
              Atras
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 gradient-primary rounded-full px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Procesando..." : isLast ? submitLabel : "Siguiente"}
          </button>
        </div>
      </form>
    </div>
  );
}
