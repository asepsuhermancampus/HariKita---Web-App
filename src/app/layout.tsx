import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "HariKita - Platform Event Lamaran & Pernikahan Hyperlocal Kebumen",
  description:
    "Rangkai hari bahagiamu di Kebumen. Kurasi 11 kategori layanan terpadu: busana, MUA, dekorasi, katering, foto-video, dan website undangan digital eksklusif dengan proteksi rekening bersama.",
  keywords: [
    "wedding kebumen",
    "pernikahan kebumen",
    "undangan digital kebumen",
    "sewa busana kebumen",
    "katering kebumen",
    "mua kebumen",
    "prewedding pantai menganti",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="harikita">
      <body className="min-h-screen flex flex-col antialiased selection:bg-gold/30 selection:text-plum">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
