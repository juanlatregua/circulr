"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Wrench,
  CheckCircle2,
  Clock,
  Eye,
  Calculator,
  BarChart3,
  Scale,
  Loader2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Search,
} from "lucide-react";
import { calculateCarbon, type CarbonInput, type CarbonResult } from "@/lib/tools/carbon-calculator";

// ─── Quick Orders Section ───────────────────────────────────────────

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

// ─── Sector Benchmarks Data ─────────────────────────────────────────

const SECTOR_BENCHMARKS: Record<
  string,
  { avg: number; best: number; worst: number; label: string }
> = {
  industria: { avg: 8.5, best: 4.2, worst: 15.0, label: "Industria" },
  hosteleria: { avg: 3.2, best: 1.5, worst: 6.0, label: "Hostelería" },
  comercio: { avg: 2.8, best: 1.2, worst: 5.5, label: "Comercio" },
  servicios: { avg: 2.1, best: 0.8, worst: 4.0, label: "Servicios" },
  construccion: { avg: 6.4, best: 3.0, worst: 12.0, label: "Construcción" },
  transporte: { avg: 12.0, best: 6.0, worst: 20.0, label: "Transporte" },
  alimentacion: { avg: 4.5, best: 2.0, worst: 8.5, label: "Alimentación" },
  otro: { avg: 3.5, best: 1.5, worst: 7.0, label: "Otro" },
};

// ─── Main Page Component ────────────────────────────────────────────

type ActiveTool = "orders" | "calculator" | "benchmark" | "legislation";

export default function ConsultantToolsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("orders");

  const tools = [
    { id: "orders" as const, label: "Quick Orders", icon: Wrench },
    { id: "calculator" as const, label: "Calculadora CO₂", icon: Calculator },
    { id: "benchmark" as const, label: "Benchmark", icon: BarChart3 },
    { id: "legislation" as const, label: "Legislación IA", icon: Scale },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-800 text-forest">
        Herramientas del Consultor
      </h1>
      <p className="mt-1 text-sm text-mid">
        Herramientas internas para gestionar pedidos y asesorar clientes.
      </p>

      {/* Tool tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTool === tool.id
                ? "bg-forest text-white"
                : "border border-sand text-mid hover:bg-mist hover:text-forest"
            }`}
          >
            <tool.icon size={16} />
            {tool.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTool === "orders" && <QuickOrdersSection />}
        {activeTool === "calculator" && <CarbonCalculatorSection />}
        {activeTool === "benchmark" && <BenchmarkSection />}
        {activeTool === "legislation" && <LegislationSearchSection />}
      </div>
    </div>
  );
}

// ─── Quick Orders ───────────────────────────────────────────────────

function QuickOrdersSection() {
  const [orders, setOrders] = useState<QuickOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "consultant_review">("consultant_review");

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "completed" } : o))
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-6">
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-sand bg-white p-12">
          <Wrench size={40} className="text-sand" />
          <p className="mt-4 text-sm text-stone">
            {filter === "consultant_review"
              ? "No hay pedidos pendientes de revisión."
              : "No hay pedidos todavía."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                                w.document.write(
                                  `<pre style="font-family:Inter,sans-serif;padding:2rem;white-space:pre-wrap">${JSON.stringify(order.output_data, null, 2)}</pre>`
                                );
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
    </>
  );
}

// ─── Carbon Calculator (Quick) ──────────────────────────────────────

function CarbonCalculatorSection() {
  const [input, setInput] = useState<CarbonInput>({
    sector: "servicios",
    employees: "6-20",
    energy_kwh: 0,
    gas_kwh: 0,
    transport_km: 0,
    waste_tons: 0,
  });
  const [result, setResult] = useState<CarbonResult | null>(null);

  function handleCalculate() {
    const r = calculateCarbon(input);
    setResult(r);
  }

  const sectors = [
    { value: "industria", label: "Industria" },
    { value: "hosteleria", label: "Hostelería" },
    { value: "comercio", label: "Comercio" },
    { value: "servicios", label: "Servicios" },
    { value: "construccion", label: "Construcción" },
    { value: "transporte", label: "Transporte" },
    { value: "alimentacion", label: "Alimentación" },
    { value: "otro", label: "Otro" },
  ];

  const employeeSizes = ["1-5", "6-20", "21-50", "51-200", "200+"];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-sand bg-white p-6">
        <h3 className="font-display text-lg font-700 text-forest mb-4">
          Calculadora rápida de huella
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-mid">Sector</label>
            <select
              value={input.sector}
              onChange={(e) => setInput({ ...input, sector: e.target.value })}
              className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
            >
              {sectors.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-mid">Empleados</label>
            <select
              value={input.employees}
              onChange={(e) => setInput({ ...input, employees: e.target.value })}
              className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
            >
              {employeeSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-mid">Electricidad (kWh/año)</label>
              <input
                type="number"
                value={input.energy_kwh || ""}
                onChange={(e) =>
                  setInput({ ...input, energy_kwh: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mid">Gas natural (kWh/año)</label>
              <input
                type="number"
                value={input.gas_kwh || ""}
                onChange={(e) =>
                  setInput({ ...input, gas_kwh: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mid">Transporte (km/año)</label>
              <input
                type="number"
                value={input.transport_km || ""}
                onChange={(e) =>
                  setInput({ ...input, transport_km: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-mid">Residuos (toneladas/año)</label>
              <input
                type="number"
                value={input.waste_tons || ""}
                onChange={(e) =>
                  setInput({ ...input, waste_tons: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full rounded-lg gradient-primary py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Calcular huella
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border border-sand bg-white p-6">
        <h3 className="font-display text-lg font-700 text-forest mb-4">
          Resultado
        </h3>

        {result ? (
          <div className="space-y-4">
            <div className="text-center p-4 rounded-xl bg-mist">
              <p className="text-sm text-mid">Total anual</p>
              <p className="font-display text-3xl font-800 text-forest">
                {result.total_tco2e}{" "}
                <span className="text-lg font-500 text-mid">tCO₂e</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-coral-soft p-3">
                <p className="text-xs text-stone">Scope 1</p>
                <p className="text-lg font-700 text-forest">{result.scope1.total}</p>
              </div>
              <div className="rounded-lg bg-teal-light p-3">
                <p className="text-xs text-stone">Scope 2</p>
                <p className="text-lg font-700 text-forest">{result.scope2.total}</p>
              </div>
              <div className="rounded-lg bg-mist p-3">
                <p className="text-xs text-stone">Scope 3</p>
                <p className="text-lg font-700 text-forest">{result.scope3.total}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-sand p-3">
              <span className="text-sm text-mid">Por empleado</span>
              <span className="font-medium text-forest">
                {result.per_employee} tCO₂e
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-sand p-3">
              <span className="text-sm text-mid">Media del sector</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-forest">
                  {result.sector_average} tCO₂e
                </span>
                {result.comparison === "below" && (
                  <TrendingDown size={16} className="text-teal" />
                )}
                {result.comparison === "above" && (
                  <TrendingUp size={16} className="text-coral" />
                )}
                {result.comparison === "average" && (
                  <Minus size={16} className="text-mid" />
                )}
              </div>
            </div>

            {result.quick_wins.length > 0 && (
              <div>
                <p className="text-xs font-medium text-mid mb-2">Quick wins</p>
                <ul className="space-y-1.5">
                  {result.quick_wins.map((win, i) => (
                    <li key={i} className="flex gap-2 text-sm text-forest">
                      <ArrowRight size={14} className="text-teal mt-0.5 shrink-0" />
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calculator size={40} className="text-sand" />
            <p className="mt-4 text-sm text-stone">
              Introduce los datos y pulsa calcular.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sector Benchmark Generator ─────────────────────────────────────

function BenchmarkSection() {
  const [sector, setSector] = useState("servicios");
  const [employees, setEmployees] = useState("6-20");

  const employeeMidpoints: Record<string, number> = {
    "1-5": 3,
    "6-20": 13,
    "21-50": 35,
    "51-200": 125,
    "200+": 300,
  };

  const bench = SECTOR_BENCHMARKS[sector] || SECTOR_BENCHMARKS.otro;
  const empCount = employeeMidpoints[employees] || 13;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-sand bg-white p-6">
        <h3 className="font-display text-lg font-700 text-forest mb-4">
          Benchmark sectorial
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-mid">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
            >
              {Object.entries(SECTOR_BENCHMARKS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-mid">Tamaño</label>
            <select
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sand bg-mist px-3 py-2 text-sm text-forest"
            >
              {Object.keys(employeeMidpoints).map((s) => (
                <option key={s} value={s}>
                  {s} empleados
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-sand bg-white p-6">
        <h3 className="font-display text-lg font-700 text-forest mb-4">
          Datos del sector: {bench.label}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-teal-light p-4">
              <p className="text-xs text-stone">Mejor práctica</p>
              <p className="text-xl font-700 text-forest">{bench.best}</p>
              <p className="text-[10px] text-mid">tCO₂e/empl</p>
            </div>
            <div className="rounded-lg bg-mist p-4">
              <p className="text-xs text-stone">Media</p>
              <p className="text-xl font-700 text-forest">{bench.avg}</p>
              <p className="text-[10px] text-mid">tCO₂e/empl</p>
            </div>
            <div className="rounded-lg bg-coral-soft p-4">
              <p className="text-xs text-stone">Por encima</p>
              <p className="text-xl font-700 text-forest">{bench.worst}</p>
              <p className="text-[10px] text-mid">tCO₂e/empl</p>
            </div>
          </div>

          <div className="h-px bg-sand" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-mid">Estimación empresa ({employees} empl.)</span>
              <span className="font-medium text-forest">
                {(bench.avg * empCount).toFixed(1)} tCO₂e/año
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mid">Objetivo reducción (-20%)</span>
              <span className="font-medium text-teal">
                {(bench.avg * empCount * 0.8).toFixed(1)} tCO₂e/año
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mid">Mejor práctica alcanzable</span>
              <span className="font-medium text-forest-accent">
                {(bench.best * empCount).toFixed(1)} tCO₂e/año
              </span>
            </div>
          </div>

          {/* Visual bar */}
          <div>
            <p className="text-xs font-medium text-mid mb-2">
              Rango del sector (tCO₂e/empleado)
            </p>
            <div className="relative h-6 rounded-full bg-mist overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-teal to-coral rounded-full"
                style={{
                  left: `${(bench.best / bench.worst) * 100}%`,
                  width: `${((bench.avg - bench.best) / bench.worst) * 100}%`,
                }}
              />
              {/* Average marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-forest"
                style={{ left: `${(bench.avg / bench.worst) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone mt-1">
              <span>{bench.best}</span>
              <span>Media: {bench.avg}</span>
              <span>{bench.worst}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Legislation Search with AI ─────────────────────────────────────

function LegislationSearchSection() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Como experto en legislación ambiental y de sostenibilidad en España y la UE, responde a esta consulta de un consultor profesional. Sé preciso con las referencias normativas y fechas.\n\nConsulta: ${query.trim()}`,
            },
          ],
          sessionId: `legislation-${Date.now()}`,
        }),
      });

      if (!res.ok) {
        setResponse("Error al consultar. Inténtalo de nuevo.");
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setResponse(content);
      }
    } catch {
      setResponse("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-sand bg-white p-6">
        <h3 className="font-display text-lg font-700 text-forest mb-4">
          Buscador de legislación con IA
        </h3>
        <p className="text-sm text-mid mb-4">
          Consulta normativa ambiental española y europea. La IA busca en su
          base de conocimiento sobre CSRD, Ley 7/2022, taxonomía UE y más.
        </p>

        <div className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: ¿Qué obligaciones tiene una empresa de hostelería con menos de 50 empleados respecto a la gestión de residuos?"
            rows={4}
            className="w-full resize-none rounded-lg border border-sand bg-mist px-3 py-2.5 text-sm text-forest placeholder:text-stone focus:border-forest-accent focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {isLoading ? "Buscando..." : "Consultar"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-sand bg-white p-6">
        <h3 className="font-display text-lg font-700 text-forest mb-4">
          Resultado
        </h3>

        {response ? (
          <div className="prose-circulr text-sm max-h-[500px] overflow-y-auto">
            {response.split("\n").map((line, i) => {
              if (!line.trim()) return <br key={i} />;
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={i} className="font-semibold text-forest mt-3 mb-1">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <div key={i} className="flex gap-2 pl-2 mb-1">
                    <span className="text-teal">•</span>
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              return <p key={i} className="mb-1.5">{line}</p>;
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Scale size={40} className="text-sand" />
            <p className="mt-4 text-sm text-stone">
              Escribe tu consulta sobre legislación ambiental.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
