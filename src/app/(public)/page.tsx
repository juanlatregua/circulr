import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  AlertTriangle,
  Clock,
  Euro,
  CheckCircle2,
  Users,
  Mail,
} from "lucide-react";

const tickerWords = [
  "CSRD",
  "Economía Circular",
  "ESRS",
  "Residuo Cero",
  "Simbiosis Industrial",
  "Ecodiseño",
  "Huella de Carbono",
  "R-Estrategias",
  "Taxonomía UE",
  "Due Diligence",
  "Circularidad",
  "Sostenibilidad",
];

const stats = [
  { value: "11,000+", label: "Empresas afectadas por CSRD en España" },
  { value: "73%", label: "No saben por dónde empezar" },
  { value: "2025", label: "Año límite para primeros reportes" },
  { value: "6-12 sem", label: "Tiempo medio de respuesta CIRCULR" },
];

const painPoints = [
  {
    icon: AlertTriangle,
    title: "Regulación sin mapa",
    description:
      "CSRD, ESRS, taxonomía EU... La normativa avanza más rápido que tu capacidad de respuesta. No sabes qué aplica a tu empresa ni por dónde empezar.",
  },
  {
    icon: Clock,
    title: "Sin tiempo ni equipo",
    description:
      "Tu equipo ya está al límite. No tienes un departamento de sostenibilidad, y contratar un consultor tradicional tarda meses y cuesta una fortuna.",
  },
  {
    icon: Euro,
    title: "Costes opacos",
    description:
      "Presupuestos a medida que nunca llegan, alcance difuso y entregables que no entiendes. Necesitas claridad, precio fijo y resultados medibles.",
  },
];

const steps = [
  {
    number: "01",
    title: "Diagnóstico exprés",
    description:
      "Completas un formulario inteligente. Nuestra IA analiza tu situación y genera un pre-diagnóstico en minutos, no semanas.",
  },
  {
    number: "02",
    title: "Consultor asignado",
    description:
      "Un especialista revisa, refina y valida el análisis. Recibes un plan de acción concreto con plazos y prioridades.",
  },
  {
    number: "03",
    title: "Entregable listo",
    description:
      "Documentación profesional: gap analysis CSRD, hoja de ruta circular, o plan de implementación. Todo en tu dashboard.",
  },
];

const services = [
  {
    name: "Diagnóstico CE",
    price: "1.500",
    description: "Evaluación de madurez circular y hoja de ruta",
    features: [
      "Análisis de flujos de materiales",
      "Evaluación de madurez CE",
      "Identificación de oportunidades",
      "Hoja de ruta circular",
    ],
    cta: "Solicitar diagnóstico",
    highlighted: false,
  },
  {
    name: "Respuesta CSRD",
    price: "2.500",
    description: "Gap analysis y plan de acción para cumplimiento CSRD/ESRS",
    features: [
      "Análisis de gaps ESRS completo",
      "Plan de acción priorizado",
      "Plantillas de reporte",
      "Sesión de seguimiento",
    ],
    cta: "Empezar ahora",
    highlighted: true,
  },
  {
    name: "Implementación",
    price: "5.000",
    description: "Acompañamiento completo en la transición circular",
    features: [
      "Plan de implementación detallado",
      "Seguimiento mensual",
      "KPIs y métricas",
      "Soporte continuo 3 meses",
    ],
    cta: "Contactar",
    highlighted: false,
  },
];

const team = [
  {
    name: "Isabelle Monnier",
    role: "CEO & Lead Consultant",
    bio: "15+ años en consultoría de sostenibilidad y economía circular. Ex-directora de programas CE en consultoras europeas de referencia.",
  },
  {
    name: "Miguel Fernández",
    role: "Head of Operations",
    bio: "Especialista en implementación de estrategias circulares en sector industrial. Ingeniero ambiental con MBA.",
  },
  {
    name: "Tech Team",
    role: "Producto & Ingeniería",
    bio: "Equipo de producto que combina IA aplicada con conocimiento sectorial para automatizar lo repetitivo y potenciar al consultor.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar variant="public" />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center pt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl font-800 leading-[1.1] tracking-tight text-off-white md:text-7xl">
              Tu empresa necesita ser circular.
              <span className="text-lime"> Nosotros lo hacemos posible.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-pale">
              Consultoría de economía circular potenciada por IA. Cumplimiento
              CSRD, diagnósticos CE y planes de implementación — con precio
              fijo, plazos reales y entregables que entiendes.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-lime px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-lime-dim"
              >
                Solicitar diagnóstico
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-steel/50 px-6 py-3 text-sm font-medium text-off-white transition-colors hover:border-pale hover:bg-smoke"
              >
                Cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section className="overflow-hidden border-y border-steel/30 py-4">
        <div className="animate-ticker flex whitespace-nowrap">
          {[...tickerWords, ...tickerWords].map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="mx-6 font-display text-sm font-700 uppercase tracking-widest text-steel"
            >
              {word}
            </span>
          ))}
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-b border-steel/30 bg-smoke py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-800 text-lime">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-pale">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-off-white md:text-4xl">
            El problema es claro
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-pale">
            Las empresas europeas enfrentan una presión regulatoria sin
            precedentes. La mayoría no tiene los recursos para responder.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {painPoints.map((pain) => (
              <div
                key={pain.title}
                className="rounded-xl border border-steel/30 bg-smoke p-6"
              >
                <pain.icon size={28} className="text-lime" />
                <h3 className="mt-4 font-display text-lg font-700 text-off-white">
                  {pain.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-pale">
                  {pain.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE QUOTE */}
      <section className="overflow-hidden border-y border-lime/20 bg-lime/5 py-8">
        <div className="animate-ticker-slow flex whitespace-nowrap">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="mx-12 font-display text-2xl font-800 text-lime md:text-3xl"
            >
              La circularidad no es una opción — es la nueva ventaja competitiva
              &nbsp;&bull;&nbsp;
            </span>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-off-white md:text-4xl">
            Cómo funciona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-pale">
            De la incertidumbre al plan de acción en tres pasos.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span className="font-display text-6xl font-800 text-steel/30">
                  {step.number}
                </span>
                <h3 className="mt-2 font-display text-xl font-700 text-off-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-pale">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="servicios" className="border-t border-steel/30 bg-smoke py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-off-white md:text-4xl">
            Servicios con precio fijo
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-pale">
            Sin sorpresas. Sabes lo que pagas y lo que recibes.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.name}
                className={`flex flex-col rounded-xl border p-6 ${
                  service.highlighted
                    ? "border-lime bg-ash"
                    : "border-steel/30 bg-black"
                }`}
              >
                {service.highlighted && (
                  <span className="mb-4 inline-flex w-fit rounded-full bg-lime/20 px-3 py-1 text-xs font-medium text-lime">
                    Más popular
                  </span>
                )}
                <h3 className="font-display text-xl font-700 text-off-white">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-pale">{service.description}</p>
                <div className="mt-4">
                  <span className="font-display text-4xl font-800 text-off-white">
                    {service.price}
                  </span>
                  <span className="ml-1 text-sm text-mid">&euro;</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-lime"
                      />
                      <span className="text-sm text-pale">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`mt-6 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    service.highlighted
                      ? "bg-lime text-black hover:bg-lime-dim"
                      : "border border-steel/50 text-off-white hover:bg-ash"
                  }`}
                >
                  {service.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section id="equipo" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-off-white md:text-4xl">
            Quién está detrás
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-pale">
            Consultores reales + tecnología de verdad. Sin greenwashing.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-steel/30 bg-smoke p-6"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ash">
                  <Users size={24} className="text-lime" />
                </div>
                <h3 className="mt-4 font-display text-lg font-700 text-off-white">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-lime">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-pale">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-steel/30 bg-smoke py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-off-white md:text-4xl">
            Empieza tu transición circular
          </h2>
          <p className="mt-4 text-pale">
            Solicita tu diagnóstico gratuito y descubre el estado real de tu
            empresa frente a la economía circular y la CSRD.
          </p>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-2 rounded-lg border border-steel/30 bg-ash px-4 py-2.5">
              <Mail size={18} className="text-mid" />
              <input
                type="email"
                placeholder="tu@empresa.com"
                className="w-full bg-transparent text-sm text-off-white placeholder:text-mid focus:outline-none sm:w-64"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-lime px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-lime-dim"
            >
              Solicitar diagnóstico
            </button>
          </form>
          <p className="mt-3 text-xs text-mid">
            Sin compromiso. Respondemos en menos de 24h.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
