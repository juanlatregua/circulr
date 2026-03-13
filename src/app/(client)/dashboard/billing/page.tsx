"use client";

import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";
import { formatEUR, formatDate } from "@/lib/utils/formatters";
import type { Invoice } from "@/types";

interface InvoiceWithProject extends Invoice {
  project?: { title: string } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-sand text-mid" },
  sent: { label: "Enviada", className: "bg-blue-500/20 text-blue-400" },
  paid: { label: "Pagada", className: "bg-emerald-500/20 text-emerald-400" },
  overdue: { label: "Vencida", className: "bg-red-500/20 text-red-400" },
};

export default function BillingPage() {
  const { user } = useUser();
  const [invoices, setInvoices] = useState<InvoiceWithProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from("invoices")
      .select("*, project:projects(title)")
      .eq("client_id", user.id)
      .order("issued_at", { ascending: false })
      .then(({ data }) => {
        setInvoices((data as unknown as InvoiceWithProject[]) || []);
        setLoading(false);
      });
  }, [user]);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.amount_eur || 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Facturación
      </h1>
      <p className="mt-1 text-sm text-mid">
        Gestiona tus pagos y facturas.
      </p>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-sand bg-white p-5">
          <span className="text-sm text-mid">Total pagado</span>
          <p className="mt-2 font-display text-2xl font-700 text-forest">
            {loading ? "…" : formatEUR(totalPaid / 100)}
          </p>
        </div>
        <div className="rounded-xl border border-sand bg-white p-5">
          <span className="text-sm text-mid">Facturas</span>
          <p className="mt-2 font-display text-2xl font-700 text-forest">
            {loading ? "…" : invoices.length}
          </p>
        </div>
        <div className="rounded-xl border border-sand bg-white p-5">
          <span className="text-sm text-mid">Pendientes</span>
          <p className="mt-2 font-display text-2xl font-700 text-forest">
            {loading ? "…" : invoices.filter((i) => i.status !== "paid").length}
          </p>
        </div>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-sand bg-white p-12">
          <CreditCard size={40} className="text-sand" />
          <p className="mt-4 text-sm text-stone">
            No hay facturas todavía.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {invoices.map((invoice) => {
            const config = statusConfig[invoice.status] || statusConfig.draft;

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-xl border border-sand bg-white p-5"
              >
                <div className="flex items-center gap-4">
                  <FileText size={20} className="text-mid" />
                  <div>
                    <p className="text-sm font-medium text-forest">
                      {invoice.project?.title || "Factura"}
                    </p>
                    <p className="text-xs text-stone">
                      {invoice.issued_at ? formatDate(invoice.issued_at) : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={config.className}>{config.label}</Badge>
                  <span className="text-sm font-medium text-forest">
                    {formatEUR((invoice.amount_eur || 0) / 100)}
                  </span>
                  {invoice.stripe_invoice_id && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${invoice.stripe_invoice_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone hover:text-forest"
                      title="Ver en Stripe"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
