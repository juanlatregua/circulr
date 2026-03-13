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

    if (data.session) {
      window.location.href = "/dashboard/onboarding";
      return;
    }

    setLoading(false);
    setError(null);
    document.getElementById("register-form")?.classList.add("hidden");
    document.getElementById("success-message")?.classList.remove("hidden");
  }

  const inputClass = "mt-1 w-full rounded-lg border border-sand bg-cream/50 px-4 py-2.5 text-sm text-forest placeholder:text-stone focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/30";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-sand bg-white p-8 shadow-sm">
        <div id="success-message" className="hidden text-center">
          <h1 className="font-display text-2xl font-800 text-forest">
            Revisa tu email
          </h1>
          <p className="mt-4 text-sm text-mid">
            Hemos enviado un enlace de confirmación a <strong className="text-forest">{email}</strong>.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-teal font-medium hover:underline"
          >
            Ir a iniciar sesión
          </Link>
        </div>

        <div id="register-form">
          <Link href="/" className="mb-8 flex justify-center">
            <Image src="/logo-dark.svg" alt="CIRCULR" width={180} height={40} className="h-9 w-auto" />
          </Link>
          <h1 className="font-display text-2xl font-800 text-forest text-center">
            Crear cuenta
          </h1>
          <p className="mt-2 text-sm text-mid text-center">
            Empieza tu transición circular
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-forest">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={inputClass}
                placeholder="María García"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-forest">
                Empresa
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className={inputClass}
                placeholder="Empresa S.L."
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-forest">
                Email corporativo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
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
                minLength={8}
                className={inputClass}
                placeholder="Mínimo 8 caracteres"
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-mid">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-teal font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
