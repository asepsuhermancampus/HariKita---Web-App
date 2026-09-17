"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/harikita/ui";

export default function VendorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HariKita] Portal vendor error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Portal mitra gagal dimuat"
      description="Data paket, kalender, atau dompet Anda tidak dapat dimuat saat ini. Silakan coba lagi."
      digest={error.digest}
      onReset={reset}
    />
  );
}
