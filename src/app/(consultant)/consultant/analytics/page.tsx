import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Analytics
      </h1>
      <p className="mt-1 text-sm text-pale">
        Métricas de rendimiento y uso de IA.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-steel/30 bg-smoke p-12">
        <BarChart3 size={40} className="text-steel" />
        <p className="mt-4 text-sm text-mid">
          Las analytics se mostrarán aquí cuando tengas proyectos completados.
        </p>
      </div>
    </div>
  );
}
