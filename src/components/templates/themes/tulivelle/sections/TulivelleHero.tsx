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
}> = ({ bride, groom, activeSession, theme }) => {
  const primaryColor = theme.colors.primary || "#7A8C74";
  const accentColor = theme.colors.accent || "#D48B72";

  return (
    <section id="hero" className="relative min-h-[88vh] flex flex-col items-center justify-center p-6 text-center space-y-6 pt-12">
      {/* Signature Tulip Wreath with Initial Monogram */}
      <div className="relative inline-flex items-center justify-center w-[140px] h-[140px] mx-auto">
        <TulipWreath size={140} color={primaryColor} secondaryColor={accentColor} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl font-serif font-bold text-rose-950 tracking-wider">
            {bride.name.charAt(0)} &amp; {groom.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Header Typography */}
      <div className="space-y-2 max-w-xs">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-widest bg-rose-100/60 text-rose-900 border border-rose-300/40">
          <Heart className="w-3 h-3 text-rose-600 fill-rose-600" />
          <span>Tulivelle Blossom</span>
          <Heart className="w-3 h-3 text-rose-600 fill-rose-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide leading-tight text-rose-950">
          {bride.name} <span className="font-light text-rose-700">&amp;</span> {groom.name}
        </h1>
        <p className="text-xs text-slate-600 font-serif italic leading-relaxed">
          &ldquo;Cinta itu seperti bunga tulip yang mekar di musim semi, memberi kehangatan dan kebahagiaan abadi.&rdquo;
        </p>
      </div>

      {/* Curved Couple Hero Card */}
      <div className="relative p-3 bg-white shadow-xl rounded-[32px] rotate-[1deg] border border-rose-200 max-w-[270px] w-full transform hover:rotate-0 transition-transform duration-500">
        <img
          src={bride.photo || "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600"}
          alt="Couple"
          className="w-full h-64 object-cover rounded-[24px]"
        />
      </div>

      {/* Venue Pill */}
      <div className="inline-flex items-center gap-2 text-xs font-serif text-rose-950 bg-rose-50 px-4 py-2 rounded-full border border-rose-200/80 shadow-2xs">
        <TulipPin size={16} color={accentColor} />
        <span className="font-medium">{activeSession.venueName}</span>
      </div>
    </section>
  );
};
