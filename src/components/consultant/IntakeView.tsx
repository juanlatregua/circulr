import type { Intake } from "@/types";
import { Badge } from "@/components/ui/badge";

interface IntakeViewProps {
  intake: Intake;
}

const maturityLabels: Record<string, string> = {
  none: "Sin experiencia",
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export function IntakeView({ intake }: IntakeViewProps) {
  return (
    <div className="rounded-xl border border-sand bg-white p-6">
      <h3 className="font-display text-lg font-700 text-forest">
        Cuestionario del cliente
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <span className="text-xs text-stone">Sector</span>
          <p className="text-sm text-forest">{intake.sector || "—"}</p>
        </div>
        <div>
          <span className="text-xs text-stone">Empleados</span>
          <p className="text-sm text-forest">{intake.employees || "—"}</p>
        </div>
        <div>
          <span className="text-xs text-stone">Facturación anual</span>
          <p className="text-sm text-forest">{intake.annual_revenue || "—"}</p>
        </div>
        <div>
          <span className="text-xs text-stone">Ubicación</span>
          <p className="text-sm text-forest">{intake.location || "—"}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-sand pt-4">
        <span className="text-xs text-stone">Madurez CE</span>
        <div className="mt-1">
          <Badge variant="outline" className="border-teal/30 text-teal">
            {maturityLabels[intake.ce_maturity] || intake.ce_maturity}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <span className="text-xs text-stone">Cuestionario CSRD recibido</span>
          <p className="text-sm text-forest">{intake.has_csrd_questionnaire ? "Sí" : "No"}</p>
        </div>
        {intake.has_csrd_questionnaire && (
          <>
            <div>
              <span className="text-xs text-stone">Remitente CSRD</span>
              <p className="text-sm text-forest">{intake.csrd_sender || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-stone">Deadline CSRD</span>
              <p className="text-sm text-forest">
                {intake.csrd_deadline
                  ? new Date(intake.csrd_deadline).toLocaleDateString("es-ES")
                  : "—"}
              </p>
            </div>
          </>
        )}
        <div>
          <span className="text-xs text-stone">Inspección pendiente</span>
          <p className="text-sm text-forest">{intake.has_pending_inspection ? "Sí" : "No"}</p>
        </div>
        <div>
          <span className="text-xs text-stone">Preocupación energética</span>
          <p className="text-sm text-forest">{intake.energy_cost_concern ? "Sí" : "No"}</p>
        </div>
      </div>

      {intake.main_waste_types && intake.main_waste_types.length > 0 && (
        <div className="mt-4 border-t border-sand pt-4">
          <span className="text-xs text-stone">Tipos de residuos principales</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {intake.main_waste_types.map((type) => (
              <Badge key={type} variant="secondary" className="bg-mist text-mid">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {intake.main_pain && (
        <div className="mt-4 border-t border-sand pt-4">
          <span className="text-xs text-stone">Principal necesidad</span>
          <p className="mt-1 text-sm text-forest">{intake.main_pain}</p>
        </div>
      )}
    </div>
  );
}
