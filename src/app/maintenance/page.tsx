import type { Metadata } from "next";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Sedang Pemeliharaan",
  description: "HariKita sedang dalam pemeliharaan terjadwal.",
  robots: { index: false, follow: false },
};

/**
 * Halaman pemeliharaan (Phase 8). Dapat diarahkan ke sini via rewrite saat
 * maintenance, atau diakses manual di /maintenance.
 */
export default function MaintenancePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-hk-soft-beige/60 text-hk-taupe"
        aria-hidden="true"
      >
        <Wrench className="h-8 w-8" />
      </span>
      <h1 className="font-editorial text-2xl font-normal text-hk-charcoal sm:text-3xl">
        Kami Sedang Berbenah Sebentar
      </h1>
      <p className="max-w-md font-manrope text-sm leading-relaxed text-hk-charcoal/70">
        Platform HariKita sedang dalam pemeliharaan terjadwal untuk meningkatkan layanan. Silakan coba
        lagi beberapa saat lagi. Terima kasih atas kesabaran Anda.
      </p>
      <p className="font-manrope text-xs text-hk-charcoal/50">
        Butuh bantuan mendesak? Hubungi WhatsApp Concierge kami.
      </p>
    </div>
  );
}
