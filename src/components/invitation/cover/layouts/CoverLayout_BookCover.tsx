"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: BookCover — Sampul buku eksklusif dengan spine di kiri
// Untuk Minimalist templates (blanc-studio, serenity-sky)
export const CoverLayout_BookCover: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${exitClass}`}
      style={{ background: c.background }}
    >
      <div className="relative w-full max-w-sm flex shadow-2xl" style={{ maxHeight: "90vh" }}>
        {/* Book Spine */}
        <div
          className="w-8 flex-shrink-0 flex flex-col items-center justify-between py-6 rounded-l-sm"
          style={{
            background: `linear-gradient(180deg, ${c.primary} 0%, ${c.secondary} 100%)`,
          }}
        >
          {/* Spine title vertical text */}
          <div
            className="text-[7px] uppercase tracking-[0.3em] font-bold rotate-90 whitespace-nowrap"
            style={{ color: c.cardBg, opacity: 0.8 }}
          >
            HariKita
          </div>
          <div
            className="text-[7px] uppercase tracking-[0.2em] rotate-90 whitespace-nowrap"
            style={{ color: c.cardBg, opacity: 0.5 }}
          >
            Wedding
          </div>
          {/* Spine ribbon */}
          <div
            className="w-1 h-6 rounded-full opacity-40"
            style={{ background: c.cardBg }}
          />
        </div>

        {/* Book Cover Content */}
        <div
          className="flex-1 flex flex-col px-7 py-8 text-center overflow-y-auto space-y-4 rounded-r-sm"
          style={{
            background: c.cardBg,
            border: `1px solid ${c.border}`,
            borderLeft: "none",
          }}
        >
          {/* Top decorative bar */}
          <div
            className="h-1.5 rounded-full w-16 mx-auto"
            style={{ background: `linear-gradient(to right, ${c.primary}, ${c.accent})` }}
          />

          {/* Event type */}
          <p className="text-[9px] uppercase tracking-[0.35em]" style={{ color: c.primary, opacity: 0.7 }}>
            Wedding Invitation
          </p>

          {/* Large serif names */}
          <div className="space-y-1 py-4 border-y" style={{ borderColor: c.border }}>
            <h1 className="text-3xl font-serif font-bold" style={{ color: c.text }}>
              {brideName}
            </h1>
            <p className="text-xl font-light" style={{ color: c.primary }}>&amp;</p>
            <h1 className="text-3xl font-serif font-bold" style={{ color: c.text }}>
              {groomName}
            </h1>
          </div>

          {/* Date */}
          <p className="text-[10px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.45 }}>
            {formattedDate}
          </p>

          {/* Guest */}
          <div
            className="p-3 rounded-xl space-y-1"
            style={{ background: `${c.background}80`, border: `1px solid ${c.border}` }}
          >
            <p className="text-[9px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.4 }}>
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <p className="font-serif text-sm font-semibold capitalize" style={{ color: c.primary }}>
              {guestName || "Tamu Undangan Terhormat"}
            </p>
            <p className="text-[8px] italic" style={{ color: c.text, opacity: 0.3 }}>
              *Mohon maaf apabila ada kesalahan penulisan nama/gelar
            </p>
          </div>

          {/* Bottom bar */}
          <div
            className="h-1.5 rounded-full w-16 mx-auto"
            style={{ background: `linear-gradient(to right, ${c.accent}, ${c.primary})` }}
          />

          {/* CTA */}
          <button
            id="btn-buka-undangan"
            onClick={onOpenClick}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
            style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
              color: "#fff",
            }}
          >
            <MailOpen className="w-4 h-4" />
            Buka Undangan
            <Heart className="w-3.5 h-3.5 fill-current opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
