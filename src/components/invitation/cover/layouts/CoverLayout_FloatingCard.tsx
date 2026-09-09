"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart, Sparkles } from "lucide-react";

// Layout: FloatingCard — Kartu mengapung premium di atas background
// Digunakan oleh Botanical (4) & Rustic (4) templates
export const CoverLayout_FloatingCard: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${exitClass}`}
      style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 50%, ${c.background} 0%, ${c.border}80 100%)`,
      }}
    >
      {/* Ornament corners */}
      <div className="absolute top-4 left-4 text-3xl select-none pointer-events-none" style={{ color: c.accent, opacity: 0.2 }}>✦</div>
      <div className="absolute top-4 right-4 text-3xl select-none pointer-events-none" style={{ color: c.accent, opacity: 0.2 }}>✦</div>
      <div className="absolute bottom-4 left-4 text-3xl select-none pointer-events-none" style={{ color: c.accent, opacity: 0.2 }}>✦</div>
      <div className="absolute bottom-4 right-4 text-3xl select-none pointer-events-none" style={{ color: c.accent, opacity: 0.2 }}>✦</div>

      {/* Main floating card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-8 text-center space-y-5"
        style={{
          background: `${c.cardBg}F5`,
          backdropFilter: "blur(20px)",
          border: `1.5px solid ${c.border}`,
          boxShadow: `0 30px 80px ${c.primary}20, 0 0 0 1px ${c.accent}10`,
        }}
      >
        {/* Top header tag */}
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold"
          style={{
            background: `${c.accent}15`,
            color: c.primary,
            border: `1px solid ${c.accent}30`,
          }}
        >
          <Sparkles className="w-3 h-3" />
          The Wedding Celebration
        </div>

        {/* Couple names */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight" style={{ color: c.primary }}>
            {brideName}
          </h1>
          <div className="flex items-center justify-center gap-3 py-0.5">
            <span className="h-px w-10" style={{ background: `${c.accent}50` }} />
            <span className="text-2xl font-light italic" style={{ color: c.accent }}>&amp;</span>
            <span className="h-px w-10" style={{ background: `${c.accent}50` }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight" style={{ color: c.primary }}>
            {groomName}
          </h1>
        </div>

        {/* Date */}
        <p className="text-[10px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.5 }}>
          {formattedDate}
        </p>

        {/* Guest recipient box */}
        <div
          className="p-4 rounded-2xl space-y-1"
          style={{
            background: `${c.background}CC`,
            border: `1px solid ${c.border}`,
          }}
        >
          <p className="text-[10px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.5 }}>
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <p className="font-serif text-lg font-bold capitalize" style={{ color: c.primary }}>
            {guestName || "Tamu Undangan Terhormat"}
          </p>
          <p className="text-[9px] italic" style={{ color: c.text, opacity: 0.35 }}>
            *Mohon maaf apabila ada kesalahan penulisan nama/gelar
          </p>
        </div>

        {/* CTA */}
        <div className="pt-1 flex flex-col items-center gap-2">
          <button
            id="btn-buka-undangan"
            onClick={onOpenClick}
            className="group w-full flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px] shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${c.accent}, ${c.primary})`,
              color: "#fff",
              boxShadow: `0 8px 25px ${c.accent}40`,
            }}
          >
            <MailOpen className="w-4 h-4" />
            Buka Undangan
            <Heart className="w-4 h-4 fill-current opacity-60" />
          </button>
          <span className="text-[10px]" style={{ color: c.text, opacity: 0.4 }}>
            Klik untuk membuka &amp; memutar musik
          </span>
        </div>
      </div>
    </div>
  );
};
