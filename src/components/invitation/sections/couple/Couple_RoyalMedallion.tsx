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
      <div className="max-w-4xl mx-auto space-y-16 text-center">
        {/* Royal Crest Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-100/40 text-amber-900 text-xs font-serif font-bold uppercase tracking-widest shadow-xs">
            <Crown className="w-4 h-4 text-amber-600" />
            <span>Sang Raja &amp; Ratu Sehari</span>
            <Crown className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-amber-950">
            Dua Mempelai Mulia
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-serif italic">
            Menyatukan dua trah keluarga besar dalam ikatan suci pernikahan berbalut restu dan doa kebaikan.
          </p>
        </div>

        {/* Medallion Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-center">
          {/* Groom Medallion */}
          <div className="space-y-6 flex flex-col items-center">
            <div className="relative p-2 rounded-full border-4 border-amber-400 shadow-2xl bg-gradient-to-b from-amber-200 via-white to-amber-100">
              <div className="relative w-56 h-56 rounded-full overflow-hidden border-2 border-amber-600/30">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-200 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-400/50 shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Raden Pengantin</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 max-w-xs">
              <h3 className="text-2xl font-serif font-bold text-amber-950">{groom.fullName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Putra tercinta dari: <br />
                <strong className="text-slate-800">{groom.father}</strong> &amp;{" "}
                <strong className="text-slate-800">{groom.mother}</strong>
              </p>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundscape.playTick()}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-serif pt-1"
                >
                  <Instagram className="w-3.5 h-3.5 text-amber-700" />
                  <span>@{groom.instagram}</span>
                </a>
              )}
            </div>
          </div>

          {/* Bride Medallion */}
          <div className="space-y-6 flex flex-col items-center">
            <div className="relative p-2 rounded-full border-4 border-amber-400 shadow-2xl bg-gradient-to-b from-amber-200 via-white to-amber-100">
              <div className="relative w-56 h-56 rounded-full overflow-hidden border-2 border-amber-600/30">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-200 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-400/50 shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Putri Pengantin</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 max-w-xs">
              <h3 className="text-2xl font-serif font-bold text-amber-950">{bride.fullName}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Putri tercinta dari: <br />
                <strong className="text-slate-800">{bride.father}</strong> &amp;{" "}
                <strong className="text-slate-800">{bride.mother}</strong>
              </p>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundscape.playTick()}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-serif pt-1"
                >
                  <Instagram className="w-3.5 h-3.5 text-amber-700" />
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
