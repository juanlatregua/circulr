"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Users,
  Sparkles,
  BarChart3,
  Euro,
  CheckCircle2,
  ArrowRight,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { ProjectKanban } from "@/components/consultant/ProjectKanban";
import type { Project } from "@/types";

interface QuickOrderPreview {
  id: string;
  created_at: string;
  company: string;
  product_slug: string;
  status: string;
}

const productLabels: Record<string, string> = {
  "huella-carbono": "Huella Carbono",
  "test-csrd": "Test CSRD",
  "politica-medioambiental": "Política MA",
  "memoria-sostenibilidad": "Memoria",
  "huella-verificada": "Huella Verificada",
};

export default function ConsultantDashboard() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [genCount, setGenCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<QuickOrderPreview[]>([]);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthCompleted, setMonthCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    async function fetchData() {
      const [projectsRes, gensRes, ordersRes, invoicesRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("consultant_id", user!.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("ai_generations")
          .select("id", { count: "exact" })
          .eq("consultant_id", user!.id),
        supabase
          .from("quick_orders")
          .select("id, created_at, company, product_slug, status")
          .eq("status", "consultant_review")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("invoices")
          .select("amount_cents, status")
          .eq("consultant_id", user!.id)
          .gte("created_at", monthStart)
          .eq("status", "paid"),
      ]);

      const projectsData = projectsRes.data || [];
      setProjects(projectsData);
      setGenCount(gensRes.count || 0);
      setPendingOrders((ordersRes.data as QuickOrderPreview[]) || []);

      // Revenue this month
      const revenue = (invoicesRes.data || []).reduce(
        (sum: number, inv: { amount_cents: number }) => sum + inv.amount_cents,
        0
      );
      setMonthRevenue(revenue / 100);

      // Completed this month
      const completed = projectsData.filter(
        (p) =>
          ["delivered", "closed"].includes(p.status) &&
          new Date(p.updated_at) >= new Date(monthStart)
      ).length;
      setMonthCompleted(completed);

      setLoading(false);
    }

    fetchData();
  }, [user]);

  const activeProjects = projects.filter((p) =>
    ["active", "in_review"].includes(p.status)
  );
  const uniqueClients = new Set(projects.map((p) => p.client_id)).size;
  const deliveredCount = projects.filter((p) =>
    ["delivered", "closed"].includes(p.status)
  ).length;
  const deliveryRate =
    projects.length > 0
      ? Math.round((deliveredCount / projects.length) * 100) + "%"
      : "—";

  const stats = [
    { label: "Proyectos activos", value: String(activeProjects.length), icon: FolderOpen },
    { label: "Clientes", value: String(uniqueClients), icon: Users },
    { label: "Generaciones IA", value: String(genCount), icon: Sparkles },
    { label: "Tasa de entrega", value: deliveryRate, icon: BarChart3 },
    { label: "Ingresos este mes", value: `${monthRevenue.toFixed(0)}€`, icon: Euro },
    { label: "Completados este mes", value: String(monthCompleted), icon: CheckCircle2 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Panel del Consultor
      </h1>
      <p className="mt-1 text-sm text-mid">
        Gestiona tus proyectos y genera entregables con IA.
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-sand bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <stat.icon size={20} className="text-coral" />
              <span className="text-sm text-mid">{stat.label}</span>
            </div>
            <p className="mt-3 font-display text-2xl font-700 text-forest">
              {loading ? "…" : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Pending quick orders queue */}
      {!loading && pendingOrders.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-700 text-forest">
              Cola de revisión
            </h2>
            <Link
              href="/consultant/tools"
              className="text-sm text-forest-accent hover:underline inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href="/consultant/tools"
                className="flex items-center justify-between rounded-xl border border-sand bg-white p-4 transition-colors hover:border-forest/20"
              >
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-coral" />
                  <div>
                    <p className="text-sm font-medium text-forest">
                      {order.company || "Sin empresa"}
                    </p>
                    <p className="text-xs text-stone">
                      {productLabels[order.product_slug] || order.product_slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone">
                    {new Date(order.created_at).toLocaleDateString("es-ES")}
                  </span>
                  <span className="inline-flex rounded-full bg-coral-soft px-2 py-0.5 text-xs font-medium text-coral">
                    Revisar
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Kanban */}
      {!loading && activeProjects.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-700 text-forest mb-4">
            Vista Kanban
          </h2>
          <ProjectKanban projects={projects} />
        </div>
      )}
    </div>
  );
}
