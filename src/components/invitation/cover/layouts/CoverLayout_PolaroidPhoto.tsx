"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: PolaroidPhoto — Frame foto instan Polaroid, untuk Cute-Illustrated (4 templates)
export const CoverLayout_PolaroidPhoto: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${exitClass}`}
      style={{ background: `linear-gradient(135deg, ${c.background} 0%, ${c.border}50 100%)` }}
    >
      {/* Scattered confetti dots */}
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            background: [c.primary, c.accent, c.secondary][i % 3],
            opacity: 0.25 + Math.random() * 0.2,
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random()})`,
          }}
        />
      ))}

      {/* Polaroid frame */}
      <div
        className="relative w-full max-w-xs flex flex-col items-center"
        style={{
          background: "#FFFFFF",
          borderRadius: "4px",
          padding: "16px 16px 40px 16px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.18), 0 6px 20px ${c.primary}20`,
          transform: "rotate(-1.5deg)",
        }}
      >
        {/* Photo area (placeholder floral pattern) */}
        <div
          className="w-full rounded-sm overflow-hidden relative"
          style={{
            height: "160px",
            background: `linear-gradient(135deg, ${c.primary}30, ${c.accent}25, ${c.secondary}20)`,
          }}
        >
          {/* Decorative couple silhouette */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div>
              <div className="text-5xl mb-1">💑</div>
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: c.primary, opacity: 0.7 }}>
                Momen Bahagia Kami
              </p>
            </div>
          </div>
          {/* Corner hearts */}
          <span className="absolute top-2 left-2 text-lg opacity-30" style={{ color: c.accent }}>♥</span>
          <span className="absolute top-2 right-2 text-lg opacity-30" style={{ color: c.accent }}>♥</span>
        </div>

        {/* Polaroid white space — text area */}
        <div className="w-full pt-4 text-center space-y-2">
          {/* Handwritten-style name */}
          <h1
            className="text-2xl font-bold"
            style={{
              color: c.primary,
              fontFamily: "'Dancing Script', cursive, serif",
              lineHeight: 1.2,
            }}
          >
            {brideName} &amp; {groomName}
          </h1>

          {/* Date like a photo caption */}
          <p className="text-[10px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.45 }}>
            {formattedDate}
          </p>

          {/* Guest */}
          <div
            className="text-center p-2 rounded-lg space-y-0.5 mt-1"
            style={{ background: `${c.primary}08`, border: `1px solid ${c.border}` }}
          >
            <p className="text-[8px] uppercase tracking-wider" style={{ color: c.text, opacity: 0.4 }}>
              Kepada:
            </p>
            <p className="text-sm font-semibold capitalize" style={{ color: c.primary }}>
              {guestName || "Tamu Undangan Terhormat"}
            </p>
          </div>

          {/* CTA */}
          <button
            id="btn-buka-undangan"
            onClick={onOpenClick}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px] mt-2"
            style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
              color: "#fff",
              boxShadow: `0 4px 16px ${c.primary}35`,
            }}
          >
            <MailOpen className="w-3.5 h-3.5" />
            Buka Undangan
            <Heart className="w-3 h-3 fill-current opacity-70" />
          </button>
        </div>

        {/* Tape sticker on top */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 opacity-50 rounded-sm"
          style={{ background: `${c.accent}60` }}
        />
      </div>
    </div>
  );
};
