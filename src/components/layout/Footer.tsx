"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HariKitaLogo } from "@/components/brand/HariKitaLogo";
import { ShieldCheck, MapPin, Heart, Phone } from "lucide-react";

export const Footer = () => {
  const pathname = usePathname();
  const isInvitationDetailPage =
    pathname && pathname.startsWith("/undangan/") && pathname !== "/undangan";
  const isDesignSystemShowcase = pathname === "/design-system-showcase";

  if (isInvitationDetailPage || isDesignSystemShowcase) {
    return null;
  }

  return (
    <footer className="bg-hk-charcoal text-white border-t border-hk-champagne/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="inline-block py-1">
              <HariKitaLogo variant="horizontal" tone="light" size="md" asLink={true} href="/" />
            </div>
            <p className="font-manrope text-sm text-white/75 leading-relaxed">
              Platform terkurasi lokal Kabupaten Kebumen untuk merangkai hari bahagia Pre-wedding, Lamaran, dan Pernikahan Intim dengan perlindungan Rekening Bersama (Escrow) terpercaya.
            </p>
            <div className="flex items-center gap-2 text-xs font-manrope text-hk-champagne">
              <MapPin className="w-4 h-4 text-hk-taupe shrink-0" />
              <span>Pilot Hyperlocal: Kabupaten Kebumen, Jawa Tengah</span>
            </div>
          </div>

          {/* Col 2: 11 Layanan Kebumen */}
          <div className="space-y-3">
            <h4 className="font-editorial text-hk-champagne text-lg font-normal tracking-wide">
              11 Kategori Layanan
            </h4>
            <ul className="font-manrope text-xs space-y-2 text-white/70">
              <li>• Pre-wedding Pantai Menganti &amp; Studio</li>
              <li>• Busana Pengantin &amp; 2x Sesi Fitting</li>
              <li>• Makeup Artist (MUA) Soft Glam &amp; Adat</li>
              <li>• Kotak Seserahan Akrilik Kayu Jati &amp; Mahar</li>
              <li>• Dokumentasi Foto-Video &amp; Teaser Reels</li>
              <li>• Dekorasi Pelaminan Intimate &amp; Florist</li>
            </ul>
          </div>

          {/* Col 3: Layanan Lanjutan */}
          <div className="space-y-3">
            <h4 className="font-editorial text-hk-champagne text-lg font-normal tracking-wide">
              Fasilitas Eksklusif
            </h4>
            <ul className="font-manrope text-xs space-y-2 text-white/70">
              <li>• Katering Rasa Boga &amp; Sample Test Food</li>
              <li>• Wedding Cake &amp; Sweet Dessert Corner</li>
              <li>• Souvenir Anyaman Pandan Gombong</li>
              <li>• Undangan Digital Interaktif (65+ Presets)</li>
              <li>• Ilustrasi Denah Lokasi Kartun + Barcode QR</li>
              <li>• Perlindungan Rekening Bersama (DP 30% / 70%)</li>
            </ul>
          </div>

          {/* Col 4: Kepercayaan & Kontak */}
          <div className="space-y-3">
            <h4 className="font-editorial text-hk-champagne text-lg font-normal tracking-wide">
              Pusat Bantuan &amp; Concierge
            </h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-hk-champagne/25 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-manrope font-semibold text-hk-champagne">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dana Aman di Rekening Bersama</span>
              </div>
              <p className="font-manrope text-[11px] text-white/75 leading-relaxed">
                DP 30% mengunci tanggal aman. Pelunasan 70% baru dicairkan setelah acara terselenggara sukses di Kebumen.
              </p>
              <a
                href="https://wa.me/6281234567890?text=Halo%20HariKita%20Kebumen%2C%20saya%20ingin%20konsultasi%20acara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-full bg-hk-taupe py-2 text-xs font-manrope font-bold text-white shadow-xs hover:bg-white hover:text-hk-charcoal transition-all mt-2"
              >
                <Phone className="w-3.5 h-3.5 mr-1" />
                <span>Konsultasi WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col gap-4">
          {/* Tautan Legal & Bantuan (SEO + internal linking) */}
          <nav aria-label="Tautan legal dan bantuan" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-manrope text-xs text-white/70">
            <Link href="/help" className="transition-colors hover:text-white">Bantuan &amp; FAQ</Link>
            <Link href="/contact" className="transition-colors hover:text-white">Hubungi Kami</Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-white">Kebijakan Privasi</Link>
            <Link href="/legal/terms" className="transition-colors hover:text-white">Syarat &amp; Ketentuan</Link>
            <Link href="/legal/cookies" className="transition-colors hover:text-white">Cookie</Link>
            <Link href="/legal/data-processing" className="transition-colors hover:text-white">Pemrosesan Data</Link>
          </nav>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-manrope text-white/50 gap-4">
            <p>© {new Date().getFullYear()} HariKita Kebumen. Seluruh hak cipta dilindungi.</p>
            <div className="flex items-center gap-1.5 text-white/60">
              <span>Dirangkai dengan</span>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>untuk keluarga tercinta di Kebumen</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
