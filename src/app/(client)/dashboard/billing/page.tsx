import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Facturación
      </h1>
      <p className="mt-1 text-sm text-pale">
        Gestiona tus pagos y facturas.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-steel/30 bg-smoke p-12">
        <CreditCard size={40} className="text-steel" />
        <p className="mt-4 text-sm text-mid">
          No hay facturas todavía. Las facturas aparecerán aquí cuando realices tu primer pago.
        </p>
      </div>
    </div>
  );
}
