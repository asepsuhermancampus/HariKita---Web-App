"use client";
import React from "react";
import { CoverLayoutProps } from "../CoverCardEngine";
import { MailOpen, Heart } from "lucide-react";

// Layout: KawaiiCard — Kartu lucu dengan konfeti melayang dan emoji couple chibi
// Untuk Cute-Illustrated templates (marielle, manga, pastel-joy, cotton-candy)
export const CoverLayout_KawaiiCard: React.FC<CoverLayoutProps> = ({
  theme, brideName, groomName, guestName, formattedDate, exitClass, onOpenClick,
}) => {
  const c = theme.colors;

  const confettiItems = ["⭐", "✨", "💫", "🌟", "💖", "🎀", "🌸", "🎊", "🎉", "💕", "✿", "♡"];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden ${exitClass}`}
      style={{ background: `linear-gradient(135deg, ${c.background} 0%, ${c.border}40 50%, ${c.background} 100%)` }}
    >
      {/* Floating confetti characters */}
      {confettiItems.map((item, i) => (
        <div
          key={i}
          className="absolute select-none pointer-events-none text-lg"
          style={{
            left: `${8 + (i * 8.5) % 85}%`,
            top: `${5 + (i * 13.7) % 85}%`,
            opacity: 0.2 + (i % 4) * 0.08,
            animationName: "float-kawaii",
            animationDuration: `${3 + (i % 3) * 1.2}s`,
            animationDelay: `${i * 0.3}s`,
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationTimingFunction: "ease-in-out",
            color: [c.primary, c.accent, c.secondary][i % 3],
          }}
        >
          {item}
        </div>
      ))}
      <style>{`
        @keyframes float-kawaii {
          from { transform: translateY(0px) rotate(-5deg); }
          to   { transform: translateY(-15px) rotate(8deg); }
        }
        @keyframes bounce-couple {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>

      {/* Main card */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center"
        style={{
          background: `${c.cardBg}F8`,
          backdropFilter: "blur(16px)",
          border: `2px solid ${c.primary}30`,
          boxShadow: `0 20px 60px ${c.primary}25`,
        }}
      >
        {/* Top wavy banner */}
        <div
          className="relative w-full py-5 flex flex-col items-center gap-1"
          style={{
            background: `linear-gradient(135deg, ${c.primary}20, ${c.accent}20)`,
            borderBottom: `2px dashed ${c.primary}30`,
          }}
        >
          {/* Couple emoji */}
          <div
            className="text-6xl"
            style={{
              animationName: "bounce-couple",
              animationDuration: "2s",
              animationIterationCount: "infinite",
            }}
          >
            💑
          </div>
          <div
            className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
            style={{ background: `${c.accent}30`, color: c.primary }}
          >
            💌 Undangan Pernikahan 💌
          </div>
        </div>

        {/* Content */}
        <div className="px-7 py-6 space-y-4">
          {/* Names */}
          <div className="space-y-0.5">
            <h1
              className="text-3xl font-bold"
              style={{ color: c.primary, fontFamily: "'Nunito', 'Fredoka One', sans-serif" }}
            >
              {brideName}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span style={{ color: c.accent }} className="text-xl">🌸</span>
              <span className="text-2xl font-light" style={{ color: c.accent }}>&amp;</span>
              <span style={{ color: c.accent }} className="text-xl">🌸</span>
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ color: c.primary, fontFamily: "'Nunito', 'Fredoka One', sans-serif" }}
            >
              {groomName}
            </h1>
          </div>

          {/* Date */}
          <p className="text-[10px] font-medium" style={{ color: c.text, opacity: 0.5 }}>
            📅 {formattedDate}
          </p>

          {/* Guest box — bubble style */}
          <div
            className="p-3 rounded-2xl space-y-1"
            style={{ background: `${c.primary}0D`, border: `1.5px dashed ${c.primary}30` }}
          >
            <p className="text-[9px] font-medium" style={{ color: c.text, opacity: 0.45 }}>
              💌 Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
            <p
              className="text-base font-bold capitalize"
              style={{ color: c.primary, fontFamily: "'Nunito', sans-serif" }}
            >
              {guestName || "Tamu Undangan Terhormat"}
            </p>
            <p className="text-[8px] italic" style={{ color: c.text, opacity: 0.3 }}>
              *Mohon maaf apabila ada kesalahan penulisan nama/gelar
            </p>
          </div>

          {/* CTA — rounded cute button */}
          <button
            id="btn-buka-undangan"
            onClick={onOpenClick}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all hover:scale-[1.03] active:scale-[0.97] min-h-[48px]"
            style={{
              background: `linear-gradient(135deg, ${c.primary}, ${c.accent})`,
              color: "#fff",
              boxShadow: `0 6px 20px ${c.primary}40`,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <MailOpen className="w-4 h-4" />
            ✨ Buka Undangan ✨
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
