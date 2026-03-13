"use client";

import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle size={40} className="text-red-400" />
      <h2 className="mt-4 font-display text-xl font-700 text-forest">
        Algo salió mal
      </h2>
      <p className="mt-2 text-sm text-mid">
        {error.message || "Error inesperado. Intenta de nuevo."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Reintentar
      </button>
    </div>
  );
}
