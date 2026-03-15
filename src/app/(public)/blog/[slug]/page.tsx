import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Navbar } from "@/components/layout/Navbar";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  User,
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };

  return {
    title: `${post.title} | CIRCULR Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Navbar variant="public" />

      <main className="min-h-screen bg-cream pt-24 pb-16">
        <article className="mx-auto max-w-3xl px-6">
          {/* Breadcrumb */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-mid hover:text-forest transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Volver al blog
          </Link>

          {/* Hero */}
          <header className="mb-10">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                CATEGORY_COLORS[post.category] ?? "bg-mist text-mid"
              }`}
            >
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>

            <h1 className="mt-4 font-display text-3xl font-800 tracking-tight text-forest md:text-4xl leading-tight">
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-mid leading-relaxed">
              {post.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-stone">
              <span className="inline-flex items-center gap-1.5">
                <User size={14} />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(post.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={14} />
                {post.readingTime}
              </span>
            </div>

            <div className="mt-8 h-px bg-sand" />
          </header>

          {/* MDX Content */}
          <div className="prose-circulr">
            <MDXRemote source={post.content} />
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl bg-forest p-8 text-center md:p-12">
            <h2 className="font-display text-2xl font-700 text-white">
              ¿Te ha resultado útil este artículo?
            </h2>
            <p className="mt-2 text-cream/80">
              Descubre cómo CIRCULR puede ayudar a tu empresa con la
              sostenibilidad.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-forest transition-opacity hover:opacity-90"
              >
                Herramientas gratuitas
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Empezar ahora
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
