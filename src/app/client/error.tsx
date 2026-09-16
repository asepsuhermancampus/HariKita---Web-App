"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/harikita/ui";

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HariKita] Portal klien error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Portal klien gagal dimuat"
      description="Kami tidak dapat memuat data pesanan/jadwal Anda saat ini. Silakan coba lagi."
      digest={error.digest}
      onReset={reset}
    />
  );
}
