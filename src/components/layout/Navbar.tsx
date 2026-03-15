"use client";

import Link from "next/link";
import Image from "next/image";
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-sand/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo-dark.svg" alt="CIRCULR" width={180} height={40} priority className="h-8 w-auto" />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#servicios" className="text-sm text-mid transition-colors hover:text-forest">
              Servicios
            </Link>
            <Link href="#como-funciona" className="text-sm text-mid transition-colors hover:text-forest">
              Cómo funciona
            </Link>
            <Link href="#equipo" className="text-sm text-mid transition-colors hover:text-forest">
              Equipo
            </Link>
            <Link href="/tools" className="text-sm text-mid transition-colors hover:text-forest">
              Herramientas
            </Link>
            <Link href="/blog" className="text-sm text-mid transition-colors hover:text-forest">
              Blog
            </Link>
            <Link
              href="/auth/register"
              className="gradient-primary rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Empezar ahora
            </Link>
          </div>

          <button
            className="md:hidden text-forest"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-sand/60 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link href="#servicios" className="text-sm text-mid" onClick={() => setMobileOpen(false)}>
                Servicios
              </Link>
              <Link href="#como-funciona" className="text-sm text-mid" onClick={() => setMobileOpen(false)}>
                Cómo funciona
              </Link>
              <Link href="#equipo" className="text-sm text-mid" onClick={() => setMobileOpen(false)}>
                Equipo
              </Link>
              <Link href="/tools" className="text-sm text-mid" onClick={() => setMobileOpen(false)}>
                Herramientas
              </Link>
              <Link href="/blog" className="text-sm text-mid" onClick={() => setMobileOpen(false)}>
                Blog
              </Link>
              <Link
                href="/auth/register"
                className="gradient-primary rounded-full px-4 py-2 text-center text-sm font-medium text-white"
                onClick={() => setMobileOpen(false)}
              >
                Empezar ahora
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
    <nav className="sticky top-0 z-40 border-b border-sand bg-white/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href={dashboardHref} className="flex items-center">
          <Image src="/logo-icon.svg" alt="CIRCULR" width={36} height={36} className="h-8 w-8" />
          <span className="ml-2 font-display text-lg font-800 tracking-tight text-forest hidden sm:block">CIRCULR</span>
        </Link>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-mid transition-colors hover:text-forest focus:outline-none"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-coral-soft text-xs text-coral">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block">
                {profile?.full_name || user.email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-sand">
              <DropdownMenuItem disabled className="text-xs text-mid">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-sand" />
              <DropdownMenuItem
                onClick={() => router.push(dashboardHref)}
                className="flex items-center gap-2"
              >
                <User size={14} />
                Mi cuenta
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-sand" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-danger focus:text-danger"
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
