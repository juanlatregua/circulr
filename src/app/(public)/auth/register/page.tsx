"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, redirect directly to onboarding
    if (data.session) {
      window.location.href = "/dashboard/onboarding";
      return;
    }

    // Email confirmation required — show confirmation message
    setLoading(false);
    setError(null);
    // Show success state by replacing form
    document.getElementById("register-form")?.classList.add("hidden");
    document.getElementById("success-message")?.classList.remove("hidden");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm">
        <div id="success-message" className="hidden text-center">
          <h1 className="font-display text-3xl font-800 text-off-white">
            Revisa tu email
          </h1>
          <p className="mt-4 text-sm text-pale">
            Hemos enviado un enlace de confirmación a <strong className="text-off-white">{email}</strong>.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-lime hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </div>

        <div id="register-form">
          <Link href="/" className="mb-8 block">
            <Image src="/logo.svg" alt="CIRCULR" width={180} height={40} className="h-9 w-auto" />
          </Link>
          <h1 className="font-display text-3xl font-800 text-off-white">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-pale">
            Empieza tu transición circular
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm text-pale">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-steel/30 bg-smoke px-4 py-2.5 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
                placeholder="María García"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm text-pale">
                Empresa
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-steel/30 bg-smoke px-4 py-2.5 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
                placeholder="Empresa S.L."
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-pale">
                Email corporativo
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
                minLength={8}
                className="mt-1 w-full rounded-lg border border-steel/30 bg-smoke px-4 py-2.5 text-sm text-off-white placeholder:text-mid focus:border-lime focus:outline-none"
                placeholder="Mínimo 8 caracteres"
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-mid">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-lime hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
