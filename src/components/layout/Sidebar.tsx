"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "client" | "consultant" | "admin";
}

const clientLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/projects", label: "Proyectos", icon: <FolderOpen size={18} /> },
  { href: "/dashboard/messages", label: "Mensajes", icon: <MessageSquare size={18} /> },
  { href: "/dashboard/billing", label: "Facturación", icon: <CreditCard size={18} /> },
];

const consultantLinks: SidebarLink[] = [
  { href: "/consultant", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/consultant/projects", label: "Proyectos", icon: <FolderOpen size={18} /> },
  { href: "/consultant/messages", label: "Mensajes", icon: <MessageSquare size={18} /> },
  { href: "/consultant/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
];

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/users", label: "Usuarios", icon: <Users size={18} /> },
  { href: "/admin/projects", label: "Proyectos", icon: <FolderOpen size={18} /> },
  { href: "/admin/billing", label: "Facturación", icon: <CreditCard size={18} /> },
];

function SidebarNav({ links, pathname, settingsHref }: { links: SidebarLink[]; pathname: string; settingsHref: string }) {
  return (
    <>
      <div className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-ash text-lime"
                  : "text-pale hover:bg-ash/50 hover:text-off-white"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-steel/30 p-3">
        <Link
          href={settingsHref}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === settingsHref
              ? "bg-ash text-lime"
              : "text-pale hover:bg-ash/50 hover:text-off-white"
          )}
        >
          <Settings size={18} />
          Configuración
        </Link>
      </div>
    </>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : role === "client" ? clientLinks : consultantLinks;
  const settingsHref = role === "admin" ? "/admin/settings" : role === "client" ? "/dashboard/settings" : "/consultant/settings";
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-full w-60 flex-col border-r border-steel/30 bg-smoke">
        <SidebarNav links={links} pathname={pathname} settingsHref={settingsHref} />
      </aside>

      {/* Mobile sidebar trigger + sheet */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-black shadow-lg">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-60 bg-smoke border-steel/30 p-0">
            <div className="flex h-full flex-col" onClick={() => setOpen(false)}>
              <div className="px-4 py-3 border-b border-steel/30">
                <Image src="/logo.svg" alt="CIRCULR" width={140} height={32} className="h-7 w-auto" />
              </div>
              <SidebarNav links={links} pathname={pathname} settingsHref={settingsHref} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
