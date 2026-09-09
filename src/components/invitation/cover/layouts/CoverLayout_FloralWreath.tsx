"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart, Sparkles } from "lucide-react";

// Shared luminance helper
function isDarkBg(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

// Layout: FloralWreath — Karangan bunga SVG melingkar, digunakan oleh 4 Botanical templates
export const CoverLayout_FloralWreath: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${exitClass}`}
      style={{ background: `linear-gradient(160deg, ${c.background} 0%, ${c.cardBg} 60%, ${c.border}40 100%)` }}
    >
      {/* Floating petals decorations */}
      {["10%,5%", "85%,8%", "5%,90%", "90%,85%", "50%,3%"].map((pos, i) => (
        <div
          key={i}
          className="absolute text-2xl select-none pointer-events-none animate-bounce"
          style={{
            left: pos.split(",")[0],
            top: pos.split(",")[1],
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2.5 + i * 0.3}s`,
            color: c.accent,
            opacity: 0.25 + i * 0.05,
          }}
        >
          {["🌿", "🌸", "🍃", "🌺", "✿"][i]}
        </div>
      ))}

      {/* Main Card */}
      <div
        className="relative w-full max-w-sm text-center"
        style={{
          background: `${c.cardBg}F0`,
          backdropFilter: "blur(20px)",
          border: `1.5px solid ${c.border}`,
          borderRadius: "28px",
          padding: "0",
          boxShadow: `0 25px 60px ${c.primary}25, 0 0 0 1px ${c.accent}20`,
        }}
      >
        {/* SVG Floral Wreath Header */}
        <div className="relative pt-6 pb-2 px-6">
          <svg viewBox="0 0 300 90" className="w-full" xmlns="http://www.w3.org/2000/svg">
            {/* Left branch */}
            <path d="M10,45 Q30,20 60,30 Q40,50 20,60 Z" fill={c.primary} opacity="0.35" />
            <path d="M5,55 Q25,35 45,40 Q30,58 10,65 Z" fill={c.accent} opacity="0.25" />
            <circle cx="55" cy="32" r="8" fill={c.accent} opacity="0.5" />
            <circle cx="65" cy="22" r="5" fill={c.primary} opacity="0.4" />
            <circle cx="45" cy="42" r="6" fill={c.secondary} opacity="0.35" />
            {/* Right branch (mirror) */}
            <path d="M290,45 Q270,20 240,30 Q260,50 280,60 Z" fill={c.primary} opacity="0.35" />
            <path d="M295,55 Q275,35 255,40 Q270,58 290,65 Z" fill={c.accent} opacity="0.25" />
            <circle cx="245" cy="32" r="8" fill={c.accent} opacity="0.5" />
            <circle cx="235" cy="22" r="5" fill={c.primary} opacity="0.4" />
            <circle cx="255" cy="42" r="6" fill={c.secondary} opacity="0.35" />
            {/* Top center small floral */}
            <circle cx="150" cy="12" r="10" fill={c.accent} opacity="0.3" />
            <circle cx="135" cy="18" r="6" fill={c.primary} opacity="0.25" />
            <circle cx="165" cy="18" r="6" fill={c.primary} opacity="0.25" />
            <path d="M120,30 Q150,5 180,30" fill="none" stroke={c.primary} strokeWidth="1.5" opacity="0.3" />
          </svg>
        </div>

        <div className="px-7 pb-7 space-y-4">
          {/* Tag */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold"
            style={{ background: `${c.accent}18`, color: c.primary, border: `1px solid ${c.accent}30` }}
          >
            <Sparkles className="w-3 h-3" />
            The Wedding Celebration
          </div>

          {/* Names */}
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold leading-tight" style={{ color: c.primary }}>
              {brideName}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8" style={{ background: `${c.accent}60` }} />
              <span className="text-2xl font-light italic" style={{ color: c.accent }}>&amp;</span>
              <span className="h-px w-8" style={{ background: `${c.accent}60` }} />
            </div>
            <h1 className="text-3xl font-serif font-bold leading-tight" style={{ color: c.primary }}>
              {groomName}
            </h1>
          </div>

          {/* Date */}
          <p className="text-[10px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.55 }}>
            {formattedDate}
          </p>

          {/* Guest Box */}
          <div
            className="p-3 rounded-2xl space-y-1"
            style={{ background: `${c.primary}08`, border: `1px solid ${c.border}` }}
          >
            <p className="text-[10px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.5 }}>
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <p className="font-serif text-base font-semibold capitalize" style={{ color: c.primary }}>
              {guestName || "Tamu Undangan Terhormat"}
            </p>
            <p className="text-[9px] italic" style={{ color: c.text, opacity: 0.4 }}>
              *Mohon maaf apabila ada kesalahan penulisan nama/gelar
            </p>
          </div>

          {/* CTA */}
          <button
            id="btn-buka-undangan"
            onClick={onOpenClick}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px] shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
              color: "#fff",
              boxShadow: `0 8px 25px ${c.primary}40`,
            }}
          >
            <MailOpen className="w-4 h-4" />
            Buka Undangan
            <Heart className="w-3.5 h-3.5 fill-current opacity-70" />
          </button>
        </div>

        {/* SVG Floral Footer */}
        <div className="px-6 pb-4">
          <svg viewBox="0 0 300 40" className="w-full opacity-60">
            <path d="M20,10 Q50,35 90,20 Q120,8 150,25 Q180,38 210,20 Q250,5 280,25" fill="none" stroke={c.primary} strokeWidth="1.2" opacity="0.4" />
            <circle cx="60" cy="24" r="4" fill={c.accent} opacity="0.4" />
            <circle cx="150" cy="25" r="4" fill={c.accent} opacity="0.4" />
            <circle cx="240" cy="20" r="4" fill={c.accent} opacity="0.4" />
          </svg>
        </div>
      </div>
    </div>
  );
};
