'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
}

export function EditorialSerifVariant({ themeColor }: VariantProps) {
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  return (
    <div className="space-y-8 px-4 py-2 text-hk-charcoal">
      {/* Title Minimal */}
      <div className="border-b border-black/10 pb-3 flex items-end justify-between">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-hk-charcoal/60">
            Portfolio / Volume I
          </span>
          <h3 className="font-editorial text-2xl font-light tracking-tight text-hk-charcoal">
            The Two Souls
          </h3>
        </div>
        <span className="font-editorial text-xs italic" style={{ color: themeColor }}>
          Est. 2026
        </span>
      </div>

      {/* Groom Monolith */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-hk-charcoal/70">
            01 / The Groom
          </span>
          <span className="font-manrope text-[10px] text-hk-charcoal/50">{groom.origin}</span>
        </div>
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-xs bg-black/5">
          <img src={groom.photo} alt={groom.fullName} className="h-full w-full object-cover filter contrast-[1.05]" />
          <div className="absolute inset-0 border border-black/10 pointer-events-none" />
        </div>
        <div className="pt-1">
          <h4 className="font-editorial text-2xl font-normal leading-tight">{groom.fullName}</h4>
          <p className="font-manrope text-xs text-hk-charcoal/70 mt-1 leading-relaxed">
            First son of <strong>{groom.fatherName}</strong> &amp; <strong>{groom.motherName}</strong>
          </p>
        </div>
      </div>

      {/* Editorial Hairline Divider */}
      <div className="relative flex items-center justify-center py-2">
        <div className="h-px w-full bg-black/15" />
        <span className="absolute bg-[#FAF8F5] px-4 font-editorial text-lg italic" style={{ color: themeColor }}>
          in union with
        </span>
      </div>

      {/* Bride Monolith */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-hk-charcoal/70">
            02 / The Bride
          </span>
          <span className="font-manrope text-[10px] text-hk-charcoal/50">{bride.origin}</span>
        </div>
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-xs bg-black/5">
          <img src={bride.photo} alt={bride.fullName} className="h-full w-full object-cover filter contrast-[1.05]" />
          <div className="absolute inset-0 border border-black/10 pointer-events-none" />
        </div>
        <div className="pt-1">
          <h4 className="font-editorial text-2xl font-normal leading-tight">{bride.fullName}</h4>
          <p className="font-manrope text-xs text-hk-charcoal/70 mt-1 leading-relaxed">
            Second daughter of <strong>{bride.fatherName}</strong> &amp; <strong>{bride.motherName}</strong>
          </p>
        </div>
      </div>

      {/* Quote Footer */}
      <div className="border-t border-black/10 pt-4">
        <blockquote className="font-editorial text-sm italic text-hk-charcoal/80 leading-relaxed text-center">
          "{quote.text}"
        </blockquote>
        <p className="text-center font-mono text-[9px] uppercase tracking-wider text-hk-charcoal/60 mt-1">
          — {quote.verse}
        </p>
      </div>
    </div>
  );
}
