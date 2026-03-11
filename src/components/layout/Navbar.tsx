"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  variant?: "public" | "app";
}

export function Navbar({ variant = "public" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (variant === "public") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-steel/30 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-display text-xl font-800 tracking-tight text-off-white">
            CIRQLR
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#servicios" className="text-sm text-pale transition-colors hover:text-off-white">
              Servicios
            </Link>
            <Link href="#como-funciona" className="text-sm text-pale transition-colors hover:text-off-white">
              Cómo funciona
            </Link>
            <Link href="#equipo" className="text-sm text-pale transition-colors hover:text-off-white">
              Equipo
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-lime px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-lime-dim"
            >
              Solicitar diagnóstico
            </Link>
          </div>

          <button
            className="md:hidden text-off-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-steel/30 bg-black px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link href="#servicios" className="text-sm text-pale" onClick={() => setMobileOpen(false)}>
                Servicios
              </Link>
              <Link href="#como-funciona" className="text-sm text-pale" onClick={() => setMobileOpen(false)}>
                Cómo funciona
              </Link>
              <Link href="#equipo" className="text-sm text-pale" onClick={() => setMobileOpen(false)}>
                Equipo
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-lime px-4 py-2 text-center text-sm font-medium text-black"
                onClick={() => setMobileOpen(false)}
              >
                Solicitar diagnóstico
              </Link>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-steel/30 bg-smoke/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/dashboard" className="font-display text-lg font-800 tracking-tight text-off-white">
          CIRQLR
        </Link>
      </div>
    </nav>
  );
}
