"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "client" | "consultant";
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
  { href: "/consultant/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "client" ? clientLinks : consultantLinks;

  return (
    <aside className="flex h-full w-60 flex-col border-r border-steel/30 bg-smoke">
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
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-pale transition-colors hover:bg-ash/50 hover:text-off-white"
        >
          <Settings size={18} />
          Configuración
        </Link>
      </div>
    </aside>
  );
}
