import { FolderOpen, Users, Sparkles, BarChart3 } from "lucide-react";

export default function ConsultantDashboard() {
  const stats = [
    { label: "Proyectos activos", value: "0", icon: FolderOpen },
    { label: "Clientes", value: "0", icon: Users },
    { label: "Generaciones IA", value: "0", icon: Sparkles },
    { label: "Tasa de entrega", value: "—", icon: BarChart3 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Panel del Consultor
      </h1>
      <p className="mt-1 text-sm text-pale">
        Gestiona tus proyectos y genera entregables con IA.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-steel/30 bg-smoke p-5"
          >
            <div className="flex items-center gap-3">
              <stat.icon size={20} className="text-lime" />
              <span className="text-sm text-pale">{stat.label}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-700 text-off-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
