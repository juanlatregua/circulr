"use client";

import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";

interface ToolResultProps {
  title: string;
  children: React.ReactNode;
  pdfUrl?: string;
  upsell?: { text: string; href: string; price: string };
}

export function ToolResult({ title, children, pdfUrl, upsell }: ToolResultProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-700 text-forest">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>

      {pdfUrl && (
        <a
          href={pdfUrl}
          download
          className="flex items-center justify-center gap-2 gradient-primary rounded-full px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
        >
          <Download size={16} />
          Descargar PDF
        </a>
      )}

      {upsell && (
        <div className="rounded-2xl border border-teal/20 bg-teal-light p-6 text-center">
          <p className="text-sm text-forest font-medium">{upsell.text}</p>
          <Link
            href={upsell.href}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-teal hover:underline"
          >
            Desde {upsell.price}
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
