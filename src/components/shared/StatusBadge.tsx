import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-steel/30 text-pale" },
  pending_payment: { label: "Pago pendiente", className: "bg-yellow-500/20 text-yellow-400" },
  active: { label: "Activo", className: "bg-lime/20 text-lime" },
  in_review: { label: "En revisión", className: "bg-blue-500/20 text-blue-400" },
  delivered: { label: "Entregado", className: "bg-emerald-500/20 text-emerald-400" },
  closed: { label: "Cerrado", className: "bg-steel/30 text-mid" },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
