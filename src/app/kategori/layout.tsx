import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "11 Kategori Layanan Acara Kebumen",
  description:
    "Jelajahi 11 kategori layanan terpadu di Kabupaten Kebumen: pre-wedding, busana pengantin, MUA, seserahan, dokumentasi, dekorasi, katering, kue, souvenir, undangan digital, dan denah kartun.",
  alternates: { canonical: "/kategori" },
  openGraph: {
    title: "11 Kategori Layanan Acara Kebumen | HariKita",
    description:
      "Kurasi vendor lokal Kebumen untuk seluruh kebutuhan pre-wedding, lamaran, dan pernikahan intim Anda.",
    url: "/kategori",
  },
};

export default function KategoriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
