import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Cookies — CIRCULR",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="public" />

      <section className="pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-mid hover:text-forest transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al inicio
          </Link>

          <h1 className="mt-8 font-display text-3xl font-800 text-forest">
            Política de Cookies
          </h1>

          <div className="mt-8 rounded-xl border border-sand bg-white p-8">
            <p className="text-mid leading-relaxed">
              Contenido en construcción. Próximamente disponible.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
