import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <h1 className="font-display text-6xl font-800 text-coral">404</h1>
      <p className="mt-4 text-lg text-forest">Página no encontrada</p>
      <p className="mt-2 text-sm text-mid">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
