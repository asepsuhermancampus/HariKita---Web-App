"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Heart, Smile } from "lucide-react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";

export const Couple_PolaroidSticker: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ bride, groom, theme }) => {
  const primaryColor = theme?.colors?.primary || "#FF7E67";
  const textDark = theme?.colors?.text || "#2B2D42";

  return (
    <section id="couple" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-white/40">
      <div className="max-w-3xl mx-auto space-y-14">
        {/* Playful Header */}
        <div className="text-center space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-serif font-bold uppercase tracking-wider border shadow-xs"
            style={{ backgroundColor: `${primaryColor}14`, borderColor: `${primaryColor}30`, color: primaryColor }}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Meet the Happy Couple!</span>
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight" style={{ color: textDark }}>
            Dua Insan, Satu Cinta
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Kisah perjalanan dua hati yang saling menemukan dan berkomitmen melangkah bersama selamanya.
          </p>
        </div>

        {/* Polaroid Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-12 items-center justify-items-center">
          {/* Groom Polaroid */}
          <div className="flex flex-col items-center group max-w-xs w-full">
            <div className="relative bg-white p-3.5 pb-5 rounded-2xl shadow-xl border border-stone-200/80 transition-transform duration-300 hover:scale-[1.02] w-full">
              {/* Washi Tape Accent */}
              <div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 rounded-xs shadow-xs border z-10 opacity-80"
                style={{ backgroundColor: `${primaryColor}25`, borderColor: `${primaryColor}40` }}
              />

              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-4 text-center space-y-1.5">
                <span
                  className="text-[11px] font-serif font-bold uppercase tracking-wider block"
                  style={{ color: primaryColor }}
                >
                  The Handsome Groom
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold" style={{ color: textDark }}>{groom.fullName}</h3>
                <p className="text-xs text-stone-500">
                  Putra dari: {groom.father} &amp; {groom.mother}
                </p>
                {groom.instagram && (
                  <a
                    href={`https://instagram.com/${groom.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs hover:underline pt-1 transition-colors"
                    style={{ color: primaryColor }}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@{groom.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bride Polaroid */}
          <div className="flex flex-col items-center group max-w-xs w-full">
            <div className="relative bg-white p-3.5 pb-5 rounded-2xl shadow-xl border border-stone-200/80 transition-transform duration-300 hover:scale-[1.02] w-full">
              {/* Washi Tape Accent */}
              <div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 rounded-xs shadow-xs border z-10 opacity-80"
                style={{ backgroundColor: `${primaryColor}25`, borderColor: `${primaryColor}40` }}
              />

              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-stone-100">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-4 text-center space-y-1.5">
                <span
                  className="text-[11px] font-serif font-bold uppercase tracking-wider block"
                  style={{ color: primaryColor }}
                >
                  The Beautiful Bride
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold" style={{ color: textDark }}>{bride.fullName}</h3>
                <p className="text-xs text-stone-500">
                  Putri dari: {bride.father} &amp; {bride.mother}
                </p>
                {bride.instagram && (
                  <a
                    href={`https://instagram.com/${bride.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs hover:underline pt-1 transition-colors"
                    style={{ color: primaryColor }}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@{bride.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
