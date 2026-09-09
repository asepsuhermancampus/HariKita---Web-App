"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: IslamicArch — Gapura Maroko tapal kuda, digunakan oleh semua 8 Islamic template
export const CoverLayout_IslamicArch: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;
  const isDark = isDarkBg(c.background);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-none ${exitClass}`}
      style={{ background: c.background }}
    >
      {/* Background Arabesque Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 L55 20 L55 40 L30 55 L5 40 L5 20 Z' fill='none' stroke='${encodeURIComponent(c.accent)}' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='${encodeURIComponent(c.accent)}' stroke-width='0.8'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Arch Frame SVG */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Islamic Arch SVG at top */}
        <svg viewBox="0 0 320 80" className="w-full" style={{ marginBottom: "-2px" }}>
          <path
            d="M0,80 L0,40 Q0,0 160,0 Q320,0 320,40 L320,80 Z"
            fill={c.cardBg}
          />
          {/* Decorative arch details */}
          <path
            d="M20,80 L20,42 Q20,20 160,20 Q300,20 300,42 L300,80"
            fill="none"
            stroke={c.accent}
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Moon & Star */}
          <circle cx="160" cy="12" r="6" fill={c.accent} opacity="0.9" />
          <polygon
            points="160,4 162,10 168,10 163,14 165,20 160,16 155,20 157,14 152,10 158,10"
            fill={c.accent}
            opacity="0.5"
            transform="translate(10, -2) scale(0.6)"
          />
        </svg>

        {/* Main Card Body */}
        <div
          className="relative px-8 pb-8 pt-4 text-center space-y-5 shadow-2xl"
          style={{ background: c.cardBg, border: `1px solid ${c.border}`, borderTop: "none" }}
        >
          {/* Arabic Bismillah-style header */}
          <div
            className="text-xs uppercase tracking-[0.25em] font-medium"
            style={{ color: c.accent }}
          >
            ﷽ بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-2">
            <span className="h-px flex-1" style={{ background: `${c.accent}60` }} />
            <span style={{ color: c.accent }} className="text-sm">✦</span>
            <span className="h-px flex-1" style={{ background: `${c.accent}60` }} />
          </div>

          {/* Sub-label */}
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: c.accent, opacity: 0.8 }}>
            Walimatul &apos;Ursy • The Wedding of
          </p>

          {/* Couple Names */}
          <div className="space-y-0.5">
            <h1 className="text-3xl font-serif font-bold leading-tight" style={{ color: c.text }}>
              {brideName}
            </h1>
            <p className="text-2xl font-light" style={{ color: c.accent }}>&amp;</p>
            <h1 className="text-3xl font-serif font-bold leading-tight" style={{ color: c.text }}>
              {groomName}
            </h1>
          </div>

          {/* Date */}
          <p className="text-[11px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.6 }}>
            {formattedDate}
          </p>

          {/* Guest Box */}
          <div
            className="p-3 rounded-xl text-center space-y-1"
            style={{ background: `${c.accent}10`, border: `1px solid ${c.accent}30` }}
          >
            <p className="text-[10px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.6 }}>
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <p className="text-base font-serif font-semibold capitalize" style={{ color: c.accent }}>
              {guestName || "Tamu Undangan Terhormat"}
            </p>
            <p className="text-[9px] italic" style={{ color: c.text, opacity: 0.45 }}>
              *Mohon maaf apabila ada kesalahan penulisan nama/gelar
            </p>
          </div>

          {/* CTA Button */}
          <button
            id="btn-buka-undangan"
            onClick={onOpenClick}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px] shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
              color: isDark ? "#FAF7F2" : "#fff",
            }}
          >
            <MailOpen className="w-4 h-4" />
            Buka Undangan
            <Heart className="w-3.5 h-3.5 fill-current opacity-60" />
          </button>
        </div>

        {/* Arch SVG at bottom (mirror) */}
        <svg viewBox="0 0 320 40" className="w-full" style={{ marginTop: "-2px" }}>
          <path d="M0,0 L320,0 L320,10 Q160,40 0,10 Z" fill={c.cardBg} />
          <path d="M0,0 L320,0 L320,12 Q160,45 0,12" fill="none" stroke={c.accent} strokeWidth="1.5" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
};

function isDarkBg(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
