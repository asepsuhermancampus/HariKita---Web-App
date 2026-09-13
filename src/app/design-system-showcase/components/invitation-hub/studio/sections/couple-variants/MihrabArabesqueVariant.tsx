'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { Instagram } from 'lucide-react';

interface VariantProps {
  themeColor: string;
  ornamentId?: string;
}

export function MihrabArabesqueVariant({ themeColor }: VariantProps) {
  const { groom, bride, quote } = SANDBOX_COUPLE_DATA;

  return (
    <div className="space-y-6 px-3 py-2 text-hk-charcoal">
      {/* Islamic Basmalah Calligraphy Header */}
      <div className="text-center space-y-1">
        <div className="font-editorial text-2xl tracking-wide text-hk-charcoal" style={{ color: themeColor }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        <p className="font-manrope text-[11px] text-hk-charcoal/70">
          Dengan memohon ridho &amp; rahmat Allah SWT, kami bermaksud mengikat janji suci:
        </p>
      </div>

      {/* Pointed Mihrab Arch Cards */}
      <div className="space-y-6">
        {/* Groom Card */}
        <div className="rounded-2xl border border-hk-champagne/60 bg-white p-4 shadow-xs text-center">
          <div className="mx-auto h-48 w-36 overflow-hidden rounded-t-[72px] border-2 border-[#2C4A3E]/30 bg-hk-ivory p-1">
            <img src={groom.photo} alt={groom.fullName} className="h-full w-full rounded-t-[68px] object-cover" />
          </div>
          <h4 className="mt-3 font-editorial text-xl font-medium">{groom.fullName}</h4>
          <span className="inline-block font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-taupe mt-0.5">
            ({groom.nickName})
          </span>
          <p className="font-manrope text-xs text-hk-charcoal/70 mt-1 leading-relaxed">
            Putra pertama dari <br />
            <strong>{groom.fatherName}</strong> &amp; <strong>{groom.motherName}</strong>
          </p>
          <span className="mt-2 inline-flex items-center gap-1 font-manrope text-[10px] text-hk-taupe">
            <Instagram className="h-3 w-3" /> {groom.instagram}
          </span>
        </div>

        {/* Arabesque Ring Centerpiece */}
        <div className="flex justify-center -my-3 relative z-10">
          <div
            className="flex h-8 px-4 items-center justify-center rounded-full border border-hk-champagne bg-hk-ivory font-editorial text-xs font-semibold uppercase tracking-widest shadow-2xs"
            style={{ color: themeColor }}
          >
            Bersanding Dengan
          </div>
        </div>

        {/* Bride Card */}
        <div className="rounded-2xl border border-hk-champagne/60 bg-white p-4 shadow-xs text-center">
          <div className="mx-auto h-48 w-36 overflow-hidden rounded-t-[72px] border-2 border-[#2C4A3E]/30 bg-hk-ivory p-1">
            <img src={bride.photo} alt={bride.fullName} className="h-full w-full rounded-t-[68px] object-cover" />
          </div>
          <h4 className="mt-3 font-editorial text-xl font-medium">{bride.fullName}</h4>
          <span className="inline-block font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-taupe mt-0.5">
            ({bride.nickName})
          </span>
          <p className="font-manrope text-xs text-hk-charcoal/70 mt-1 leading-relaxed">
            Putri kedua dari <br />
            <strong>{bride.fatherName}</strong> &amp; <strong>{bride.motherName}</strong>
          </p>
          <span className="mt-2 inline-flex items-center gap-1 font-manrope text-[10px] text-hk-taupe">
            <Instagram className="h-3 w-3" /> {bride.instagram}
          </span>
        </div>
      </div>

      {/* Syar'i Ayat Footer */}
      <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/60 p-3 text-center">
        <p className="font-editorial text-xs italic text-hk-charcoal/80 leading-relaxed">
          "{quote.text}"
        </p>
        <span className="block mt-1 font-manrope text-[10px] font-bold uppercase tracking-wider text-hk-taupe">
          (QS. Ar-Rum: 21)
        </span>
      </div>
    </div>
  );
}
