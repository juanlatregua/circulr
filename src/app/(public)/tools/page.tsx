import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TOOL_DEFINITIONS } from "@/lib/tools/definitions";
import {
  Leaf,
  ShieldCheck,
  FileText,
  BookOpen,
  Award,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "Herramientas — CIRCULR",
  description:
    "Herramientas de sostenibilidad con resultados instantáneos. Desde calculadoras gratuitas hasta informes verificados.",
};

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  ShieldCheck,
  FileText,
  BookOpen,
  Award,
};

const toolCards = [
  {
    slug: "huella-carbono",
    image: "/images/foto17.png",
    audience: "Cualquier PYME que quiera conocer su punto de partida",
    result: "Resumen de emisiones Scope 1 y 2 por categoría",
  },
  {
    slug: "test-csrd",
    image: "/images/foto30.png",
    audience: "Proveedores de grandes empresas y exportadores a la UE",
    result: "Informe de riesgo + 5 acciones prioritarias",
  },
  {
    slug: "politica-medioambiental",
    image: "/images/foto46.jpg",
    audience: "Empresas en certificación ISO o licitaciones públicas",
    result: "PDF con tu logo, firmable digitalmente",
  },
  {
    slug: "memoria-sostenibilidad",
    image: "/images/foto56.jpg",
    audience: "Empresas que reportan ante bancos o inversores",
    result: "Memoria GRI completa en PDF con tus datos reales",
  },
  {
    slug: "huella-verificada",
    image: "/images/foto16.jpg",
    audience:
      "Empresas que solicitan Registro Huella MITECO o financiación verde",
    result: "Informe ISO 14064 firmado + número de registro MITECO",
  },
];

const faqs = [
  {
    q: "¿Qué es el CSRD y me afecta?",
    a: "La Directiva CSRD obliga a reportar sostenibilidad. Desde 2025 afecta a grandes empresas y por efecto cadena a sus proveedores PYME.",
  },
  {
    q: "¿Mis documentos son válidos legalmente?",
    a: "Los informes verificados están firmados por consultores acreditados y son admitidos por MITECO, bancos e inversores.",
  },
  {
    q: "¿Necesito conocimientos técnicos?",
    a: "No. Solo datos básicos: consumo eléctrico, flota y principales proveedores. Te guiamos paso a paso.",
  },
  {
    q: "¿Qué es la Huella de Carbono?",
    a: "Es la medida total de CO₂ que genera tu empresa. Incluye luz, transporte, residuos y cadena de suministro.",
  },
];

export default function ToolsCatalogPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="public" />

      {/* Hero with background image */}
      <section className="relative min-h-[500px] overflow-hidden pt-32 pb-20">
        <Image
          src="/images/foto31.png"
          alt="Planta termosolar"
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(13, 61, 42, 0.4)" }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-800 text-white md:text-5xl">
              Herramientas instantáneas
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Resultados en minutos, no en semanas. Sin reuniones, sin esperas.
              Desde calculadoras gratuitas hasta informes verificados por
              expertos.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Pedagogical block */}
          <div
            className="-mt-8 mb-8 rounded-xl border-l-4 border-forest-accent p-8"
            style={{ backgroundColor: "#f0f7f4" }}
          >
            <h2 className="font-display text-2xl font-700 text-forest-accent">
              ¿Por qué necesitas esto?
            </h2>
            <p className="mt-3 leading-relaxed text-mid">
              Desde 2023, la Directiva CSRD europea obliga a reportar impacto
              ambiental. En España, la Ley 7/2022 de Residuos ya impone
              sanciones de hasta 100.000€. Si eres proveedor de una empresa
              grande, pronto te pedirán que demuestres tu huella de carbono y tus
              políticas medioambientales.
            </p>
          </div>

          {/* Tool cards */}
          <div className="mt-8 flex flex-col gap-6">
            {toolCards.map((card) => {
              const tool = TOOL_DEFINITIONS[card.slug];
              const Icon = iconMap[tool.icon] || Leaf;
              return (
                <div
                  key={card.slug}
                  className={`flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md md:flex-row ${
                    tool.free
                      ? "border-teal/30 bg-white ring-2 ring-teal/20"
                      : "border-sand bg-white"
                  }`}
                >
                  {/* Image */}
                  <div className="relative min-h-[220px] w-full md:min-h-[280px] md:w-[40%]">
                    <Image
                      src={card.image}
                      alt={tool.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col p-6 md:w-[60%]">
                    {tool.free && (
                      <span className="mb-3 inline-flex w-fit rounded-full bg-teal-light px-3 py-1 text-xs font-medium text-teal">
                        Gratis
                      </span>
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft">
                      <Icon size={20} className="text-coral" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-700 text-forest">
                      {tool.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-2xl font-800 text-forest">
                        {tool.priceLabel}
                      </span>
                      <span className="text-xs text-stone">
                        {tool.timeline}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-mid">
                      {tool.description}
                    </p>

                    {/* Pedagogical content */}
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-forest">
                        <span className="font-semibold">Para quién:</span>{" "}
                        <span className="text-mid">{card.audience}</span>
                      </p>
                      <p className="text-forest">
                        <span className="font-semibold">Qué obtienes:</span>{" "}
                        <span className="text-mid">{card.result}</span>
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                      <Link
                        href={`/tools/${card.slug}`}
                        className={`inline-block rounded-full px-6 py-2.5 text-center text-sm font-medium transition-all ${
                          tool.free
                            ? "gradient-primary text-white shadow-sm hover:opacity-90"
                            : "border border-sand text-forest hover:bg-mist"
                        }`}
                      >
                        {tool.free ? "Calcular gratis" : "Empezar"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ section */}
          <div className="mt-16 pt-12 scroll-mt-20">
            <h2 className="mb-8 font-display text-2xl font-700 text-forest">
              Preguntas frecuentes
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-xl border border-sand bg-white p-6"
                >
                  <h3 className="font-display text-base font-700 text-forest">
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mid">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
