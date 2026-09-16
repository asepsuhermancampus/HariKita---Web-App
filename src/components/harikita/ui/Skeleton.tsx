import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  /** Bentuk varian cepat. */
  variant?: "text" | "line" | "circle" | "card";
}

/**
 * Placeholder shimmer untuk state loading (Phase 7).
 * Menghormati prefers-reduced-motion via utility `.hk-skeleton`.
 */
export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const base = "hk-skeleton bg-hk-soft-beige/50";
  const variantClass = {
    text: "h-4 w-full rounded-md",
    line: "h-2.5 w-3/4 rounded-full",
    circle: "h-10 w-10 rounded-full",
    card: "h-40 w-full rounded-hk-xl",
  }[variant];

  return <div aria-hidden="true" className={cn(base, variantClass, className)} />;
}

export interface SkeletonListProps {
  count?: number;
  className?: string;
}

/** Rangkaian baris skeleton untuk daftar/kartu yang sedang dimuat. */
export function SkeletonList({ count = 3, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat konten…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-hk-lg border border-hk-champagne/30 bg-white/60 p-4"
        >
          <Skeleton variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="line" />
            <Skeleton variant="line" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
