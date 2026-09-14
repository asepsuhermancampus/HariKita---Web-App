"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatingConciergeProps {
  phoneNumber?: string;
}

export function FloatingConcierge({
  phoneNumber = "6281234567890",
}: FloatingConciergeProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const defaultMessage = encodeURIComponent(
    "Halo Concierge HariKita Kebumen, saya ingin konsultasi seputar persiapan acara (Pre-wedding / Lamaran / Pernikahan Intim). Bisakah dibantu rekomendasi vendor & jadwal ketersediaannya?"
  );

  return (
    <aside
      aria-label="Layanan Bantuan WhatsApp Concierge Kebumen"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 animate-bounce-subtle"
    >
      {/* Main Action Pill */}
      <a
        href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Konsultasi langsung via WhatsApp Concierge Kebumen"
        className="group flex items-center gap-3 px-4 py-3 rounded-full bg-hk-charcoal text-white border border-hk-champagne/50 shadow-2xl hover:bg-[#20ba5a] hover:border-[#20ba5a] transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* WA Icon & Online Status Indicator */}
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        {/* Text */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] font-manrope font-bold text-hk-champagne uppercase tracking-widest leading-none group-hover:text-white/90">
            Concierge Kebumen
          </span>
          <span className="text-xs font-manrope font-semibold text-white mt-0.5 leading-none">
            Tanya Acara &amp; Jadwal
          </span>
        </div>

        {/* Mobile Short Label */}
        <span className="sm:hidden font-manrope text-xs font-semibold text-white">
          Tanya Concierge
        </span>
      </a>

      {/* Dismiss Button (for users who want full screen unobstructed) */}
      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Tutup tombol bantuan"
        className="w-7 h-7 rounded-full bg-white/80 border border-hk-champagne/40 text-hk-charcoal/60 hover:text-hk-charcoal hover:bg-white flex items-center justify-center shadow-xs transition-all text-xs"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
