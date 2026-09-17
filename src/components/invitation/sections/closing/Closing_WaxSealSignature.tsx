"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { Heart, Lock, ArrowUp } from "lucide-react";

function isDarkColor(hex?: string): boolean {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  return false;
}

export const Closing_WaxSealSignature: React.FC<{
  brideName: string;
  groomName: string;
  theme: DedicatedTemplateProps["theme"];
  onCloseInvitation?: () => void;
}> = ({ brideName, groomName, theme, onCloseInvitation }) => {
  const primaryColor = theme?.colors?.primary || "#C5A880";
  const accentColor = theme?.colors?.accent || "#A3865E";
  const isDark = isDarkColor(theme?.colors?.background) || theme?.archetypeId === "celestial";

  const handleScrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      id="closing"
      className={`py-20 px-4 sm:px-6 relative overflow-hidden text-center transition-colors duration-300 border-t ${
        isDark
          ? "bg-stone-950 text-stone-200 border-stone-800"
          : "bg-white/80 backdrop-blur-md text-stone-800 border-stone-200/70"
      }`}
      style={{
        backgroundColor: isDark ? undefined : theme?.colors?.cardBg || "#FFFFFF",
      }}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Wax Seal Emblem */}
        <div
          className="w-16 h-16 mx-auto rounded-full shadow-2xl border-2 flex items-center justify-center text-xl font-serif font-bold transition-transform hover:scale-105"
          style={{
            background: "radial-gradient(circle at 35% 35%, #9E3544 0%, #7D2431 60%, #52151F 100%)",
            color: "#FFF5EA",
            borderColor: accentColor,
            boxShadow: "0 10px 25px -5px rgba(125, 36, 49, 0.4)",
          }}
        >
          <span>{brideName.charAt(0)}&amp;{groomName.charAt(0)}</span>
        </div>

        <div className="space-y-3">
          <span
            className="text-[11px] font-serif font-bold uppercase tracking-[0.25em] block"
            style={{ color: primaryColor }}
          >
            DENGAN PENUH RASA SYUKUR
          </span>
          <p
            className={`text-xs sm:text-sm leading-relaxed font-serif max-w-md mx-auto italic ${
              isDark ? "text-stone-300" : "text-stone-600"
            }`}
          >
            Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.
          </p>
        </div>

        {/* Digital Calligraphy Names */}
        <div
          className={`space-y-1.5 pt-6 border-t ${
            isDark ? "border-stone-800" : "border-stone-200/80"
          }`}
        >
          <span className={`text-xs font-serif ${isDark ? "text-stone-400" : "text-stone-500"}`}>
            Kami yang berbahagia,
          </span>
          <h3
            className="text-3xl sm:text-4xl font-serif font-bold tracking-wide"
            style={{ color: isDark ? "#FDE68A" : theme?.colors?.text || "#261F23" }}
          >
            {brideName} &amp; {groomName}
          </h3>
          <p className={`text-xs font-serif ${isDark ? "text-stone-400" : "text-stone-500"}`}>
            Beserta segenap keluarga besar
          </p>
        </div>

        <div
          className={`flex items-center justify-center gap-1.5 text-xs font-serif pt-1 ${
            isDark ? "text-stone-400" : "text-stone-500"
          }`}
        >
          <span>Doa Restu Anda Adalah Kehormatan Terindah Bagi Kami</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>

        {/* Combined Action Buttons: Tutup Undangan & Kembali ke Awal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {onCloseInvitation && (
            <button
              id="btn-close-invitation-outro"
              onClick={onCloseInvitation}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-bold tracking-wider shadow-sm hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                isDark
                  ? "bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/40 text-amber-200"
                  : "hover:shadow-md"
              }`}
              style={
                !isDark
                  ? {
                      backgroundColor: `${primaryColor}15`,
                      borderColor: `${primaryColor}40`,
                      color: primaryColor,
                    }
                  : undefined
              }
            >
              <Lock className="w-3.5 h-3.5" style={{ color: isDark ? "#FBBF24" : primaryColor }} />
              <span>Tutup Undangan</span>
            </button>
          )}

          <button
            id="btn-scroll-top-outro"
            onClick={handleScrollToTop}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              isDark
                ? "border-stone-700 text-stone-300 hover:bg-stone-800"
                : "border-stone-300 text-stone-700 hover:bg-stone-100/80"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke Awal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
