"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: FullBleedText — Teks raksasa tipis serif terpusat di full-screen background
// Untuk Minimalist & Celestial templates
export const CoverLayout_FullBleedText: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-8 py-8 text-center ${exitClass}`}
      style={{ background: c.background }}
    >
      {/* Horizontal rule top */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.border}, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${c.border}, transparent)` }} />

      {/* Corner marks - editorial grid feeling */}
      {[["top-6 left-6", "corner-tl"], ["top-6 right-6", "corner-tr"], ["bottom-6 left-6", "corner-bl"], ["bottom-6 right-6", "corner-br"]].map(([pos], i) => (
        <div key={i} className={`absolute ${pos} w-4 h-4 pointer-events-none`}>
          <div className="absolute top-0 left-0 w-full h-px" style={{ background: c.border }} />
          <div className="absolute top-0 left-0 w-px h-full" style={{ background: c.border }} />
        </div>
      ))}

      <div className="space-y-6 max-w-sm w-full">
        {/* Eyebrow label */}
        <p
          className="text-[9px] uppercase tracking-[0.4em] font-medium"
          style={{ color: c.text, opacity: 0.4 }}
        >
          Wedding Invitation
        </p>

        {/* Giant horizontal rule */}
        <div className="h-px w-full" style={{ background: c.border }} />

        {/* Names — editorial big type */}
        <div className="space-y-0">
          <h1
            className="text-5xl sm:text-6xl font-serif font-light leading-none tracking-tight"
            style={{ color: c.text }}
          >
            {brideName}
          </h1>
          <div className="flex items-center justify-center gap-4 py-1">
            <div className="h-px flex-1" style={{ background: c.border }} />
            <span
              className="text-2xl font-light"
              style={{ color: c.primary, opacity: 0.6 }}
            >
              &amp;
            </span>
            <div className="h-px flex-1" style={{ background: c.border }} />
          </div>
          <h1
            className="text-5xl sm:text-6xl font-serif font-light leading-none tracking-tight"
            style={{ color: c.text }}
          >
            {groomName}
          </h1>
        </div>

        {/* Horizontal rule */}
        <div className="h-px w-full" style={{ background: c.border }} />

        {/* Date */}
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: c.text, opacity: 0.5 }}>
          {formattedDate}
        </p>

        {/* Guest Box — minimal bordered */}
        <div className="py-3 px-4 text-center space-y-1" style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.4 }}>
            Kepada Yth.
          </p>
          <p className="text-base font-serif font-semibold capitalize" style={{ color: c.primary }}>
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
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-none font-bold text-xs uppercase tracking-[0.3em] transition-all hover:opacity-90 active:scale-[0.98] min-h-[48px] border"
          style={{
            background: c.primary,
            color: c.background,
            borderColor: c.primary,
          }}
        >
          <MailOpen className="w-4 h-4" />
          Buka Undangan
          <Heart className="w-3.5 h-3.5 fill-current opacity-60" />
        </button>
      </div>
    </div>
  );
};
