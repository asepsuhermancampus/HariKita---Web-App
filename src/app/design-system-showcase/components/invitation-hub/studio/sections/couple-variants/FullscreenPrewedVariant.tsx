'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { Instagram } from 'lucide-react';
import { LiveContentData } from '@/types/invitation-studio';
import { DynamicTintIcon } from '../../DynamicTintIcon';
import { resolveAssetUrl } from '../../asset-resolver';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
  content?: LiveContentData;
}

export function FullscreenPrewedVariant({ themeColor, ornamentId, content }: VariantProps) {
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  const groomFullName = content?.groomName || groom.fullName;
  const groomParentsText = content?.groomParents || `${groom.fatherName} & ${groom.motherName}`;
  const brideFullName = content?.brideName || bride.fullName;
  const brideParentsText = content?.brideParents || `${bride.fatherName} & ${bride.motherName}`;
  const activeQuote = content?.quoteText || quote.text;

  return (
    <div className="space-y-4 px-3 py-1">
      {/* Groom Full-Bleed Card */}
      <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-md border border-white/20">
        <img src={groom.photo} alt={groomFullName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-manrope font-bold uppercase tracking-widest text-white shadow-2xs mb-1"
            style={{ backgroundColor: themeColor }}
          >
            The Groom
          </span>
          <h4 className="font-editorial text-2xl font-medium drop-shadow-sm">{groomFullName}</h4>
          <p className="font-manrope text-[11px] text-white/80 mt-1 leading-snug">
            Putra dari {groomParentsText}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-manrope text-white/70">
            <Instagram className="h-3 w-3" />
            <span>{groom.instagram}</span>
            <span className="mx-1.5">•</span>
            <span>{groom.origin}</span>
          </div>
        </div>
      </div>

      {/* Cinematic Golden Badge with Ornament */}
      <div className="flex items-center justify-center gap-3 py-1 text-center">
        <div className="h-px flex-1 bg-hk-champagne/60" />
        <div className="flex items-center gap-2">
          {ornamentId && (
            <DynamicTintIcon
              src={resolveAssetUrl(ornamentId)}
              color={themeColor}
              size={18}
              alt="Crest Ornament"
            />
          )}
          <span className="font-editorial text-xl italic font-serif" style={{ color: themeColor }}>
            &amp;
          </span>
        </div>
        <div className="h-px flex-1 bg-hk-champagne/60" />
      </div>

      {/* Bride Full-Bleed Card */}
      <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-md border border-white/20">
        <img src={bride.photo} alt={brideFullName} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[9px] font-manrope font-bold uppercase tracking-widest text-white shadow-2xs mb-1"
            style={{ backgroundColor: themeColor }}
          >
            The Bride
          </span>
          <h4 className="font-editorial text-2xl font-medium drop-shadow-sm">{brideFullName}</h4>
          <p className="font-manrope text-[11px] text-white/80 mt-1 leading-snug">
            Putri dari {brideParentsText}
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
        "{activeQuote}"
      </p>
    </div>
  );
}
