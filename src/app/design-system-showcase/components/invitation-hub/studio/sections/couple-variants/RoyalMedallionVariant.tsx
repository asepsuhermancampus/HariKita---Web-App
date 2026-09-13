'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { Shield } from 'lucide-react';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
}

export function RoyalMedallionVariant({ themeColor }: VariantProps) {
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  return (
    <div className="space-y-6 px-3 py-2 text-center text-hk-charcoal">
      {/* Royal Seal Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50/70 px-3 py-0.5 text-[10px] font-manrope font-bold uppercase tracking-widest text-amber-900 shadow-2xs">
          <Shield className="h-3 w-3 text-amber-700" />
          <span>Royal Wedding Crest</span>
        </div>
        <h3 className="font-editorial text-3xl font-medium tracking-wide">
          Aditya &amp; Ratna
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-hk-taupe">
          The Two Noble Families
        </span>
      </div>

      {/* Dual Royal Oval Medallions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Groom Oval Medallion */}
        <div className="flex flex-col items-center">
          <div className="relative h-56 w-44 rounded-full border-4 border-[#C5A880] p-1.5 shadow-lg bg-white ring-4 ring-amber-100/60">
            <img src={groom.photo} alt={groom.fullName} className="h-full w-full rounded-full object-cover" />
            <div
              className="absolute -bottom-2 inset-x-6 rounded-full py-1 text-[9px] font-editorial font-semibold uppercase tracking-wider text-white shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              The Groom
            </div>
          </div>
          <h4 className="mt-4 font-editorial text-xl font-semibold">{groom.fullName}</h4>
          <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1 max-w-[200px]">
            Son of <strong>{groom.fatherName}</strong> &amp; <strong>{groom.motherName}</strong>
          </p>
        </div>

        {/* Bride Oval Medallion */}
        <div className="flex flex-col items-center">
          <div className="relative h-56 w-44 rounded-full border-4 border-[#C5A880] p-1.5 shadow-lg bg-white ring-4 ring-amber-100/60">
            <img src={bride.photo} alt={bride.fullName} className="h-full w-full rounded-full object-cover" />
            <div
              className="absolute -bottom-2 inset-x-6 rounded-full py-1 text-[9px] font-editorial font-semibold uppercase tracking-wider text-white shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              The Bride
            </div>
          </div>
          <h4 className="mt-4 font-editorial text-xl font-semibold">{bride.fullName}</h4>
          <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1 max-w-[200px]">
            Daughter of <strong>{bride.fatherName}</strong> &amp; <strong>{bride.motherName}</strong>
          </p>
        </div>
      </div>

      {/* Regal Quote */}
      <div className="border-t border-amber-200/50 pt-3">
        <p className="font-editorial text-xs italic text-hk-charcoal/80">"{quote.text}"</p>
        <span className="block mt-1 font-mono text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">
          {quote.verse}
        </span>
      </div>
    </div>
  );
}
