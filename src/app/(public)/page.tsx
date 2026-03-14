import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolCard } from "@/components/tools/ToolCard";
import { TOOL_DEFINITIONS, TOOL_SLUGS } from "@/lib/tools/definitions";
import {
  ArrowRight,
  HelpCircle,
  Clock,
  Users as UsersIcon,
  ClipboardList,
  Cpu,
  FileCheck,
  CheckCircle2,
  Leaf,
  Waves,
  Zap,
} from "lucide-react";

const painPoints = [
  {
    icon: HelpCircle,
    title: "Me ha llegado un cuestionario y no sé qué hacer",
    description:
      "Tu cliente grande te pide datos CSRD/ESRS. Tienes un plazo, cero experiencia en sostenibilidad, y Google no ayuda.",
  },
  {
    icon: Clock,
    title: "Las consultoras tardan meses y cobran una fortuna",
    description:
      "Presupuestos de 15.000€, plazos de 6 meses, y entregables que no entiendes. No tienes ese tiempo ni ese dinero.",
  },
  {
    icon: UsersIcon,
    title: "No tengo equipo de sostenibilidad",
    description:
      "Tu equipo ya está al límite. Contratar un especialista interno es caro y lento. Necesitas una solución externa, rápida y asequible.",
  },
];

const steps = [
  {
    icon: ClipboardList,
    number: "01",
    title: "Cuéntanos tu situación",
    time: "10 min",
    description:
      "Completas un formulario inteligente con la información básica de tu empresa y el cuestionario que has recibido.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Nuestros expertos + IA generan el entregable",
    time: "5-10 días",
    description:
      "Un consultor especializado, apoyado por nuestra IA, analiza tu caso y genera la documentación completa.",
  },
  {
    icon: FileCheck,
    number: "03",
    title: "Lo recibes revisado y listo para enviar",
    time: "Verificado",
    description:
      "Entregable profesional revisado por expertos. Lo descargas desde tu dashboard y lo envías a tu cliente.",
  },
];

const services = [
  {
    name: "Diagnóstico CE",
    price: "1.500",
    timeline: "5 días",
    description: "Mapa completo de tu circularidad en 5 días",
    image: "/images/foto17.png",
    features: [
      "Análisis de flujos de materiales",
      "Evaluación de madurez circular",
      "Identificación de oportunidades",
      "Hoja de ruta circular",
    ],
    cta: "Solicitar diagnóstico",
    highlighted: false,
  },
  {
    name: "Respuesta CSRD",
    price: "2.500",
    timeline: "10 días",
    description: "Cuestionario respondido y verificado en 10 días",
    image: "/images/foto54.png",
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
    timeline: "3 meses",
    description: "Plan completo de 12 meses con acompañamiento",
    image: "/images/foto49.png",
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
    name: "Isabelle Guitton",
    role: "Economía Circular",
    icon: Leaf,
    bio: "Master VIU 2024. Especialista ESRS E5. 15+ años en consultoría de sostenibilidad y economía circular para empresas europeas.",
  },
  {
    name: "Miguel Fernández",
    role: "Economía Azul",
    icon: Waves,
    bio: "Biólogo marino. Especialista en estrategias circulares aplicadas al sector industrial y simbiosis industrial.",
  },
  {
    name: "Tech Team",
    role: "Plataforma Digital + IA",
    icon: Zap,
    bio: "Plataforma propia que combina IA (Claude) con conocimiento sectorial para automatizar lo repetitivo y potenciar al consultor.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="public" />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center pt-16 overflow-hidden">
        <Image
          src="/images/foto22.png"
          alt="Girasoles y aerogeneradores en España"
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(10, 30, 15, 0.65)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-800 leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
              Tu cliente grande acaba de mandarte un cuestionario CSRD.{" "}
              <span className="gradient-primary-text">Tienes 10 días.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85 leading-relaxed">
              CIRCULR lo resuelve por ti. Precio fijo. Plazo garantizado.
              Sin consultoras caras.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="gradient-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-md"
              >
                Empezar ahora
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-12 md:flex-row md:items-start">
            <div className="md:w-[55%]">
              <h2 className="font-display text-3xl font-800 text-forest md:text-4xl">
                ¿Te suena?
              </h2>
              <p className="mt-4 max-w-2xl text-mid">
                Tres situaciones que vemos todos los días.
              </p>
              <div className="mt-12 grid gap-6">
                {painPoints.map((pain) => (
                  <div
                    key={pain.title}
                    className="rounded-2xl border border-sand bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft">
                      <pain.icon size={20} className="text-coral" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-700 text-forest">
                      {pain.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-mid">
                      {pain.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[300px] w-[45%] overflow-hidden rounded-xl md:block">
              <Image
                src="/images/foto65.jpg"
                alt="Reunión de negocios con apretón de manos"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="relative py-24 overflow-hidden">
        <Image
          src="/images/foto63.png"
          alt="Reunión de consultoría moderna"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-mist/80" />
        <div className="relative mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-forest md:text-4xl">
            Cómo funciona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-mid">
            De la incertidumbre al entregable en tres pasos.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <step.icon size={24} className="text-teal" />
                </div>
                <span className="mt-4 inline-block rounded-full bg-teal-light px-3 py-1 text-xs font-medium text-teal">
                  {step.time}
                </span>
                <h3 className="mt-3 font-display text-xl font-700 text-forest">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mid">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-forest md:text-4xl">
            Servicios con precio fijo
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-mid">
            Sin sorpresas. Sabes lo que pagas y lo que recibes.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.name}
                className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm ${
                  service.highlighted
                    ? "border-coral/30 bg-white ring-2 ring-coral/20"
                    : "border-sand bg-white"
                }`}
              >
                <div className="relative h-[180px] w-full">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {service.highlighted && (
                    <span className="mb-4 inline-flex w-fit rounded-full gradient-primary px-3 py-1 text-xs font-medium text-white">
                      Más popular
                    </span>
                  )}
                  <h3 className="font-display text-xl font-700 text-forest">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-mid">{service.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-800 text-forest">
                      {service.price}
                    </span>
                    <span className="text-sm text-mid">&euro;</span>
                  </div>
                  <span className="mt-1 text-xs text-teal font-medium">{service.timeline}</span>
                  <ul className="mt-6 flex-1 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-teal"
                        />
                        <span className="text-sm text-mid">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className={`mt-6 rounded-full px-4 py-2.5 text-center text-sm font-medium transition-all ${
                      service.highlighted
                        ? "gradient-primary text-white hover:opacity-90 shadow-sm"
                        : "border border-sand text-forest hover:bg-mist"
                    }`}
                  >
                    {service.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HERRAMIENTAS INSTANTÁNEAS */}
      <section id="herramientas" className="bg-mist py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-forest md:text-4xl">
            Herramientas instantáneas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-mid">
            Resultados en minutos, no en semanas. Sin reuniones, sin esperas.
          </p>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_SLUGS.map((slug) => {
              const tool = TOOL_DEFINITIONS[slug];
              return (
                <ToolCard
                  key={slug}
                  slug={tool.slug}
                  name={tool.name}
                  description={tool.description}
                  priceLabel={tool.priceLabel}
                  timeline={tool.timeline}
                  free={tool.free}
                  icon={tool.icon}
                />
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm font-medium text-teal hover:underline"
            >
              Ver todas las herramientas
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section id="equipo" className="relative py-24 overflow-hidden">
        <Image
          src="/images/foto63.png"
          alt="Reunión de equipo"
          fill
          className="hidden object-cover md:block"
        />
        <div
          className="absolute inset-0 hidden md:block"
          style={{ backgroundColor: "rgba(240, 247, 244, 0.92)" }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-800 text-forest md:text-4xl">
            Quién está detrás
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-mid">
            Consultores reales + tecnología de verdad. Sin greenwashing.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-sand bg-white p-6 shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-light">
                  <member.icon size={24} className="text-teal" />
                </div>
                <h3 className="mt-4 font-display text-lg font-700 text-forest">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-coral">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-mid">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative min-h-[300px] overflow-hidden py-24">
        <Image
          src="/images/foto31.png"
          alt="Planta termosolar"
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(13, 61, 42, 0.75)" }}
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-white md:text-4xl">
            ¿Tienes un cuestionario CSRD encima de la mesa?
          </h2>
          <p className="mt-4 text-white/85">
            No dejes que un plazo te paralice. Nosotros lo resolvemos por ti —
            con precio fijo, plazo garantizado y entregable profesional.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="gradient-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium text-white transition-opacity hover:opacity-90 shadow-md"
            >
              Resolvámoslo juntos
              <ArrowRight size={18} />
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/60">
            Sin compromiso. Respondemos en menos de 24h.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
