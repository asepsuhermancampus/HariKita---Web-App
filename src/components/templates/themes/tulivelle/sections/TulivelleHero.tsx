"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { TulipWreath, TulipPin } from "@/components/invitation/svg/tulivelle";
import { Heart } from "lucide-react";

export const TulivelleHero: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  activeSession: DedicatedTemplateProps["sessions"]["s1"];
  theme: DedicatedTemplateProps["theme"];
  couplePhoto?: string;
}> = ({ bride, groom, activeSession, theme, couplePhoto }) => {
  const primaryColor = theme.colors.primary || "#7A8C74";
  const accentColor = theme.colors.accent || "#D48B72";

  return (
    <section id="hero" className="relative min-h-[88vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12">
      {/* Signature Tulip Wreath with Initial Monogram */}
      <div className="relative inline-flex items-center justify-center w-[140px] h-[140px] mx-auto">
        <TulipWreath size={140} color={primaryColor} secondaryColor={accentColor} />
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
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}35`,
            color: accentColor,
          }}
        >
          <Heart className="w-3 h-3 fill-current" />
          <span>Tulivelle Blossom</span>
          <Heart className="w-3 h-3 fill-current" />
        </div>
        <h1
          className="text-3xl sm:text-4xl font-serif font-bold tracking-wide leading-tight"
          style={{ color: theme.colors.text || "#2B2428" }}
        >
          {bride.name} <span className="font-light" style={{ color: accentColor }}>&amp;</span> {groom.name}
        </h1>
        <p
          className="text-xs sm:text-sm font-serif italic leading-relaxed max-w-sm mx-auto"
          style={{ color: theme.colors.text ? `${theme.colors.text}B3` : "#6B5E62" }}
        >
          &ldquo;Cinta itu seperti bunga tulip yang mekar di musim semi, memberi kehangatan dan kebahagiaan abadi.&rdquo;
        </p>
      </div>

      {/* Curved Couple Hero Card (2 Orang Mempelai Pre-Wedding) */}
      <div className="relative p-2.5 bg-white shadow-xl rounded-[32px] border border-stone-200/80 max-w-[280px] w-full mx-auto transition-transform duration-500 hover:scale-[1.01]">
        <img
          src={couplePhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"}
          alt={`Potret Pre-Wedding ${bride.name} & ${groom.name}`}
          className="w-full aspect-[4/5] object-cover object-top rounded-[24px]"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
          }}
        />
      </div>

      {/* Venue Pill */}
      <div
        className="inline-flex items-center gap-2 text-xs font-serif px-4 py-2 rounded-full border shadow-2xs"
        style={{
          backgroundColor: `${accentColor}10`,
          borderColor: `${accentColor}30`,
          color: theme.colors.text || "#2B2428",
        }}
      >
        <TulipPin size={16} color={accentColor} />
        <span className="font-medium">{activeSession.venueName}</span>
      </div>
    </section>
  );
};
