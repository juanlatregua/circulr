import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <h1 className="font-display text-6xl font-800 text-lime">404</h1>
      <p className="mt-4 text-lg text-off-white">Página no encontrada</p>
      <p className="mt-2 text-sm text-pale">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-lime px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-lime-dim"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
