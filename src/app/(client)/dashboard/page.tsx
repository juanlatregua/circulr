import { FolderOpen, MessageSquare, Clock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Proyectos activos", value: "0", icon: FolderOpen },
    { label: "Mensajes sin leer", value: "0", icon: MessageSquare },
    { label: "Próximo deadline", value: "—", icon: Clock },
    { label: "Progreso medio", value: "—", icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-pale">
        Bienvenido a CIRQLR. Aquí puedes gestionar tus proyectos de economía circular.
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

      <div className="mt-8 rounded-xl border border-steel/30 bg-smoke p-6">
        <h2 className="font-display text-lg font-700 text-off-white">
          Primeros pasos
        </h2>
        <p className="mt-2 text-sm text-pale">
          Completa tu perfil y solicita tu primer diagnóstico de economía circular.
        </p>
      </div>
    </div>
  );
}
