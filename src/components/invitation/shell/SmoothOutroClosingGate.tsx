"use client";

import React from "react";
import { TemplateThemePreset } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { ArrowUp, Lock, Heart } from "lucide-react";

interface SmoothOutroClosingGateProps {
  theme: TemplateThemePreset;
  brideName?: string;
  groomName?: string;
  onCloseInvitation?: () => void;
}

export const SmoothOutroClosingGate: React.FC<SmoothOutroClosingGateProps> = ({
  theme,
  brideName = "Citra",
  groomName = "Bima",
  onCloseInvitation,
}) => {
  const isCelestial = theme.archetypeId === "celestial";
  const primaryColor = theme.colors.primary || "#7D424D";
  const accentColor = theme.colors.accent || "#C5A880";

  const handleScrollToTop = () => {
    soundscape.playTick();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleClose = () => {
    soundscape.playCoverOpen();
    if (onCloseInvitation) {
      onCloseInvitation();
    }
  };

  return (
    <div
      id="outro-closing-gate"
      className="relative w-full py-16 px-4 text-center overflow-hidden transition-colors"
      style={{
        backgroundColor: isCelestial ? "#0A0E1A" : theme.colors.background || "#FAF8F5",
        borderTop: `1px solid ${isCelestial ? "rgba(255,255,255,0.1)" : "rgba(197, 168, 128, 0.25)"}`,
      }}
    >
      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* Monogram Seal */}
        <div
          className="w-14 h-14 mx-auto rounded-full flex items-center justify-center font-serif font-bold text-lg shadow-sm border"
          style={{
            backgroundColor: isCelestial ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",
            borderColor: isCelestial ? "rgba(197, 168, 128, 0.4)" : "rgba(197, 168, 128, 0.45)",
            color: isCelestial ? "#F8FAFC" : "#4A2E35",
          }}
        >
          <span>{brideName.charAt(0)} &amp; {groomName.charAt(0)}</span>
        </div>

        {/* Sacred Concluding Message */}
        <div className="space-y-1.5">
          <h4
            className="font-serif text-xl sm:text-2xl font-bold"
            style={{ color: isCelestial ? "#F8FAFC" : "#4A2E35" }}
          >
            Sampai Jumpa di Hari Bahagia Kami
          </h4>
          <p
            className="text-xs font-serif leading-relaxed max-w-sm mx-auto"
            style={{ color: isCelestial ? "#94A3B8" : "#6B5E62" }}
          >
            Kehadiran dan doa restu Anda adalah kehormatan paling berharga bagi awal perjalanan suci hidup kami berdua.
          </p>
        </div>

        {/* Dignified Closure & Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Close Invitation (Protects user privacy) */}
          {onCloseInvitation && (
            <button
              id="btn-close-invitation-outro"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-bold tracking-wider shadow-sm hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: isCelestial ? "rgba(197, 168, 128, 0.25)" : "rgba(197, 168, 128, 0.2)",
                borderColor: isCelestial ? "rgba(197, 168, 128, 0.5)" : "rgba(197, 168, 128, 0.6)",
                borderWidth: "1px",
                color: isCelestial ? "#F8FAFC" : "#4A2E35",
              }}
            >
              <Lock className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>Tutup Undangan</span>
            </button>
          )}

          {/* Scroll to Top */}
          <button
            id="btn-scroll-top-outro"
            onClick={handleScrollToTop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-semibold border transition-all hover:bg-black/5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              borderColor: isCelestial ? "rgba(255,255,255,0.2)" : "rgba(197, 168, 128, 0.4)",
              color: isCelestial ? "#E2E8F0" : theme.colors.text || "#4A2E35",
            }}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke Awal</span>
          </button>
        </div>

        {/* Subtle Bottom Signoff */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-serif text-slate-400">
          <span>{brideName} &amp; {groomName}</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500/80" />
        </div>
      </div>
    </div>
  );
};
