"use client";

import Link from "next/link";
import { Leaf, ShieldCheck, FileText, BookOpen, Award, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Leaf, ShieldCheck, FileText, BookOpen, Award,
};

interface ToolCardProps {
  slug: string;
  name: string;
  description: string;
  priceLabel: string;
  timeline: string;
  free: boolean;
  icon: string;
}

export function ToolCard({ slug, name, description, priceLabel, timeline, free, icon }: ToolCardProps) {
  const Icon = iconMap[icon] || Leaf;

  return (
    <div className={`flex flex-col rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md ${
      free ? "border-teal/30 bg-white ring-2 ring-teal/20" : "border-sand bg-white"
    }`}>
      {free && (
        <span className="mb-3 inline-flex w-fit rounded-full bg-teal-light px-3 py-1 text-xs font-medium text-teal">
          Gratis
        </span>
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft">
        <Icon size={20} className="text-coral" />
      </div>
      <h3 className="mt-4 font-display text-lg font-700 text-forest">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-mid">{description}</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-2xl font-800 text-forest">{priceLabel}</span>
        <span className="text-xs text-stone">{timeline}</span>
      </div>
      <Link
        href={`/tools/${slug}`}
        className={`mt-4 rounded-full px-4 py-2.5 text-center text-sm font-medium transition-all ${
          free
            ? "gradient-primary text-white hover:opacity-90 shadow-sm"
            : "border border-sand text-forest hover:bg-mist"
        }`}
      >
        {free ? "Calcular gratis" : "Empezar"}
      </Link>
    </div>
  );
}
