'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { Heart, Instagram } from 'lucide-react';
import { LiveContentData } from '@/types/invitation-studio';
import { DynamicTintIcon } from '../../DynamicTintIcon';
import { resolveAssetUrl } from '../../asset-resolver';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
  content?: LiveContentData;
}

export function PolaroidScrapbookVariant({ themeColor, ornamentId, content }: VariantProps) {
  const { groom, bride } = SANDBOX_COUPLE_DATA;

  const groomFullName = content?.groomName || groom.fullName;
  const groomParentsText = content?.groomParents || `${groom.fatherName} & ${groom.motherName}`;
  const brideFullName = content?.brideName || bride.fullName;
  const brideParentsText = content?.brideParents || `${bride.fatherName} & ${bride.motherName}`;

  return (
    <div className="space-y-6 px-3 py-2">
      {/* Scrapbook Header */}
      <div className="text-center">
        {ornamentId && (
          <div className="flex justify-center mb-1">
            <DynamicTintIcon
              src={resolveAssetUrl(ornamentId)}
              color={themeColor}
              size={32}
              alt="Scrapbook Ribbon"
              className="opacity-80"
            />
          </div>
        )}
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
          <img src={groom.photo} alt={groomFullName} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-1.5 font-editorial text-xl font-bold text-hk-charcoal">
            <span>{content?.groomName ? content.groomName.split(' ')[0] : groom.nickName}</span>
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          </div>
          <p className="font-manrope text-xs text-hk-charcoal font-medium mt-0.5">{groomFullName}</p>
          <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1">
            Putra dari {groomParentsText}
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
          <img src={bride.photo} alt={brideFullName} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center gap-1.5 font-editorial text-xl font-bold text-hk-charcoal">
            <span>{content?.brideName ? content.brideName.split(' ')[0] : bride.nickName}</span>
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          </div>
          <p className="font-manrope text-xs text-hk-charcoal font-medium mt-0.5">{brideFullName}</p>
          <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1">
            Putri dari {brideParentsText}
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
