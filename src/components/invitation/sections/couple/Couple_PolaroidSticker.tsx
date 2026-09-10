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
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Playful Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Smile className="w-4 h-4 text-rose-500" />
            <span>Meet the Happy Couple!</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
            Dua Insan, Satu Cinta
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Kisah perjalanan dua hati yang saling menemukan dan berkomitmen melangkah bersama selamanya.
          </p>
        </div>

        {/* Polaroid Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-center">
          {/* Groom Polaroid (Tilted Left) */}
          <div className="flex flex-col items-center group">
            <div className="relative bg-white p-4 pb-6 rounded-2xl shadow-xl border border-slate-100 -rotate-2 hover:rotate-0 transition-transform duration-300 max-w-xs w-full">
              {/* Washi Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-amber-200/80 backdrop-blur-xs shadow-xs -rotate-3 border-t border-b border-amber-300/60 z-10" />

              <div className="relative h-72 w-full rounded-xl overflow-hidden bg-slate-100">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-4 text-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  The Handsome Groom
                </span>
                <h3 className="text-xl font-bold text-slate-800">{groom.fullName}</h3>
                <p className="text-xs text-slate-500">
                  Putra dari: {groom.father} &amp; {groom.mother}
                </p>
                {groom.instagram && (
                  <a
                    href={`https://instagram.com/${groom.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundscape.playTick()}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:underline pt-1"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@{groom.instagram}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bride Polaroid (Tilted Right) */}
          <div className="flex flex-col items-center group">
            <div className="relative bg-white p-4 pb-6 rounded-2xl shadow-xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-300 max-w-xs w-full">
              {/* Washi Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-rose-200/80 backdrop-blur-xs shadow-xs rotate-3 border-t border-b border-rose-300/60 z-10" />

              <div className="relative h-72 w-full rounded-xl overflow-hidden bg-slate-100">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="mt-4 text-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                  The Beautiful Bride
                </span>
                <h3 className="text-xl font-bold text-slate-800">{bride.fullName}</h3>
                <p className="text-xs text-slate-500">
                  Putri dari: {bride.father} &amp; {bride.mother}
                </p>
                {bride.instagram && (
                  <a
                    href={`https://instagram.com/${bride.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundscape.playTick()}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:underline pt-1"
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
