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
          <span className="text-3xl font-serif font-bold text-amber-900 tracking-wider">
            {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Header Typography */}
      <div className="space-y-2 max-w-xs">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-widest bg-emerald-900/10 text-emerald-800 border border-emerald-800/20">
          <Sparkles className="w-3 h-3 text-amber-700" />
          <span>The Wedding of</span>
          <Sparkles className="w-3 h-3 text-amber-700" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide leading-tight text-emerald-950">
          {bride.name} <span className="font-light text-amber-700">&amp;</span> {groom.name}
        </h1>
        <p className="text-xs text-slate-600 font-serif italic leading-relaxed">
          &ldquo;Di antara tanda-tanda kebesaran-Nya diciptakan-Nya pasangan untukmu agar kamu merasa tenteram.&rdquo;
        </p>
      </div>

      {/* Polaroid Autumn Couple Photo (2 Orang Mempelai Pre-Wedding) */}
      <div className="relative p-3 bg-white shadow-xl rounded-2xl rotate-[-1deg] border border-amber-900/10 max-w-[270px] w-full transform hover:rotate-0 transition-transform duration-500">
        <img
          src={couplePhoto || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800"}
          alt={`Potret Pre-Wedding ${bride.name} & ${groom.name}`}
          className="w-full h-64 object-cover rounded-xl"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
          }}
        />
      </div>

      {/* Venue Pill */}
      <div className="inline-flex items-center gap-2 text-xs font-serif text-emerald-900 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200/80 shadow-2xs">
        <BotanicalPin size={16} color={primaryColor} />
        <span className="font-medium">{activeSession.venueName}</span>
      </div>
    </section>
  );
};
