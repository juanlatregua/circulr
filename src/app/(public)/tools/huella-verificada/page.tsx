"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolForm } from "@/components/tools/ToolForm";
import { TOOL_DEFINITIONS } from "@/lib/tools/definitions";
import { Award, Clock, CheckCircle2 } from "lucide-react";

const tool = TOOL_DEFINITIONS["huella-verificada"];

export default function HuellaVerificadaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <HuellaVerificada />
    </Suspense>
  );
}

function HuellaVerificada() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = searchParams.get("status");

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/huella-verificada/checkout", {
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

  if (status === "success") {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar variant="public" />
        <section className="pt-32 pb-24">
          <div className="mx-auto max-w-lg px-6 text-center">
            <div className="rounded-2xl border border-sand bg-white p-8 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-light">
                <CheckCircle2 size={28} className="text-teal" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-800 text-forest">Pedido confirmado</h1>
              <p className="mt-3 text-sm text-mid">
                Hemos recibido tu pedido y tus datos. Nuestra consultora Isabelle Guitton
                revisará tu informe en las próximas <strong className="text-forest">48 horas</strong>.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-mist p-4">
                <Clock size={16} className="text-teal" />
                <span className="text-sm text-mid">Recibirás el informe verificado por email</span>
              </div>
              <p className="mt-4 text-xs text-stone">
                Si tienes preguntas, escríbenos a info@circulr.es
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
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
              <Award size={28} className="text-coral" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-800 text-forest">{tool.name}</h1>
            <p className="mt-2 text-mid">{tool.longDescription}</p>
          </div>

          <div className="mb-6 rounded-xl border border-teal/20 bg-teal-light p-4">
            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-teal" />
              <div>
                <p className="text-sm font-medium text-forest">Revisado por consultor en 48h</p>
                <p className="mt-1 text-xs text-mid">
                  Después del pago, un consultor especializado revisará y firmará tu informe.
                  Válido para registro MITECO, licitaciones y clientes.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm">
            {error && <p className="mb-4 text-sm text-danger">{error}</p>}
            <ToolForm steps={tool.steps} onSubmit={handleSubmit} loading={loading} submitLabel="Pagar 299€ y solicitar" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
