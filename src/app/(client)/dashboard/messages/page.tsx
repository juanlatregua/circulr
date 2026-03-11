import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Mensajes
      </h1>
      <p className="mt-1 text-sm text-pale">
        Comunicación directa con tu consultor asignado.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-steel/30 bg-smoke p-12">
        <MessageSquare size={40} className="text-steel" />
        <p className="mt-4 text-sm text-mid">
          No hay mensajes todavía. Los mensajes aparecerán aquí cuando tengas un proyecto activo.
        </p>
      </div>
    </div>
  );
}
