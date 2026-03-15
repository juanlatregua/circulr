import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Navbar } from "@/components/layout/Navbar";
import { BookOpen, Calendar, ArrowRight, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | CIRCULR — Sostenibilidad para PYMES",
  description:
    "Artículos sobre legislación ambiental, herramientas de sostenibilidad y casos prácticos para PYMES españolas.",
};

const CATEGORY_LABELS: Record<string, string> = {
  legislacion: "Legislación",
  herramientas: "Herramientas",
  "casos-practicos": "Casos prácticos",
};

const CATEGORY_COLORS: Record<string, string> = {
  legislacion: "bg-coral-soft text-coral",
  herramientas: "bg-teal-light text-forest-accent",
  "casos-practicos": "bg-[#FEF9E7] text-[#92750C]",
};

export default function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  return <BlogContent searchParamsPromise={searchParams} />;
}

async function BlogContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParamsPromise;
  const allPosts = getAllPosts();
  const posts = categoria
    ? allPosts.filter((p) => p.category === categoria)
    : allPosts;

  const categories = [...new Set(allPosts.map((p) => p.category))];

  return (
    <>
      <Navbar variant="public" />

      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-800 tracking-tight text-forest md:text-5xl">
              Blog
            </h1>
            <p className="mt-4 text-lg text-mid max-w-2xl mx-auto">
              Recursos sobre sostenibilidad, legislación ambiental y
              herramientas prácticas para PYMES españolas.
            </p>
          </div>

          {/* Category filter */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !categoria
                  ? "bg-forest text-white"
                  : "bg-white text-mid border border-sand hover:border-forest hover:text-forest"
              }`}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?categoria=${cat}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  categoria === cat
                    ? "bg-forest text-white"
                    : "bg-white text-mid border border-sand hover:border-forest hover:text-forest"
                }`}
              >
                <Tag size={14} />
                {CATEGORY_LABELS[cat] ?? cat}
              </Link>
            ))}
          </div>

          {/* Posts grid */}
          {posts.length === 0 ? (
            <p className="text-center text-mid py-20">
              No hay artículos en esta categoría todavía.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-sand bg-white p-6 transition-all hover:shadow-lg hover:border-forest/20"
                >
                  {/* Category badge */}
                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                      CATEGORY_COLORS[post.category] ?? "bg-mist text-mid"
                    }`}
                  >
                    {CATEGORY_LABELS[post.category] ?? post.category}
                  </span>

                  {/* Title */}
                  <h2 className="mt-4 font-display text-xl font-700 text-forest group-hover:text-forest-accent transition-colors leading-snug">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 flex-1 text-sm text-mid leading-relaxed line-clamp-3">
                    {post.description}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-stone">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen size={12} />
                      {post.readingTime}
                    </span>
                  </div>

                  {/* Read more */}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-forest-accent group-hover:gap-2 transition-all">
                    Leer artículo
                    <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <section className="bg-forest px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-700 text-white md:text-3xl">
          ¿Necesitas ayuda con la sostenibilidad de tu empresa?
        </h2>
        <p className="mt-3 text-cream/80 max-w-xl mx-auto">
          Nuestro equipo de consultores te acompaña desde el diagnóstico hasta
          la implementación.
        </p>
        <Link
          href="/auth/register"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
        >
          Empezar ahora
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
