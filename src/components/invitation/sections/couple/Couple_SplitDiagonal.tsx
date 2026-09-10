"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Sparkles, Heart } from "lucide-react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { soundscape } from "@/lib/sound/soundscapeEngine";

export const Couple_SplitDiagonal: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ bride, groom, theme }) => {
  const primaryColor = theme?.colors?.primary || "#C5A880";
  const accentColor = theme?.colors?.accent || "#8E2800";
  const textDark = theme?.colors?.text || "#2B2D42";

  return (
    <section id="couple" className="py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Editorial Subtitle */}
        <div className="text-center space-y-3">
          <span
            className="text-xs uppercase tracking-[0.3em] font-semibold px-4 py-1.5 rounded-full border border-black/10 inline-flex items-center gap-2"
            style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}
          >
            <Sparkles className="w-3 h-3" />
            <span>The Honored Couple</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight" style={{ color: textDark }}>
            Mempelai Bahagia
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto italic font-serif">
            &ldquo;Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan untuk saling menyayangi.&rdquo;
          </p>
        </div>

        {/* Split Editorial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
          {/* Central Heart Connector (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-lg bg-white border border-slate-200 items-center justify-center">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
          </div>

          {/* Groom Card (Editorial Asymmetric Cut) */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xl space-y-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-inner group">
              <Image
                src={groom.photo}
                alt={groom.fullName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[11px] font-mono tracking-widest uppercase bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                  Mempelai Pria
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-serif font-bold" style={{ color: textDark }}>
                {groom.fullName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Putra dari <strong className="text-slate-800">{groom.father}</strong> &amp;{" "}
                <strong className="text-slate-800">{groom.mother}</strong>
              </p>

              {groom.instagram && (
                <a
                  href={`https://instagram.com/${groom.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundscape.playTick()}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                  style={{ color: primaryColor }}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@{groom.instagram}</span>
                </a>
              )}
            </div>
          </div>

          {/* Bride Card (Editorial Asymmetric Cut) */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xl space-y-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-inner group">
              <Image
                src={bride.photo}
                alt={bride.fullName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[11px] font-mono tracking-widest uppercase bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                  Mempelai Wanita
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-serif font-bold" style={{ color: textDark }}>
                {bride.fullName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Putri dari <strong className="text-slate-800">{bride.father}</strong> &amp;{" "}
                <strong className="text-slate-800">{bride.mother}</strong>
              </p>

              {bride.instagram && (
                <a
                  href={`https://instagram.com/${bride.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundscape.playTick()}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
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
