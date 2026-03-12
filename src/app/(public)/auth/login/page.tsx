"use client";

import { useState } from "react";
import Link from "next/link";
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

    // Check profile for role + onboarded status
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
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-800 text-off-white">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm text-pale">
          Accede a tu cuenta CIRCULR
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-pale">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-steel/30 bg-smoke px-4 py-2.5 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
              placeholder="tu@empresa.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-pale">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-steel/30 bg-smoke px-4 py-2.5 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lime px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-lime-dim disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mid">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-lime hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
