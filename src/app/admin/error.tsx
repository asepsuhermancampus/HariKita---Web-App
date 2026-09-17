"use client";

import React, { useEffect } from "react";
import { ErrorState } from "@/components/harikita/ui";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HariKita] Panel admin error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Panel admin gagal dimuat"
      description="Konsol administrasi tidak dapat dimuat saat ini. Silakan coba lagi."
      digest={error.digest}
      onReset={reset}
    />
  );
}
