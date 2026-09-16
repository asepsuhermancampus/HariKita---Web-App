"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/harikita/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Laporkan ke console untuk korelasi saat development; di produksi
    // error tracking (Sentry) akan menangkapnya pada Phase 10.
    console.error("[HariKita] Route error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Halaman gagal dimuat"
      description="Terjadi kendala saat memuat halaman ini. Data Anda tetap aman — silakan coba lagi."
      digest={error.digest}
      onReset={reset}
    />
  );
}
