import React from "react";
import { SkeletonList } from "@/components/harikita/ui";

/**
 * Root loading skeleton (Phase 7). Ditampilkan saat navigasi ke halaman
 * yang melakukan fetch/streaming data server-side.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true">
      <div className="mb-8 space-y-3">
        <div className="hk-skeleton h-7 w-64 rounded-md" />
        <div className="hk-skeleton h-4 w-96 max-w-full rounded-md" />
      </div>
      <SkeletonList count={4} />
    </div>
  );
}
