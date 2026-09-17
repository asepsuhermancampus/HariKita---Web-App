"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: SplitPanelHorizontal — Editorial split: ornamen kiri, teks kanan
// Untuk Minimalist & Rose-Gold templates
export const CoverLayout_SplitPanel: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col sm:flex-row overflow-y-auto ${exitClass}`}
      style={{ background: c.background }}
    >
      {/* Left panel — decorative/ornament */}
      <div
        className="sm:w-2/5 h-28 sm:h-full flex-shrink-0 flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${c.primary}22, ${c.secondary}33)` }}
      >
        {/* Vertical text label */}
        <div
          className="hidden sm:block absolute -rotate-90 text-[9px] uppercase tracking-[0.4em] whitespace-nowrap font-medium"
          style={{ color: c.accent, opacity: 0.5, bottom: "5rem" }}
        >
          Undangan Pernikahan
        </div>

        {/* Monogram circle */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center border"
          style={{
            background: `${c.primary}20`,
            borderColor: `${c.accent}40`,
            boxShadow: `0 0 40px ${c.primary}20`,
          }}
        >
          <span className="font-serif text-3xl font-bold" style={{ color: c.primary }}>
            {brideName.charAt(0)}&amp;{groomName.charAt(0)}
          </span>
        </div>

        {/* Decorative vertical lines */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px hidden sm:block"
          style={{ background: `linear-gradient(to bottom, transparent, ${c.accent}40, transparent)` }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-px hidden sm:block"
          style={{ background: `${c.border}` }}
        />
      </div>

      {/* Right panel — text content */}
      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto px-8 py-6 text-center space-y-4">
        {/* Label */}
        <p className="text-[9px] uppercase tracking-[0.35em]" style={{ color: c.accent, opacity: 0.7 }}>
          The Wedding of
        </p>

        {/* Names */}
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold leading-tight" style={{ color: c.text }}>
            {brideName}
          </h1>
          <div className="flex items-center justify-center gap-3 py-0.5">
            <span className="h-px w-8" style={{ background: c.border }} />
            <span className="text-xl" style={{ color: c.accent }}>&amp;</span>
            <span className="h-px w-8" style={{ background: c.border }} />
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold leading-tight" style={{ color: c.text }}>
            {groomName}
          </h1>
        </div>

        {/* Date */}
        <div className="h-px w-full max-w-xs" style={{ background: c.border }} />
        <p className="text-[10px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.45 }}>
          {formattedDate}
        </p>
        <div className="h-px w-full max-w-xs" style={{ background: c.border }} />

        {/* Guest */}
        <div className="space-y-1 max-w-xs w-full">
          <p className="text-[9px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.4 }}>
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <p className="font-serif text-base font-semibold capitalize" style={{ color: c.primary }}>
            {guestName || "Tamu Undangan Terhormat"}
          </p>
          <p className="text-[8px] italic" style={{ color: c.text, opacity: 0.3 }}>
            *Mohon maaf apabila ada kesalahan penulisan nama/gelar
          </p>
        </div>

        {/* CTA */}
        <button
          id="btn-buka-undangan"
          onClick={onOpenClick}
          className="w-full max-w-xs flex items-center justify-center gap-2 py-3.5 font-bold text-xs uppercase tracking-[0.25em] transition-all hover:opacity-90 active:scale-[0.98] min-h-[48px]"
          style={{
            background: c.primary,
            color: c.background,
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
