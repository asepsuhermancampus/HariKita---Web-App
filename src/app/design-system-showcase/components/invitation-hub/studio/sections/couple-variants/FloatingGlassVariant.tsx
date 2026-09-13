'use client';

import React from 'react';
import { Instagram, Sparkles } from 'lucide-react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
}

export function FloatingGlassVariant({ themeColor }: VariantProps) {
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  return (
    <div className="space-y-6 px-4 py-2">
      {/* Header Badge */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[10px] font-manrope font-bold uppercase tracking-widest text-hk-charcoal/70 shadow-2xs backdrop-blur-md">
          <Sparkles className="h-3 w-3" style={{ color: themeColor }} />
          <span>The Blessed Couple</span>
        </div>
        <h3 className="mt-2 font-editorial text-2xl sm:text-3xl text-hk-charcoal font-medium">
          Mempelai Pengantin
        </h3>
      </div>

      {/* Groom Glass Card */}
      <div className="relative rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-xs">
            <img src={groom.photo} alt={groom.fullName} className="h-full w-full object-cover" />
            <div
              className="absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-[9px] font-manrope font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              The Groom
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h4 className="font-editorial text-xl text-hk-charcoal font-semibold">{groom.fullName}</h4>
            <p className="font-manrope text-xs text-hk-charcoal/70 mt-1">
              Putra pertama dari <br />
              <span className="font-semibold text-hk-charcoal">{groom.fatherName}</span> &amp;{' '}
              <span className="font-semibold text-hk-charcoal">{groom.motherName}</span>
            </p>
            <p className="font-manrope text-[11px] text-hk-taupe mt-1">{groom.origin}</p>
            <a
              href={`https://instagram.com/${groom.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-hk-champagne/60 bg-white/90 px-2.5 py-1 text-[10px] font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe"
            >
              <Instagram className="h-3 w-3" style={{ color: themeColor }} />
              <span>{groom.instagram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Ampersand Floating Hub */}
      <div className="flex justify-center -my-3 relative z-10">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white font-editorial text-xl italic shadow-xs"
          style={{ color: themeColor }}
        >
          &amp;
        </div>
      </div>

      {/* Bride Glass Card */}
      <div className="relative rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-xs">
            <img src={bride.photo} alt={bride.fullName} className="h-full w-full object-cover" />
            <div
              className="absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-[9px] font-manrope font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              The Bride
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h4 className="font-editorial text-xl text-hk-charcoal font-semibold">{bride.fullName}</h4>
            <p className="font-manrope text-xs text-hk-charcoal/70 mt-1">
              Putri kedua dari <br />
              <span className="font-semibold text-hk-charcoal">{bride.fatherName}</span> &amp;{' '}
              <span className="font-semibold text-hk-charcoal">{bride.motherName}</span>
            </p>
            <p className="font-manrope text-[11px] text-hk-taupe mt-1">{bride.origin}</p>
            <a
              href={`https://instagram.com/${bride.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-hk-champagne/60 bg-white/90 px-2.5 py-1 text-[10px] font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe"
            >
              <Instagram className="h-3 w-3" style={{ color: themeColor }} />
              <span>{bride.instagram}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quote Footer */}
      <div className="mt-4 rounded-xl border border-hk-champagne/40 bg-white/60 p-3 text-center">
        <p className="font-editorial text-xs italic text-hk-charcoal/80 leading-relaxed">
          "{quote.text}"
        </p>
        <span className="mt-1 block font-manrope text-[9px] font-bold uppercase tracking-wider text-hk-taupe">
          {quote.verse}
        </span>
      </div>
    </div>
  );
}
