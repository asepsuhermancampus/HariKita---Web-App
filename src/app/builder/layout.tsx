import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racik Paket Acara Anda",
  description:
    "Simulator mix-and-match HariKita: racik paket pre-wedding, lamaran, dan pernikahan dari vendor lokal Kebumen dengan estimasi harga real-time dan cek ketersediaan jadwal multi-vendor.",
  alternates: { canonical: "/builder" },
  openGraph: {
    title: "Racik Paket Acara Anda | HariKita",
    description:
      "Hitung estimasi biaya dan cek ketersediaan seluruh vendor pilihan Anda dalam satu tampilan.",
    url: "/builder",
  },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
