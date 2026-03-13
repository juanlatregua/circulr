import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToolCard } from "@/components/tools/ToolCard";
import { TOOL_DEFINITIONS, TOOL_SLUGS } from "@/lib/tools/definitions";

export const metadata = {
  title: "Herramientas — CIRCULR",
  description: "Herramientas de sostenibilidad con resultados instantáneos. Desde calculadoras gratuitas hasta informes verificados.",
};

export default function ToolsCatalogPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="public" />

      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-800 text-forest md:text-5xl">
              Herramientas instantáneas
            </h1>
            <p className="mt-4 text-lg text-mid leading-relaxed">
              Resultados en minutos, no en semanas. Sin reuniones, sin esperas.
              Desde calculadoras gratuitas hasta informes verificados por expertos.
            </p>
          </div>

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
        </div>
      </section>

      <Footer />
    </div>
  );
}
