"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarded")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "consultant" || profile?.role === "admin") {
      window.location.href = "/consultant";
    } else if (profile?.onboarded) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/dashboard/onboarding";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-sand bg-white p-8 shadow-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Image src="/logo-dark.svg" alt="CIRCULR" width={180} height={40} className="h-9 w-auto" />
        </Link>
        <h1 className="font-display text-2xl font-800 text-forest text-center">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-mid text-center">
          Accede a tu cuenta
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-forest">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-sand bg-cream/50 px-4 py-2.5 text-sm text-forest placeholder:text-stone focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/30"
              placeholder="tu@empresa.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-forest">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-sand bg-cream/50 px-4 py-2.5 text-sm text-forest placeholder:text-stone focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary rounded-full px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mid">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-teal font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
