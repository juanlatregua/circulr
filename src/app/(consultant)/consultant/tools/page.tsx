"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wrench, CheckCircle2, Clock, Eye } from "lucide-react";

interface QuickOrder {
  id: string;
  created_at: string;
  email: string;
  name: string;
  company: string;
  product_slug: string;
  status: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown> | null;
  amount_cents: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-sand text-stone" },
  processing: { label: "Procesando", color: "bg-yellow-100 text-yellow-700" },
  consultant_review: { label: "Revisión", color: "bg-coral-soft text-coral" },
  completed: { label: "Completado", color: "bg-teal-light text-teal" },
};

const productLabels: Record<string, string> = {
  "huella-carbono": "Huella Carbono",
  "test-csrd": "Test CSRD",
  "politica-medioambiental": "Política MA",
  "memoria-sostenibilidad": "Memoria",
  "huella-verificada": "Huella Verificada",
};

export default function ConsultantToolsPage() {
  const [orders, setOrders] = useState<QuickOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "consultant_review">("consultant_review");

  useEffect(() => {
    loadOrders();
  }, [filter]);

  async function loadOrders() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("quick_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "consultant_review") {
      query = query.eq("status", "consultant_review");
    }

    const { data } = await query;
    setOrders((data as QuickOrder[]) || []);
    setLoading(false);
  }

  async function approveOrder(orderId: string) {
    const supabase = createClient();
    await supabase
      .from("quick_orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o)));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Herramientas Quick
      </h1>
      <p className="mt-1 text-sm text-mid">
        Pedidos de herramientas self-service que requieren revisión.
      </p>

      {/* Filters */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setFilter("consultant_review")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === "consultant_review"
              ? "bg-coral text-white"
              : "border border-sand text-mid hover:bg-mist"
          }`}
        >
          Pendientes de revisión
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-coral text-white"
              : "border border-sand text-mid hover:bg-mist"
          }`}
        >
          Todos
        </button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-sand bg-white p-12">
          <Wrench size={40} className="text-sand" />
          <p className="mt-4 text-sm text-stone">
            {filter === "consultant_review"
              ? "No hay pedidos pendientes de revisión."
              : "No hay pedidos todavía."}
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sand text-xs text-stone">
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Empresa</th>
                <th className="pb-3 font-medium">Producto</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Importe</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const st = statusLabels[order.status] || statusLabels.pending;
                return (
                  <tr key={order.id} className="border-b border-sand/50 last:border-0">
                    <td className="py-4 text-sm text-mid">
                      {new Date(order.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-medium text-forest">{order.company || "—"}</p>
                      <p className="text-xs text-stone">{order.name} · {order.email}</p>
                    </td>
                    <td className="py-4 text-sm text-mid">
                      {productLabels[order.product_slug] || order.product_slug}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-forest font-medium">
                      {order.amount_cents ? `${(order.amount_cents / 100).toFixed(0)}€` : "Gratis"}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {order.output_data && (
                          <button
                            className="flex items-center gap-1 rounded-lg border border-sand px-3 py-1.5 text-xs text-mid hover:bg-mist transition-colors"
                            onClick={() => {
                              const w = window.open("", "_blank");
                              if (w) {
                                w.document.write(`<pre style="font-family:Inter,sans-serif;padding:2rem;white-space:pre-wrap">${JSON.stringify(order.output_data, null, 2)}</pre>`);
                              }
                            }}
                          >
                            <Eye size={12} />
                            Ver
                          </button>
                        )}
                        {order.status === "consultant_review" && (
                          <button
                            onClick={() => approveOrder(order.id)}
                            className="flex items-center gap-1 rounded-lg bg-teal px-3 py-1.5 text-xs text-white hover:bg-teal/90 transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            Aprobar
                          </button>
                        )}
                        {order.status === "processing" && (
                          <span className="flex items-center gap-1 text-xs text-stone">
                            <Clock size={12} />
                            Procesando
                          </span>
                        )}
                      </div>
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
