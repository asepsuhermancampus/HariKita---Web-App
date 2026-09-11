"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { AutumnLeafWreath, BotanicalPin } from "@/components/invitation/svg/autumnelle";
import { Sparkles } from "lucide-react";

export const AutumnelleHero: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  activeSession: DedicatedTemplateProps["sessions"]["s1"];
  theme: DedicatedTemplateProps["theme"];
  couplePhoto?: string;
}> = ({ bride, groom, activeSession, theme, couplePhoto }) => {
  const primaryColor = theme.colors.primary || "#5C6F57";
  const accentColor = theme.colors.accent || "#B85D3B";

  return (
    <section id="hero" className="relative min-h-[88vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12">
      {/* Signature Autumn Leaf Wreath with Initial Monogram */}
      <div className="relative inline-flex items-center justify-center w-[140px] h-[140px] mx-auto">
        <AutumnLeafWreath size={140} color={primaryColor} secondaryColor={accentColor} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-3xl font-serif font-bold tracking-wider"
            style={{ color: accentColor }}
          >
            {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Header Typography */}
      <div className="space-y-2.5 max-w-md mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-widest border"
          style={{
            backgroundColor: `${primaryColor}12`,
            borderColor: `${primaryColor}30`,
            color: primaryColor,
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
          <span>The Wedding of</span>
          <Sparkles className="w-3 h-3" style={{ color: accentColor }} />
        </div>
        <h1
          className="text-3xl sm:text-4xl font-serif font-bold tracking-wide leading-tight"
          style={{ color: theme.colors.text || "#261F23" }}
        >
          {bride.name} <span className="font-light" style={{ color: accentColor }}>&amp;</span> {groom.name}
        </h1>
        <p
          className="text-xs sm:text-sm font-serif italic leading-relaxed max-w-sm mx-auto"
          style={{ color: theme.colors.text ? `${theme.colors.text}B3` : "#524348" }}
        >
          &ldquo;Di antara tanda-tanda kebesaran-Nya diciptakan-Nya pasangan untukmu agar kamu merasa tenteram.&rdquo;
        </p>
      </div>

      {/* Polaroid Autumn Couple Photo (2 Orang Mempelai Pre-Wedding) */}
      <div className="relative p-2.5 bg-white shadow-xl rounded-2xl border border-stone-200/80 max-w-[280px] w-full mx-auto transition-transform duration-500 hover:scale-[1.01]">
        <img
          src={couplePhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"}
          alt={`Potret Pre-Wedding ${bride.name} & ${groom.name}`}
          className="w-full aspect-[4/5] object-cover object-top rounded-xl"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
          }}
        />
      </div>

      {/* Venue Pill */}
      <div
        className="inline-flex items-center gap-2 text-xs font-serif px-4 py-2 rounded-full border shadow-2xs"
        style={{
          backgroundColor: `${primaryColor}0D`,
          borderColor: `${primaryColor}30`,
          color: theme.colors.text || "#261F23",
        }}
      >
        <BotanicalPin size={16} color={primaryColor} />
        <span className="font-medium">{activeSession.venueName}</span>
      </div>
    </section>
  );
};
