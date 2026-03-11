import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { ProjectStatus } from "@/types";

const timelineSteps: { status: ProjectStatus; label: string }[] = [
  { status: "draft", label: "Borrador creado" },
  { status: "pending_payment", label: "Pago pendiente" },
  { status: "active", label: "Proyecto activo" },
  { status: "in_review", label: "En revisión" },
  { status: "delivered", label: "Entregado" },
  { status: "closed", label: "Cerrado" },
];

interface ProjectTimelineProps {
  currentStatus: ProjectStatus;
}

export function ProjectTimeline({ currentStatus }: ProjectTimelineProps) {
  const currentIdx = timelineSteps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="space-y-4">
      {timelineSteps.map((step, i) => (
        <div key={step.status} className="flex items-center gap-3">
          {i < currentIdx ? (
            <CheckCircle2 size={20} className="text-lime" />
          ) : i === currentIdx ? (
            <Clock size={20} className="text-lime" />
          ) : (
            <Circle size={20} className="text-steel" />
          )}
          <span
            className={`text-sm ${
              i <= currentIdx ? "text-off-white" : "text-mid"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
