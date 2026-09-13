'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '../../../../data/mock-invitation-sandbox';
import { Heart, Instagram } from 'lucide-react';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
}

export function PolaroidScrapbookVariant({ themeColor }: VariantProps) {
  const { groom, bride } = SANDBOX_COUPLE_DATA;

  return (
    <div className="space-y-6 px-3 py-2">
      {/* Scrapbook Header */}
      <div className="text-center">
        <span className="font-editorial text-xs italic tracking-widest text-hk-taupe">
          Our Special Chapter
        </span>
        <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
          Meet the Happy Pair
        </h3>
      </div>

      {/* Polaroid 1: Groom */}
      <div className="relative mx-auto max-w-xs transform -rotate-2 rounded-xl bg-white p-3 pb-5 shadow-md border border-hk-champagne/40 transition-transform hover:rotate-0">
        {/* Washi Tape visual on top */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-20 bg-amber-200/80 rounded-xs shadow-2xs backdrop-blur-xs rotate-1" />

        <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100">
          <img src={groom.photo} alt={groom.fullName} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-1.5 font-editorial text-xl font-bold text-hk-charcoal">
            <span>{groom.nickName}</span>
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          </div>
          <p className="font-manrope text-xs text-hk-charcoal font-medium mt-0.5">{groom.fullName}</p>
          <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1">
            Putra dari {groom.fatherName} &amp; {groom.motherName}
          </p>
          <a
            href={`https://instagram.com/${groom.instagram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-manrope text-[10px] text-hk-taupe"
          >
            <Instagram className="h-3 w-3" />
            <span>{groom.instagram}</span>
          </a>
        </div>
      </div>

      {/* Polaroid 2: Bride */}
      <div className="relative mx-auto max-w-xs transform rotate-2 rounded-xl bg-white p-3 pb-5 shadow-md border border-hk-champagne/40 transition-transform hover:rotate-0">
        {/* Washi Tape visual on top */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-20 bg-rose-200/80 rounded-xs shadow-2xs backdrop-blur-xs -rotate-2" />

        <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100">
          <img src={bride.photo} alt={bride.fullName} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-1.5 font-editorial text-xl font-bold text-hk-charcoal">
            <span>{bride.nickName}</span>
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          </div>
          <p className="font-manrope text-xs text-hk-charcoal font-medium mt-0.5">{bride.fullName}</p>
          <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1">
            Putri dari {bride.fatherName} &amp; {bride.motherName}
          </p>
          <a
            href={`https://instagram.com/${bride.instagram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-manrope text-[10px] text-hk-taupe"
          >
            <Instagram className="h-3 w-3" />
            <span>{bride.instagram}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
