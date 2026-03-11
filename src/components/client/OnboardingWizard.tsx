"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  { title: "Tu empresa", description: "Información básica sobre tu organización" },
  { title: "Situación actual", description: "Tu contexto regulatorio y operativo" },
  { title: "Objetivos", description: "Qué quieres lograr con CIRQLR" },
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);

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

        <div className="mt-6">
          <p className="text-sm text-mid">
            Formulario del paso {currentStep + 1} — se implementará en la Fase 2.
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-pale transition-colors hover:text-off-white disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Anterior
          </button>
          <button
            onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-lime-dim disabled:opacity-30"
          >
            Siguiente <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
