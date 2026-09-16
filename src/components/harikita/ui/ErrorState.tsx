"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Next.js error `digest` untuk korelasi log (opsional). */
  digest?: string;
  /** Callback `reset()` dari error boundary Next.js. */
  onReset?: () => void;
  /** Tampilkan tombol "Ke Beranda". */
  showHome?: boolean;
  className?: string;
}

/**
 * ErrorState presentational bersama (Phase 7) — dipakai oleh `error.tsx`,
 * `global-error.tsx`, dan `not-found.tsx` dengan pesan berbeda agar konsisten.
 * Fokus kelola diletakkan pada aksi utama; tombol ≥44px ramah sentuh.
 */
export function ErrorState({
  title = "Terjadi kendala teknis",
  description = "Maaf, halaman ini gagal dimuat. Silakan coba lagi atau kembali ke beranda.",
  digest,
  onReset,
  showHome = true,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center",
        className
      )}
    >
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500"
        aria-hidden="true"
      >
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="font-editorial text-2xl font-normal text-hk-charcoal sm:text-3xl">{title}</h1>
      <p className="max-w-md font-manrope text-sm leading-relaxed text-hk-charcoal/70">
        {description}
      </p>

      {digest && (
        <p className="font-mono text-[11px] text-hk-charcoal/40">
          Kode kesalahan: {digest}
        </p>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-hk-taupe px-6 py-3 font-manrope text-sm font-semibold text-white transition-colors hover:bg-[#78644e]"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </button>
        )}
        {showHome && (
          <Link
            href="/"
            className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-hk-champagne bg-white px-6 py-3 font-manrope text-sm font-semibold text-hk-taupe transition-colors hover:bg-hk-ivory"
          >
            <Home className="h-4 w-4" />
            Ke Beranda
          </Link>
        )}
      </div>
    </div>
  );
}
