import React from "react";
import { SkeletonList } from "@/components/harikita/ui";

export default function KategoriLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true">
      <span className="sr-only">Memuat kategori layanan…</span>
      <div className="mb-8 space-y-3">
        <div className="hk-skeleton h-7 w-56 rounded-md" />
        <div className="hk-skeleton h-4 w-80 max-w-full rounded-md" />
      </div>
      <SkeletonList count={5} />
    </div>
  );
}
