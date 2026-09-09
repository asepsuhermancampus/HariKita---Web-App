"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: ScrollUnroll — Gulungan kertas dengan motif wayang/batik
// Digunakan oleh 4 Javanese templates (azurite, ivory, golden, pearl)
export const CoverLayout_ScrollUnroll: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${exitClass}`}
      style={{ background: c.background }}
    >
      {/* Background shimmer radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${c.accent}0A 0%, transparent 70%)` }}
      />

      {/* Scroll container */}
      <div className="relative w-full max-w-sm">
        {/* Top scroll rod */}
        <div
          className="relative w-full h-8 rounded-full flex items-center shadow-xl"
          style={{
            background: `linear-gradient(180deg, ${c.accent}CC 0%, ${c.primary} 50%, ${c.accent}99 100%)`,
          }}
        >
          {/* Left knob */}
          <div className="absolute -left-3 w-8 h-8 rounded-full shadow-lg"
            style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.primary})` }} />
          {/* Right knob */}
          <div className="absolute -right-3 w-8 h-8 rounded-full shadow-lg"
            style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.primary})` }} />
          {/* Rod shine */}
          <div className="absolute inset-x-4 top-1 h-2 rounded-full opacity-40"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)" }} />
        </div>

        {/* Scroll paper body */}
        <div
          className="relative px-8 py-7 text-center space-y-4 shadow-2xl"
          style={{
            background: `linear-gradient(180deg, ${c.cardBg}FA 0%, ${c.cardBg}FF 100%)`,
            border: `1px solid ${c.border}`,
            borderTop: "none",
            borderBottom: "none",
          }}
        >
          {/* Wayang-inspired top ornament */}
          <div className="flex items-center justify-center gap-2">
            <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.accent}60)` }} />
            <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
              <path d="M16 2 C8 2 2 8 2 10 C2 12 8 18 16 18 C24 18 30 12 30 10 C30 8 24 2 16 2 Z"
                fill={c.accent} opacity="0.4" />
              <path d="M16 6 C12 6 10 8 10 10 C10 12 12 14 16 14 C20 14 22 12 22 10 C22 8 20 6 16 6 Z"
                fill={c.accent} opacity="0.6" />
            </svg>
            <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.accent}60)` }} />
          </div>

          {/* Label */}
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: c.accent, opacity: 0.85 }}>
            Walimatul &apos;Ursy • The Wedding of
          </p>

          {/* Names */}
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold" style={{ color: c.text }}>
              {brideName}
            </h1>
            <p className="text-2xl font-light italic" style={{ color: c.accent }}>&</p>
            <h1 className="text-3xl font-serif font-bold" style={{ color: c.text }}>
              {groomName}
            </h1>
          </div>

          {/* Date */}
          <p className="text-[10px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.5 }}>
            {formattedDate}
          </p>

          {/* Bottom divider */}
          <div className="flex items-center gap-2">
            <span className="h-px flex-1" style={{ background: `${c.accent}40` }} />
            <span style={{ color: c.accent, opacity: 0.5 }} className="text-xs">✦ ✦ ✦</span>
            <span className="h-px flex-1" style={{ background: `${c.accent}40` }} />
          </div>

          {/* Guest Box */}
          <div
            className="p-3 rounded-xl text-center space-y-1"
            style={{ background: `${c.accent}08`, border: `1px solid ${c.border}` }}
          >
            <p className="text-[10px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.5 }}>
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <p className="font-serif text-base font-semibold capitalize" style={{ color: c.accent }}>
              {guestName || "Tamu Undangan Terhormat"}
            </p>
            <p className="text-[9px] italic" style={{ color: c.text, opacity: 0.35 }}>
              *Mohon maaf apabila ada kesalahan penulisan nama/gelar
            </p>
          </div>

          {/* CTA */}
          <button
            id="btn-buka-undangan"
            onClick={onOpenClick}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
            style={{
              background: `linear-gradient(135deg, ${c.accent}EE, ${c.secondary})`,
              color: "#1A0D00",
              boxShadow: `0 8px 25px ${c.accent}40`,
            }}
          >
            <MailOpen className="w-4 h-4" />
            Buka Undangan
            <Heart className="w-3.5 h-3.5 fill-current opacity-60" />
          </button>
        </div>

        {/* Bottom scroll rod */}
        <div
          className="relative w-full h-8 rounded-full flex items-center shadow-xl"
          style={{
            background: `linear-gradient(180deg, ${c.accent}99 0%, ${c.primary} 50%, ${c.accent}CC 100%)`,
          }}
        >
          <div className="absolute -left-3 w-8 h-8 rounded-full shadow-lg"
            style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.primary})` }} />
          <div className="absolute -right-3 w-8 h-8 rounded-full shadow-lg"
            style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.primary})` }} />
          <div className="absolute inset-x-4 top-1 h-2 rounded-full opacity-30"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)" }} />
        </div>
      </div>
    </div>
  );
};
