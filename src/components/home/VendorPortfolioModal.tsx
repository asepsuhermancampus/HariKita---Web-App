"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  MapPin,
  Sparkles,
  CheckCircle2,
  Calendar,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export interface VendorPortfolioData {
  id: string;
  title: string;
  vendor: string;
  district: string;
  price: string;
  desc: string;
  badge: string;
  highlights: string[];
  photos: {
    url: string;
    caption: string;
  }[];
}

interface VendorPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorPortfolioData | null;
}

export function VendorPortfolioModal({
  isOpen,
  onClose,
  vendor,
}: VendorPortfolioModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !vendor) return null;

  const waMessage = encodeURIComponent(
    `Halo ${vendor.vendor} via HariKita Kebumen, saya tertarik dengan layanan "${vendor.title}" (${vendor.price}). Apakah tanggal acara saya masih tersedia?`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-hk-charcoal/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-hk-champagne/60 shadow-2xl overflow-hidden z-10 my-8 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup pratinjau"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 border border-hk-champagne/60 text-hk-charcoal hover:bg-hk-taupe hover:text-white flex items-center justify-center transition-all shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Image Showcase */}
        <div className="relative h-64 sm:h-72 w-full bg-hk-charcoal">
          {vendor.photos[0] && (
            <Image
              src={vendor.photos[0].url}
              alt={vendor.photos[0].caption || vendor.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-manrope font-bold uppercase tracking-wider bg-hk-taupe text-white shadow-2xs">
              {vendor.badge}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-manrope font-semibold bg-white/90 text-hk-charcoal border border-hk-champagne/50 shadow-2xs flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-hk-taupe" />
              <span>{vendor.district}, Kebumen</span>
            </span>
          </div>

          {/* Bottom Title in Hero */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <span className="text-[11px] font-manrope uppercase tracking-widest text-hk-champagne font-bold block">
              Kurasi Vendor Terpercaya HariKita
            </span>
            <h3
              id="vendor-modal-title"
              className="font-editorial text-2xl sm:text-3xl font-bold leading-tight"
            >
              {vendor.title}
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-white/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-hk-champagne shrink-0" />
              <span className="font-semibold">{vendor.vendor}</span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Price & Summary */}
          <div className="p-4 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-manrope text-hk-charcoal/60 uppercase tracking-wider block font-semibold">
                Estimasi Biaya Paket
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-hk-charcoal">
                {vendor.price}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-manrope text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold">Proteksi Escrow 30%/70%</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-editorial text-lg font-bold text-hk-charcoal">
              Deskripsi Layanan &amp; Spesifikasi
            </h4>
            <p className="font-manrope text-xs sm:text-sm text-hk-charcoal/75 leading-relaxed">
              {vendor.desc}
            </p>
          </div>

          {/* Highlights & Inclusions */}
          <div className="space-y-3">
            <h4 className="font-editorial text-lg font-bold text-hk-charcoal">
              Termasuk Dalam Paket (Inclusions):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {vendor.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs font-manrope text-hk-charcoal/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-hk-taupe shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Previews (3 Thumbnails) */}
          {vendor.photos.length > 1 && (
            <div className="space-y-3">
              <h4 className="font-editorial text-lg font-bold text-hk-charcoal">
                Dokumentasi &amp; Portofolio Karya
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {vendor.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-4/3 rounded-xl overflow-hidden border border-hk-champagne/60 group bg-hk-ivory"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 33vw, 200px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[10px] text-white font-manrope font-medium line-clamp-1">
                        {photo.caption}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical Session / Location Note */}
          <div className="p-3.5 rounded-xl bg-hk-soft-beige/40 border border-hk-champagne/40 flex items-start gap-2.5 text-xs font-manrope text-hk-charcoal/80">
            <Calendar className="w-4 h-4 text-hk-taupe shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-hk-charcoal block">
                Kemudahan Sesi Fisik di Kebumen:
              </span>
              <span>
                Sesi konsultasi offline, pengukuran &amp; fitting busana, atau cicip test food dapat dijadwalkan langsung di studio/dapur mitra vendor wilayah {vendor.district}.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 sm:p-6 bg-hk-ivory/50 border-t border-hk-champagne/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`https://wa.me/6281234567890?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-hk-champagne/60 bg-white px-5 py-2.5 text-xs font-manrope font-semibold text-hk-charcoal hover:bg-hk-taupe hover:text-white transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Tanya Jadwal via WhatsApp</span>
          </a>

          <Link
            href={`/builder?cat=${vendor.id}`}
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-hk-taupe px-6 py-2.5 text-xs font-manrope font-bold text-white shadow-xs hover:bg-hk-charcoal transition-all"
          >
            <span>Pilih Layanan Ini ke Racikan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
