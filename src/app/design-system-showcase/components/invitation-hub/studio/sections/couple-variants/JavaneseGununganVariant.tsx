'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { LiveContentData } from '@/types/invitation-studio';
import { DynamicTintIcon } from '../../DynamicTintIcon';
import { resolveAssetUrl } from '../../asset-resolver';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
  content?: LiveContentData;
}

export function JavaneseGununganVariant({ themeColor, ornamentId, content }: VariantProps) {
  const { groom, bride } = SANDBOX_COUPLE_DATA;

  const groomFullName = content?.groomName || groom.fullName;
  const groomParentsText = content?.groomParents || `${groom.fatherName} & ${groom.motherName}`;
  const brideFullName = content?.brideName || bride.fullName;
  const brideParentsText = content?.brideParents || `${bride.fatherName} & ${bride.motherName}`;

  return (
    <div className="space-y-6 px-3 py-2 text-[#382216]">
      {/* Adiluhung Header */}
      <div className="text-center space-y-1">
        {/* Dynamic Gunungan / Sogan Crest */}
        {ornamentId && (
          <div className="flex justify-center mb-1">
            <DynamicTintIcon
              src={resolveAssetUrl(ornamentId)}
              color={themeColor || '#5A3825'}
              size={36}
              alt="Gunungan Adat"
              className="opacity-90"
            />
          </div>
        )}
        <span className="font-editorial text-xs italic tracking-widest text-[#5A3825]">
          Serat Panyandra Palakrama
        </span>
        <h3 className="font-editorial text-2xl font-normal text-[#382216]">
          Dhaup Suci Sri Penganten
        </h3>
        <p className="font-manrope text-[10px] text-[#5A3825]/75 italic">
          "Nyuwun lumunturing sih wilasa mugi tansah pinaringan berkah wilujeng"
        </p>
      </div>

      {/* Javanese Carving Sogan Cards */}
      <div className="space-y-6">
        {/* Groom Sogan Box */}
        <div className="relative rounded-xl border-2 border-[#5A3825]/40 bg-[#FDFBF7] p-4 shadow-sm text-center">
          <div className="mx-auto h-44 w-36 overflow-hidden rounded-lg border border-[#C5A880] p-1 shadow-inner bg-white">
            <img src={groom.photo} alt={groomFullName} className="h-full w-full rounded-md object-cover filter sepia-[0.15]" />
          </div>
          <span className="mt-3 inline-block rounded-full bg-[#5A3825]/10 px-3 py-0.5 font-manrope text-[10px] font-bold uppercase tracking-wider text-[#5A3825]">
            Raden Penganten Kakung
          </span>
          <h4 className="mt-1 font-editorial text-xl font-semibold text-[#382216]">{groomFullName}</h4>
          <p className="font-manrope text-xs text-[#5A3825]/80 mt-1">
            Putra kakung pambayun saking <br />
            <strong>{groomParentsText}</strong>
          </p>
          <span className="block mt-1 font-manrope text-[10px] text-[#5A3825]/60 italic">{groom.origin}</span>
        </div>

        {/* Aksara Java Link Divider with Ornament */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-[#C5A880]/50" />
          {ornamentId && (
            <DynamicTintIcon
              src={resolveAssetUrl(ornamentId)}
              color={themeColor || '#5A3825'}
              size={18}
              className="opacity-70"
            />
          )}
          <span className="font-editorial text-sm italic font-serif px-2 text-[#5A3825]">
            kalian
          </span>
          {ornamentId && (
            <DynamicTintIcon
              src={resolveAssetUrl(ornamentId)}
              color={themeColor || '#5A3825'}
              size={18}
              className="opacity-70 transform -scale-x-100"
            />
          )}
          <div className="h-px flex-1 bg-[#C5A880]/50" />
        </div>

        {/* Bride Sogan Box */}
        <div className="relative rounded-xl border-2 border-[#5A3825]/40 bg-[#FDFBF7] p-4 shadow-sm text-center">
          <div className="mx-auto h-44 w-36 overflow-hidden rounded-lg border border-[#C5A880] p-1 shadow-inner bg-white">
            <img src={bride.photo} alt={brideFullName} className="h-full w-full rounded-md object-cover filter sepia-[0.15]" />
          </div>
          <span className="mt-3 inline-block rounded-full bg-[#5A3825]/10 px-3 py-0.5 font-manrope text-[10px] font-bold uppercase tracking-wider text-[#5A3825]">
            Rara Penganten Putri
          </span>
          <h4 className="mt-1 font-editorial text-xl font-semibold text-[#382216]">{brideFullName}</h4>
          <p className="font-manrope text-xs text-[#5A3825]/80 mt-1">
            Putri pawestri panggulu saking <br />
            <strong>{brideParentsText}</strong>
          </p>
          <span className="block mt-1 font-manrope text-[10px] text-[#5A3825]/60 italic">{bride.origin}</span>
        </div>
      </div>
    </div>
  );
}
