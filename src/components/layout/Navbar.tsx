"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
            CIRCULR
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

  return <AppNavbar />;
}

function AppNavbar() {
  const { user, profile } = useUser();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const dashboardHref = profile?.role === "admin" ? "/admin" : profile?.role === "consultant" ? "/consultant" : "/dashboard";

  return (
    <nav className="sticky top-0 z-40 border-b border-steel/30 bg-smoke/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href={dashboardHref} className="font-display text-lg font-800 tracking-tight text-off-white">
          CIRCULR
        </Link>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-pale transition-colors hover:text-off-white focus:outline-none"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-lime/20 text-xs text-lime">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block">
                {profile?.full_name || user.email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-smoke border-steel/30">
              <DropdownMenuItem disabled className="text-xs text-mid">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-steel/20" />
              <DropdownMenuItem
                onClick={() => router.push(dashboardHref)}
                className="flex items-center gap-2"
              >
                <User size={14} />
                Mi cuenta
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-steel/20" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 focus:text-red-400"
              >
                <LogOut size={14} />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
