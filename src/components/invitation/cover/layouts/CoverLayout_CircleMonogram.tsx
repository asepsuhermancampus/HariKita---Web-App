"use client";
import React, { useState, useEffect } from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Particle dot config — client-only to prevent SSR hydration mismatch
interface ParticleDot {
  width: string;
  height: string;
  opacity: number;
  left: string;
  top: string;
  animation: string;
  animationDelay: string;
}

// Layout: CircleMonogram — Lingkaran monogram besar berkilau, untuk Rose-Gold & Celestial
export const CoverLayout_CircleMonogram: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  // Client-only: particle dots rendered AFTER hydration to avoid SSR mismatch
  const [particles, setParticles] = useState<ParticleDot[] | null>(null);
  useEffect(() => {
    setParticles(
      [...Array(12)].map((_, i) => ({
        width: `${2 + Math.random() * 3}px`,
        height: `${2 + Math.random() * 3}px`,
        opacity: 0.15 + Math.random() * 0.25,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float-dot ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
        animationDelay: `${Math.random() * 2}s`,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 ${exitClass}`}
      style={{ background: c.background }}
    >
      {/* Floating particle dots — client-only, no SSR hydration mismatch */}
      {particles?.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.width,
            height: p.height,
            background: c.accent,
            opacity: p.opacity,
            left: p.left,
            top: p.top,
            animation: p.animation,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
      <style>{`
        @keyframes float-dot {
          from { transform: translateY(0px); }
          to   { transform: translateY(-12px); }
        }
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Large circle monogram */}
      <div className="relative mb-5">
        {/* Outer spinning ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1px dashed ${c.accent}50`,
            margin: "-12px",
            animation: "ring-spin 30s linear infinite",
          }}
        />
        {/* Main monogram circle */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-center shadow-2xl"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${c.primary}DD, ${c.secondary}BB)`,
            border: `2px solid ${c.accent}60`,
            boxShadow: `0 0 60px ${c.accent}30, 0 0 0 4px ${c.accent}15`,
          }}
        >
          <span
            className="font-serif text-3xl font-bold tracking-wider"
            style={{ color: c.accent, textShadow: `0 2px 8px ${c.accent}80` }}
          >
            {brideName.charAt(0)} &amp; {groomName.charAt(0)}
          </span>
        </div>
      </div>

      {/* Names */}
      <div className="text-center space-y-1 mb-4">
        <p
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{ color: c.accent, opacity: 0.8 }}
        >
          The Wedding Celebration of
        </p>
        <h1 className="text-3xl font-serif font-bold" style={{ color: c.text }}>
          {brideName}
          <span className="text-2xl font-light mx-2" style={{ color: c.accent }}>&amp;</span>
          {groomName}
        </h1>
        <p className="text-[11px] uppercase tracking-widest" style={{ color: c.text, opacity: 0.45 }}>
          {formattedDate}
        </p>
      </div>

      {/* Guest Box */}
      <div
        className="w-full max-w-xs p-4 rounded-2xl text-center space-y-1 mb-5"
        style={{
          background: `${c.cardBg}20`,
          backdropFilter: "blur(12px)",
          border: `1px solid ${c.accent}30`,
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

      {/* CTA */}
      <button
        id="btn-buka-undangan"
        onClick={onOpenClick}
        className="w-full max-w-xs flex items-center justify-center gap-2.5 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
        style={{
          background: `linear-gradient(135deg, ${c.accent}EE, ${c.primary}CC)`,
          color: "#110D10",
          boxShadow: `0 8px 30px ${c.accent}50`,
        }}
      >
        <MailOpen className="w-4 h-4" />
        Buka Undangan
        <Heart className="w-3.5 h-3.5 fill-current opacity-60" />
      </button>
    </div>
  );
};
