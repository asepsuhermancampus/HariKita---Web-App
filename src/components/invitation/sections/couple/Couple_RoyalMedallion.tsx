"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Crown, Shield } from "lucide-react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";

export const Couple_RoyalMedallion: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ bride, groom, theme }) => {
  const primaryColor = theme?.colors?.primary || "#C5A880";
  const accentColor = theme?.colors?.accent || "#D4AF37";
  const textDark = theme?.colors?.text || "#221929";

  return (
    <section id="couple" className="py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
      <div className="max-w-3xl mx-auto space-y-14 text-center">
        {/* Royal Crest Header */}
        <div className="space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-serif font-bold uppercase tracking-widest shadow-xs"
            style={{ borderColor: `${accentColor}50`, backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            <Crown className="w-4 h-4" />
            <span>Sang Raja &amp; Ratu Sehari</span>
            <Crown className="w-4 h-4" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight" style={{ color: textDark }}>
            Dua Mempelai Mulia
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto font-serif italic">
            Menyatukan dua trah keluarga besar dalam ikatan suci pernikahan berbalut restu dan doa kebaikan.
          </p>
        </div>

        {/* Medallion Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12 items-center justify-items-center">
          {/* Groom Medallion */}
          <div className="space-y-5 flex flex-col items-center max-w-xs w-full">
            <div
              className="relative p-2 rounded-full border-4 shadow-xl"
              style={{ borderColor: accentColor, background: `linear-gradient(to bottom, ${accentColor}30, #ffffff, ${accentColor}20)` }}
            >
              <div className="relative w-52 sm:w-56 h-52 sm:h-56 rounded-full overflow-hidden border-2 border-amber-600/30">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-serif font-bold uppercase tracking-widest border shadow-md flex items-center gap-1.5 whitespace-nowrap"
                style={{ backgroundColor: textDark, borderColor: accentColor, color: "#FFF5EA" }}
              >
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Raden Pengantin</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 max-w-xs">
              <h3 className="text-xl sm:text-2xl font-serif font-bold" style={{ color: textDark }}>{groom.fullName}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Putra tercinta dari: <br />
                <strong className="text-stone-800">{groom.father}</strong> &amp;{" "}
                <strong className="text-stone-800">{groom.mother}</strong>
              </p>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 font-serif pt-1 transition-opacity"
                  style={{ color: primaryColor }}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@{groom.instagram}</span>
                </a>
              )}
            </div>
          </div>

          {/* Bride Medallion */}
          <div className="space-y-5 flex flex-col items-center max-w-xs w-full">
            <div
              className="relative p-2 rounded-full border-4 shadow-xl"
              style={{ borderColor: accentColor, background: `linear-gradient(to bottom, ${accentColor}30, #ffffff, ${accentColor}20)` }}
            >
              <div className="relative w-52 sm:w-56 h-52 sm:h-56 rounded-full overflow-hidden border-2 border-amber-600/30">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover object-top hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-serif font-bold uppercase tracking-widest border shadow-md flex items-center gap-1.5 whitespace-nowrap"
                style={{ backgroundColor: textDark, borderColor: accentColor, color: "#FFF5EA" }}
              >
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Putri Pengantin</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 max-w-xs">
              <h3 className="text-xl sm:text-2xl font-serif font-bold" style={{ color: textDark }}>{bride.fullName}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Putri tercinta dari: <br />
                <strong className="text-stone-800">{bride.father}</strong> &amp;{" "}
                <strong className="text-stone-800">{bride.mother}</strong>
              </p>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 font-serif pt-1 transition-opacity"
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
    </section>
  );
};
