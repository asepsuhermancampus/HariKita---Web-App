import React from "react";
import { SkeletonList } from "@/components/harikita/ui";

export default function UndanganLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6" aria-busy="true">
      <span className="sr-only">Memuat katalog undangan digital…</span>
      <div className="mb-8 space-y-3 text-center">
        <div className="hk-skeleton mx-auto h-7 w-72 max-w-full rounded-md" />
        <div className="hk-skeleton mx-auto h-4 w-96 max-w-full rounded-md" />
      </div>
      <SkeletonList count={3} />
    </div>
  );
}
