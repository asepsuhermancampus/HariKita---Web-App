"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Sparkles, Heart } from "lucide-react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";

export const Couple_ArchClassic: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ bride, groom, theme }) => {
  const primaryColor = theme?.colors?.primary || "#2D5A27";
  const accentColor = theme?.colors?.accent || "#C5A880";
  const textDark = theme?.colors?.text || "#1E293B";

  return (
    <section id="couple" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-16 text-center">
        {/* Classical Header with Ornament */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-amber-300/40 bg-amber-50 shadow-inner">
            <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold" style={{ color: textDark }}>
            Mempelai Terkasih
          </h2>
          <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>

        {/* Arch Duo Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Groom Arch Card */}
          <div className="space-y-6 flex flex-col items-center">
            {/* Moroccan / Roman Arch Top Frame */}
            <div
              className="relative w-64 h-84 p-2 rounded-t-[120px] rounded-b-2xl border-2 shadow-2xl overflow-hidden bg-white group"
              style={{ borderColor: accentColor }}
            >
              <div className="relative w-full h-full rounded-t-[112px] rounded-b-xl overflow-hidden">
                <Image
                  src={groom.photo}
                  alt={groom.fullName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                Calon Pengantin Pria
              </span>
              <h3 className="text-2xl font-serif font-bold" style={{ color: textDark }}>
                {groom.fullName}
              </h3>
              <div className="py-2 px-4 rounded-full bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
                Putra tercinta: <br />
                <strong className="text-slate-800">{groom.father}</strong> &amp;{" "}
                <strong className="text-slate-800">{groom.mother}</strong>
              </div>
              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundscape.playTick()}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-700 pt-1"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>@{groom.instagram}</span>
                </a>
              )}
            </div>
          </div>

          {/* Bride Arch Card */}
          <div className="space-y-6 flex flex-col items-center">
            {/* Moroccan / Roman Arch Top Frame */}
            <div
              className="relative w-64 h-84 p-2 rounded-t-[120px] rounded-b-2xl border-2 shadow-2xl overflow-hidden bg-white group"
              style={{ borderColor: accentColor }}
            >
              <div className="relative w-full h-full rounded-t-[112px] rounded-b-xl overflow-hidden">
                <Image
                  src={bride.photo}
                  alt={bride.fullName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                Calon Pengantin Wanita
              </span>
              <h3 className="text-2xl font-serif font-bold" style={{ color: textDark }}>
                {bride.fullName}
              </h3>
              <div className="py-2 px-4 rounded-full bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
                Putri tercinta: <br />
                <strong className="text-slate-800">{bride.father}</strong> &amp;{" "}
                <strong className="text-slate-800">{bride.mother}</strong>
              </div>
              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundscape.playTick()}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-700 pt-1"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
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
