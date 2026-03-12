"use client";

import { useEffect, useState } from "react";
import { CreditCard, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { formatEUR, formatDate } from "@/lib/utils/formatters";
import type { Invoice } from "@/types";

interface InvoiceWithProject extends Invoice {
  project?: { title: string } | null;
  client?: { full_name: string | null; company_name: string | null } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-steel/30 text-pale" },
  sent: { label: "Enviada", className: "bg-blue-500/20 text-blue-400" },
  paid: { label: "Pagada", className: "bg-emerald-500/20 text-emerald-400" },
  overdue: { label: "Vencida", className: "bg-red-500/20 text-red-400" },
};

export default function AdminBillingPage() {
  const { user } = useUser();
  const [invoices, setInvoices] = useState<InvoiceWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("invoices")
      .select(
        "*, project:projects(title), client:profiles!invoices_client_id_fkey(full_name, company_name)"
      )
      .order("issued_at", { ascending: false })
      .then(({ data }) => {
        setInvoices((data as unknown as InvoiceWithProject[]) || []);
        setLoading(false);
      });
  }, [user]);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.amount_eur || 0), 0);

  const totalPending = invoices
    .filter((inv) => ["sent", "overdue"].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.amount_eur || 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-off-white">
        Facturaci&oacute;n
      </h1>
      <p className="mt-1 text-sm text-pale">
        Todas las facturas de la plataforma.
      </p>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-steel/30 bg-smoke p-5">
          <span className="text-sm text-pale">Total cobrado</span>
          <p className="mt-2 font-display text-2xl font-700 text-off-white">
            {loading ? "..." : formatEUR(totalPaid / 100)}
          </p>
        </div>
        <div className="rounded-xl border border-steel/30 bg-smoke p-5">
          <span className="text-sm text-pale">Pendiente de cobro</span>
          <p className="mt-2 font-display text-2xl font-700 text-off-white">
            {loading ? "..." : formatEUR(totalPending / 100)}
          </p>
        </div>
        <div className="rounded-xl border border-steel/30 bg-smoke p-5">
          <span className="text-sm text-pale">Facturas totales</span>
          <p className="mt-2 font-display text-2xl font-700 text-off-white">
            {loading ? "..." : invoices.length}
          </p>
        </div>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-smoke" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-steel/30 bg-smoke p-12">
          <CreditCard size={40} className="text-steel" />
          <p className="mt-4 text-sm text-mid">No hay facturas.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-steel/30 text-xs uppercase text-mid">
                <th className="pb-3 pr-4 font-medium">Proyecto</th>
                <th className="pb-3 pr-4 font-medium">Cliente</th>
                <th className="pb-3 pr-4 font-medium">Importe</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel/20">
              {invoices.map((inv) => {
                const config =
                  statusConfig[inv.status] || statusConfig.draft;

                return (
                  <tr key={inv.id} className="text-off-white">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-pale" />
                        <span className="font-medium">
                          {inv.project?.title || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-pale">
                      {inv.client?.company_name ||
                        inv.client?.full_name ||
                        "—"}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {formatEUR((inv.amount_eur || 0) / 100)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={config.className}>
                        {config.label}
                      </Badge>
                    </td>
                    <td className="py-3 text-pale">
                      {inv.issued_at ? formatDate(inv.issued_at) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
