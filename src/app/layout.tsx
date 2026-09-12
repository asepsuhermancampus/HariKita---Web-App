import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#4A2E35" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HariKita",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="harikita">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Cinzel:wght@400;600;700;900&family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-gold/30 selection:text-plum">
        <PwaRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallPrompt />
      </body>
    </html>
  );
}

