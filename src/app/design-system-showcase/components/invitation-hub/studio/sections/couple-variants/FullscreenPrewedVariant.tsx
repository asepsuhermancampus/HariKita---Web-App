'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '../../../../data/mock-invitation-sandbox';
import { Instagram } from 'lucide-react';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
}

export function FullscreenPrewedVariant({ themeColor }: VariantProps) {
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  return (
    <div className="space-y-4 px-3 py-1">
      {/* Groom Full-Bleed Card */}
      <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-md border border-white/20">
        <img src={groom.photo} alt={groom.fullName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-manrope font-bold uppercase tracking-widest text-white shadow-2xs mb-1"
            style={{ backgroundColor: themeColor }}
          >
            The Groom
          </span>
          <h4 className="font-editorial text-2xl font-medium drop-shadow-sm">{groom.fullName}</h4>
          <p className="font-manrope text-[11px] text-white/80 mt-1 leading-snug">
            Putra dari {groom.fatherName} &amp; {groom.motherName}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-manrope text-white/70">
            <Instagram className="h-3 w-3" />
            <span>{groom.instagram}</span>
            <span className="mx-1.5">•</span>
            <span>{groom.origin}</span>
          </div>
        </div>
      </div>

      {/* Cinematic Golden Badge */}
      <div className="flex items-center justify-center gap-3 py-1 text-center">
        <div className="h-px flex-1 bg-hk-champagne/60" />
        <span className="font-editorial text-xl italic font-serif" style={{ color: themeColor }}>
          &amp;
        </span>
        <div className="h-px flex-1 bg-hk-champagne/60" />
      </div>

      {/* Bride Full-Bleed Card */}
      <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-md border border-white/20">
        <img src={bride.photo} alt={bride.fullName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-manrope font-bold uppercase tracking-widest text-white shadow-2xs mb-1"
            style={{ backgroundColor: themeColor }}
          >
            The Bride
          </span>
          <h4 className="font-editorial text-2xl font-medium drop-shadow-sm">{bride.fullName}</h4>
          <p className="font-manrope text-[11px] text-white/80 mt-1 leading-snug">
            Putri dari {bride.fatherName} &amp; {bride.motherName}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-manrope text-white/70">
            <Instagram className="h-3 w-3" />
            <span>{bride.instagram}</span>
            <span className="mx-1.5">•</span>
            <span>{bride.origin}</span>
          </div>
        </div>
      </div>

      {/* Cinematic Outro */}
      <p className="text-center font-editorial text-xs italic text-hk-charcoal/70 pt-2">
        "{quote.text}"
      </p>
    </div>
  );
}
