"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

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
        className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-hk-charcoal text-white border border-hk-champagne/50 shadow-xl hover:bg-[#20ba5a] hover:border-[#20ba5a] transition-all duration-300 hover:scale-[1.02] active:scale-95"
      >
        {/* Logo Bulat WhatsApp Ditengahkan */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105">
            <svg
              className="w-3.5 h-3.5 fill-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.3-.777.978-.953 1.179-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.135-.135.301-.351.452-.527.15-.176.2-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.678-1.635-.929-2.239-.244-.588-.493-.509-.678-.518-.175-.009-.376-.01-.577-.01-.2 0-.527.075-.803.376s-1.054 1.029-1.054 2.509 1.079 2.91 1.23 3.111c.15.201 2.124 3.243 5.145 4.549.719.31 1.28.496 1.718.636.723.23 1.381.197 1.901.12.58-.087 1.78-.728 2.031-1.431.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.517 2 2.028 6.489 2.028 12.012c0 1.954.564 3.782 1.54 5.334L2 22l4.81-1.529a9.98 9.98 0 0 0 5.23 1.472h.004c5.522 0 10.012-4.489 10.012-10.012C22.056 6.489 17.562 2 12.04 2z" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[9px] font-manrope font-bold text-hk-champagne uppercase tracking-wider leading-tight group-hover:text-white/90">
            Concierge Kebumen
          </span>
          <span className="text-[11px] font-manrope font-semibold text-white leading-tight">
            Tanya Acara &amp; Jadwal
          </span>
        </div>

        {/* Mobile Short Label */}
        <span className="sm:hidden font-manrope text-[11px] font-semibold text-white">
          Tanya Concierge
        </span>
      </a>

      {/* Dismiss Button (for users who want full screen unobstructed) */}
      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Tutup tombol bantuan"
        className="w-6 h-6 rounded-full bg-white/80 border border-hk-champagne/40 text-hk-charcoal/60 hover:text-hk-charcoal hover:bg-white flex items-center justify-center shadow-xs transition-all text-xs"
      >
        <X className="w-3 h-3" />
      </button>
    </aside>
  );
}
