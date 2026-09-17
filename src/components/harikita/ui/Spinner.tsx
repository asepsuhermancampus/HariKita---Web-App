import React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Label aksesibilitas untuk pembaca layar. */
  label?: string;
}

/**
 * Spinner indikator loading yang accessible.
 * Menggunakan aria-label + role="status" agar diumumkan ke assistive tech,
 * dan menghormati prefers-reduced-motion (lihat globals.css).
 */
export function Spinner({ size = "md", className, label = "Memuat…" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-9 w-9 border-[3px]",
  };

  return (
    <span role="status" aria-label={label} className="inline-flex items-center justify-center">
      <span
        aria-hidden="true"
        className={cn(
          "inline-block animate-spin rounded-full border-hk-champagne/40 border-t-hk-taupe motion-reduce:animate-none",
          sizeClasses[size],
          className
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
