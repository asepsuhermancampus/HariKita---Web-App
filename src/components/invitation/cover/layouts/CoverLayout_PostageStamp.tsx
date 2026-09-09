"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: PostageStamp — Frame prangko vintage bergerigi untuk Rustic templates
export const CoverLayout_PostageStamp: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  // Generate serrated edge path for postage stamp effect
  const serratedPath = (width: number, perforSize: number = 10) => {
    const count = Math.floor(width / perforSize);
    let path = `M 0 0 `;
    for (let i = 0; i <= count; i++) {
      const x = i * perforSize;
      path += `L ${x} 0 `;
      if (i < count) {
        path += `Q ${x + perforSize * 0.3} ${-perforSize * 0.35} ${x + perforSize * 0.5} 0 `;
      }
    }
    return path;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${exitClass}`}
      style={{ background: c.background }}
    >
      {/* Linen texture pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${c.primary} 0, ${c.primary} 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, ${c.primary} 0, ${c.primary} 1px, transparent 1px, transparent 8px)`,
        }}
      />

      {/* Postage Stamp Card */}
      <div className="relative w-full max-w-sm">
        {/* Stamp body with serrated CSS border trick */}
        <div
          className="relative mx-auto"
          style={{
            background: "#fff",
            padding: "2px",
            boxShadow: `0 20px 60px ${c.primary}30`,
          }}
        >
          {/* Perforated border via radial-gradient */}
          <div
            className="relative p-6 text-center space-y-4"
            style={{
              background: c.cardBg,
              backgroundImage: `radial-gradient(circle, ${c.background} 3px, transparent 3px)`,
              backgroundSize: "12px 12px",
              backgroundPosition: "0 0",
              outline: `8px solid ${c.cardBg}`,
              boxShadow: `inset 0 0 0 2px ${c.border}, 0 0 0 10px ${c.background}`,
              borderRadius: "2px",
            }}
          >
            {/* Postmark circle (top right) */}
            <div
              className="absolute top-4 right-4 w-14 h-14 rounded-full border-2 flex items-center justify-center opacity-30 rotate-12"
              style={{ borderColor: c.primary }}
            >
              <div className="text-center">
                <div className="text-[6px] font-bold uppercase tracking-wide leading-tight" style={{ color: c.primary }}>
                  Kebumen
                </div>
                <div className="text-[5px] uppercase leading-tight" style={{ color: c.primary }}>
                  {new Date().getFullYear()}
                </div>
              </div>
            </div>

            {/* Top ornament leaves */}
            <div className="flex items-center justify-center gap-1 text-base select-none">
              <span style={{ color: c.accent, opacity: 0.6 }}>🌿</span>
              <span style={{ color: c.primary, opacity: 0.5 }}>✦</span>
              <span style={{ color: c.accent, opacity: 0.6 }}>🌿</span>
            </div>

            {/* Label */}
            <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: c.accent, opacity: 0.8 }}>
              Undangan Pernikahan
            </p>

            {/* Names */}
            <div className="space-y-1">
              <h1 className="text-2xl font-serif font-bold" style={{ color: c.text }}>
                {brideName}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-8" style={{ background: `${c.accent}50` }} />
                <span className="text-lg" style={{ color: c.accent }}>&</span>
                <span className="h-px w-8" style={{ background: `${c.accent}50` }} />
              </div>
              <h1 className="text-2xl font-serif font-bold" style={{ color: c.text }}>
                {groomName}
              </h1>
            </div>

            {/* Date */}
            <p className="text-[9px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.5 }}>
              {formattedDate}
            </p>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <span className="h-px flex-1" style={{ background: `${c.border}` }} />
              <span style={{ color: c.accent, opacity: 0.4 }} className="text-xs">✉</span>
              <span className="h-px flex-1" style={{ background: `${c.border}` }} />
            </div>

            {/* Guest Box */}
            <div className="space-y-1">
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

            {/* CTA */}
            <button
              id="btn-buka-undangan"
              onClick={onOpenClick}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
              style={{
                background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
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
    </div>
  );
};
