import React from "react";
import Link from "next/link";
import { LogoBadge } from "./LogoBadge";
import { ShieldCheck, MapPin, Heart, Phone, Sparkles } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-plum-dark text-canvas-subtle border-t border-gold/30 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="bg-canvas/10 p-2.5 rounded-xl inline-block border border-gold/30">
              <LogoBadge showTagline={false} />
            </div>
            <p className="text-sm text-canvas/80 leading-relaxed">
              Platform terkurasi lokal Kabupaten Kebumen untuk merangkai hari bahagia Pre-wedding, Lamaran, dan Pernikahan Intim dengan perlindungan Rekening Bersama (Escrow) terpercaya.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-light">
              <MapPin className="w-4 h-4 text-gold" />
              <span>Pilot Hyperlocal: Kabupaten Kebumen, Jawa Tengah</span>
            </div>
          </div>

          {/* Col 2: 11 Layanan Kebumen */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-gold-light text-base font-semibold tracking-wide">
              11 Kategori Layanan
            </h4>
            <ul className="text-xs space-y-2 text-canvas/70">
              <li>• Pre-wedding Pantai Menganti & Studio</li>
              <li>• Busana Pengantin & 2x Sesi Fitting</li>
              <li>• Makeup Artist (MUA) Soft Glam & Adat</li>
              <li>• Kotak Seserahan Akrilik Kayu Jati & Mahar</li>
              <li>• Dokumentasi Foto-Video & Teaser Reels</li>
              <li>• Dekorasi Pelaminan Intimate & Florist</li>
            </ul>
          </div>

          {/* Col 3: Layanan Lanjutan */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-gold-light text-base font-semibold tracking-wide">
              Fasilitas Eksklusif
            </h4>
            <ul className="text-xs space-y-2 text-canvas/70">
              <li>• Katering Rasa Boga & Sample Test Food</li>
              <li>• Wedding Cake & Sweet Dessert Corner</li>
              <li>• Souvenir Anyaman Pandan Gombong</li>
              <li>• Undangan Digital Interaktif (65+ Presets)</li>
              <li>• Ilustrasi Denah Lokasi Kartun + Barcode QR</li>
              <li>• Perlindungan Rekening Bersama (DP 30% / 70%)</li>
            </ul>
          </div>

          {/* Col 4: Kepercayaan & Kontak */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-gold-light text-base font-semibold tracking-wide">
              Pusat Bantuan & Concierge
            </h4>
            <div className="p-3.5 rounded-xl bg-canvas/5 border border-gold/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-light">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Dana Aman di Rekening Bersama</span>
              </div>
              <p className="text-[11px] text-canvas/70 leading-normal">
                DP 30% mengunci tanggal aman. Pelunasan 70% baru dicairkan setelah acara terselenggara sukses di Kebumen.
              </p>
              <a
                href="https://wa.me/6281234567890?text=Halo%20HariKita%20Kebumen%2C%20saya%20ingin%20konsultasi%20acara"
                target="_blank"
                rel="noreferrer"
                className="btn btn-xs w-full gold-gradient-bg text-plum-dark font-bold mt-2"
              >
                <Phone className="w-3.5 h-3.5 mr-1" />
                Konsultasi WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-canvas/50 gap-4">
          <p>© {new Date().getFullYear()} HariKita Kebumen. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-1 text-canvas/60">
            <span>Dirangkai dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>untuk keluarga tercinta di Kebumen</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
