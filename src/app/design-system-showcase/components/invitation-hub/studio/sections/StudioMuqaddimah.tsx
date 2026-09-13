'use client';

import React from 'react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';

interface StudioMuqaddimahProps {
  themeColor: string;
}

export function StudioMuqaddimah({ themeColor }: StudioMuqaddimahProps) {
  const { quote } = SANDBOX_COUPLE_DATA;

  return (
    <div className="space-y-4 px-4 py-6 text-center text-hk-charcoal">
      {/* Basmalah & Greetings */}
      <div className="space-y-2">
        <span
          className="font-editorial text-2xl tracking-wider block"
          style={{ color: themeColor }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>
        <h4 className="font-editorial text-xl font-medium">Assalamu’alaikum Warahmatullahi Wabarakatuh</h4>
        <p className="font-manrope text-xs text-hk-charcoal/75 leading-relaxed max-w-xs mx-auto">
          Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta’ala, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:
        </p>
      </div>

      {/* Quote Banner */}
      <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/60 p-4 max-w-xs mx-auto">
        <p className="font-editorial text-xs italic leading-relaxed text-hk-charcoal/80">
          "{quote.text}"
        </p>
        <span
          className="block mt-1 font-manrope text-[9px] font-bold uppercase tracking-wider"
          style={{ color: themeColor }}
        >
          {quote.verse}
        </span>
      </div>
    </div>
  );
}
