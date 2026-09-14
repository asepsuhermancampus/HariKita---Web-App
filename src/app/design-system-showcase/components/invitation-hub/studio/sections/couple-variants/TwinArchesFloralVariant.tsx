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

export function TwinArchesFloralVariant({ themeColor, ornamentId, content }: VariantProps) {
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  const groomFullName = content?.groomName || groom.fullName;
  const groomParentsText = content?.groomParents || `${groom.fatherName} & ${groom.motherName}`;
  const brideFullName = content?.brideName || bride.fullName;
  const brideParentsText = content?.brideParents || `${bride.fatherName} & ${bride.motherName}`;
  const activeQuote = content?.quoteText || quote.text;

  return (
    <div className="space-y-6 px-3 py-2">
      <div className="text-center">
        {/* Dynamic Botanical Flourish Header */}
        {ornamentId && (
          <div className="flex justify-center mb-1">
            <DynamicTintIcon
              src={resolveAssetUrl(ornamentId)}
              color={themeColor}
              size={36}
              alt="Floral Flourish"
              className="opacity-90"
            />
          </div>
        )}
        <span
          className="font-editorial text-xs italic tracking-widest"
          style={{ color: themeColor }}
        >
          Walimatul 'Ursy
        </span>
        <h3 className="mt-1 font-editorial text-3xl text-hk-charcoal font-normal">
          Mempelai Bahagia
        </h3>
      </div>

      {/* Side-by-Side Twin Arches Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
        {/* Groom Arch */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-60 w-44 overflow-hidden rounded-t-[90px] border-2 border-hk-champagne/80 bg-white p-1 shadow-sm">
            <img
              src={groom.photo}
              alt={groomFullName}
              className="h-full w-full rounded-t-[84px] object-cover"
            />
            {/* Bottom arch badge */}
            <div
              className="absolute bottom-2 inset-x-4 rounded-full py-0.5 text-[9px] font-manrope font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              The Groom
            </div>
          </div>
          <h4 className="mt-3 font-editorial text-xl font-medium text-hk-charcoal">{groomFullName}</h4>
          <p className="mt-1 font-manrope text-[11px] text-hk-charcoal/70 leading-relaxed max-w-[200px]">
            Putra pertama dari <br />
            <strong>{groomParentsText}</strong>
          </p>
          <a
            href={`https://instagram.com/${groom.instagram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-manrope text-[10px] text-hk-taupe hover:underline"
          >
            <Instagram className="h-3 w-3" />
            <span>{groom.instagram}</span>
          </a>
        </div>

        {/* Bride Arch */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-60 w-44 overflow-hidden rounded-t-[90px] border-2 border-hk-champagne/80 bg-white p-1 shadow-sm">
            <img
              src={bride.photo}
              alt={brideFullName}
              className="h-full w-full rounded-t-[84px] object-cover"
            />
            {/* Bottom arch badge */}
            <div
              className="absolute bottom-2 inset-x-4 rounded-full py-0.5 text-[9px] font-manrope font-bold uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              The Bride
            </div>
          </div>
          <h4 className="mt-3 font-editorial text-xl font-medium text-hk-charcoal">{brideFullName}</h4>
          <p className="mt-1 font-manrope text-[11px] text-hk-charcoal/70 leading-relaxed max-w-[200px]">
            Putri kedua dari <br />
            <strong>{brideParentsText}</strong>
          </p>
          <a
            href={`https://instagram.com/${bride.instagram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-manrope text-[10px] text-hk-taupe hover:underline"
          >
            <Instagram className="h-3 w-3" />
            <span>{bride.instagram}</span>
          </a>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="border-t border-hk-champagne/40 pt-4 text-center">
        <p className="font-editorial text-xs italic text-hk-charcoal/80">"{activeQuote}"</p>
        <span className="block mt-1 font-manrope text-[9px] font-bold uppercase tracking-widest text-hk-taupe">
          {quote.verse}
        </span>
      </div>
    </div>
  );
}
