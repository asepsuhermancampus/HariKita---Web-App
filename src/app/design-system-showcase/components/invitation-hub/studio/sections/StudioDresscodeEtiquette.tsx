'use client';

import React from 'react';
import { Shirt, Info, HeartHandshake } from 'lucide-react';

interface StudioDresscodeEtiquetteProps {
  themeColor: string;
}

export function StudioDresscodeEtiquette({ themeColor }: StudioDresscodeEtiquetteProps) {
  const colorSuggestions = [
    { label: 'Earthy Taupe', hex: '#88735B' },
    { label: 'Warm Champagne', hex: '#F3EDE6' },
    { label: 'Sage Botanical', hex: '#5B6E58' },
    { label: 'Sogan Gold', hex: '#C5A880' },
  ];

  return (
    <div className="space-y-4 px-3 py-4 text-hk-charcoal">
      <div className="text-center">
        <span
          className="font-manrope text-[10px] font-bold uppercase tracking-widest"
          style={{ color: themeColor }}
        >
          Etiket &amp; Panduan Busana Tamu
        </span>
        <h3 className="font-editorial text-2xl font-medium text-hk-charcoal mt-0.5">
          Dress Code &amp; Adab Acara
        </h3>
      </div>

      <div className="rounded-2xl border border-hk-champagne/50 bg-white p-4 shadow-xs space-y-4">
        {/* Color Palette Guide */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-manrope font-bold text-hk-charcoal mb-2">
            <Shirt className="h-3.5 w-3.5 text-hk-taupe" />
            <span>Rekomendasi Warna Busana (Batik / Formal Modest):</span>
          </div>
          <div className="flex items-center gap-3">
            {colorSuggestions.map((clr) => (
              <div key={clr.label} className="flex flex-col items-center gap-1 text-center">
                <div
                  className="h-8 w-8 rounded-full border-2 border-white shadow-xs"
                  style={{ backgroundColor: clr.hex }}
                />
                <span className="font-manrope text-[9px] text-hk-charcoal/70">{clr.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Etiquette Notes */}
        <div className="border-t border-hk-champagne/30 pt-3 space-y-2">
          <div className="flex items-start gap-2 text-[11px] font-manrope text-hk-charcoal/80">
            <Info className="h-3.5 w-3.5 shrink-0 text-hk-taupe mt-0.5" />
            <span>Dimohon hadir tepat waktu untuk menjaga kekhidmatan prosesi akad nikah.</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] font-manrope text-hk-charcoal/80">
            <HeartHandshake className="h-3.5 w-3.5 shrink-0 text-hk-taupe mt-0.5" />
            <span>Tanpa mengurangi rasa hormat, ucapan selamat dan doa restu dapat disampaikan dengan penuh kehangatan dan ketertiban.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
