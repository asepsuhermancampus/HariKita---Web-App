'use client';

import React, { useState } from 'react';
import { Palette, Copy, Check } from 'lucide-react';

export function PaletteSection() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    {
      name: 'Charcoal',
      hex: '#2B2B2B',
      rgb: '43, 43, 43',
      usage: 'Primary Text, Dark Sections, Deep Accents',
      class: 'bg-hk-charcoal',
      textClass: 'text-hk-charcoal',
    },
    {
      name: 'Taupe',
      hex: '#88735B',
      rgb: '136, 115, 91',
      usage: 'Primary Brand Color, Primary Buttons, Symbols',
      class: 'bg-hk-taupe',
      textClass: 'text-hk-taupe',
    },
    {
      name: 'Champagne',
      hex: '#C9A88A',
      rgb: '201, 168, 138',
      usage: 'Borders, Outlines, Muted Accents, Foil',
      class: 'bg-hk-champagne',
      textClass: 'text-hk-champagne',
    },
    {
      name: 'Soft Beige',
      hex: '#E8DED1',
      rgb: '232, 222, 209',
      usage: 'Dividers, Secondary Surfaces, Subtle Pills',
      class: 'bg-hk-soft-beige',
      textClass: 'text-hk-soft-beige',
    },
    {
      name: 'Ivory',
      hex: '#F8F6F1',
      rgb: '248, 246, 241',
      usage: 'Background Canvas, Card Containers',
      class: 'bg-hk-ivory',
      textClass: 'text-hk-ivory',
    },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <section id="palette" className="scroll-mt-24">
      <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Palette className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Brand Foundation
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            5-Color Palette
          </h2>
        </div>
        <p className="font-manrope text-xs text-hk-taupe">
          Klik swatch untuk menyalin kode HEX
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {colors.map((c) => (
          <div
            key={c.name}
            onClick={() => handleCopy(c.hex)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-hk-champagne/40 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-hk-taupe hover:shadow-md cursor-pointer"
          >
            <div
              className={`h-36 w-full rounded-xl ${c.class} relative flex items-end justify-end p-3 transition-transform group-hover:scale-[1.02]`}
            >
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-manrope font-semibold text-hk-charcoal backdrop-blur-sm">
                {copiedColor === c.hex ? (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Check className="h-3 w-3" /> Tersalin
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="h-3 w-3" /> Salin
                  </span>
                )}
              </span>
            </div>
            <div className="pt-3 pb-1">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-xl font-medium text-hk-charcoal">
                  {c.name}
                </h3>
                <code className="font-mono text-xs font-bold text-hk-taupe">
                  {c.hex}
                </code>
              </div>
              <p className="mt-0.5 text-[11px] font-mono text-hk-charcoal/60">
                RGB: {c.rgb}
              </p>
              <p className="mt-2 text-xs font-manrope text-hk-charcoal/80 line-clamp-2">
                {c.usage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
