"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page numbers: always show first, last, current, and neighbors
  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-pale transition-colors hover:bg-ash/50 hover:text-off-white disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span key={`e${i}`} className="px-1 text-xs text-mid">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition-colors",
              page === currentPage
                ? "bg-lime text-black font-medium"
                : "text-pale hover:bg-ash/50 hover:text-off-white"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-pale transition-colors hover:bg-ash/50 hover:text-off-white disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// Helper hook
export function usePagination<T>(items: T[], pageSize = 10) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  return { totalPages, pageSize };
}

export function paginate<T>(items: T[], page: number, pageSize = 10): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
