"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

function isDarkBg(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

// Layout: GateDoors — Dua panel kembar terbuka seperti pintu gerbang keraton
// Digunakan oleh 4 Javanese templates (royal, umber, crimson, kebumen)
export const CoverLayout_GateDoors: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;
  const isDark = isDarkBg(c.background);
  const textOnDark = isDark;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${exitClass}`}
      style={{ background: c.background }}
    >
      {/* Batik pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='10' fill='none' stroke='${encodeURIComponent(c.accent)}' stroke-width='1'/%3E%3Ccircle cx='20' cy='20' r='5' fill='${encodeURIComponent(c.accent)}' opacity='0.5'/%3E%3Ccircle cx='0' cy='0' r='3' fill='${encodeURIComponent(c.accent)}' opacity='0.4'/%3E%3Ccircle cx='40' cy='0' r='3' fill='${encodeURIComponent(c.accent)}' opacity='0.4'/%3E%3Ccircle cx='0' cy='40' r='3' fill='${encodeURIComponent(c.accent)}' opacity='0.4'/%3E%3Ccircle cx='40' cy='40' r='3' fill='${encodeURIComponent(c.accent)}' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${c.accent}12 0%, transparent 70%)`,
        }}
      />

      {/* Central content panel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8 space-y-5 z-10">
        {/* Gold bar ornament top */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.accent})` }} />
          <svg width="24" height="24" viewBox="0 0 24 24" fill={c.accent} opacity={0.8}>
            <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z" />
          </svg>
          <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.accent})` }} />
        </div>

        {/* Label */}
        <p className="text-[10px] uppercase tracking-[0.3em] text-center" style={{ color: c.accent, opacity: 0.9 }}>
          Walimatul &apos;Ursy • The Wedding of
        </p>

        {/* Names */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold" style={{ color: c.text }}>
            {brideName}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <svg width="40" height="2"><line x1="0" y1="1" x2="40" y2="1" stroke={c.accent} strokeWidth="1" opacity="0.5" /></svg>
            <span className="text-3xl font-light" style={{ color: c.accent }}>&</span>
            <svg width="40" height="2"><line x1="0" y1="1" x2="40" y2="1" stroke={c.accent} strokeWidth="1" opacity="0.5" /></svg>
          </div>
          <h1 className="text-4xl font-serif font-bold" style={{ color: c.text }}>
            {groomName}
          </h1>
        </div>

        {/* Date */}
        <p className="text-[11px] uppercase tracking-widest text-center" style={{ color: c.text, opacity: 0.5 }}>
          {formattedDate}
        </p>

        {/* Guest Box */}
        <div
          className="w-full max-w-xs p-4 rounded-2xl text-center space-y-1"
          style={{
            background: textOnDark ? `${c.accent}12` : `${c.primary}08`,
            border: `1px solid ${c.accent}35`,
          }}
        >
          <p className="text-[10px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.55 }}>
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <p className="font-serif text-lg font-semibold capitalize" style={{ color: c.accent }}>
            {guestName || "Tamu Undangan Terhormat"}
          </p>
          <p className="text-[9px] italic" style={{ color: c.text, opacity: 0.35 }}>
            *Mohon maaf apabila ada kesalahan penulisan nama/gelar
          </p>
        </div>

        {/* Gold bar ornament bottom */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.accent})` }} />
          <span style={{ color: c.accent, opacity: 0.6 }}>✦</span>
          <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.accent})` }} />
        </div>

        {/* CTA */}
        <button
          id="btn-buka-undangan"
          onClick={onOpenClick}
          className="w-full max-w-xs flex items-center justify-center gap-2.5 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
          style={{
            background: `linear-gradient(135deg, ${c.accent}ee, ${c.primary}cc)`,
            color: isDark ? "#1E120D" : "#fff",
            boxShadow: `0 8px 30px ${c.accent}40`,
          }}
        >
          <MailOpen className="w-4 h-4" />
          Buka Undangan
          <Heart className="w-3.5 h-3.5 fill-current opacity-60" />
        </button>
      </div>

      {/* Decorative side panels (the "gate doors" visual frame) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-5 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${c.accent}40, transparent)`,
          borderRight: `1px solid ${c.accent}20`,
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${c.accent}40, transparent)`,
          borderLeft: `1px solid ${c.accent}20`,
        }}
      />
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-5 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${c.accent}40, transparent)` }}
      />
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${c.accent}40, transparent)` }}
      />
    </div>
  );
};
