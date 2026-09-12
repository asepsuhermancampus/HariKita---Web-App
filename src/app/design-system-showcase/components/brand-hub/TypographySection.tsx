'use client';

import React from 'react';
import { Type } from 'lucide-react';

export function TypographySection() {
  return (
    <section id="typography" className="scroll-mt-24">
      <div className="mb-8 flex items-center justify-between border-b border-hk-champagne/40 pb-4">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Type className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Editorial Hierarchy
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Typography Specimen
          </h2>
        </div>
        <span className="font-manrope text-xs text-hk-taupe">
          Cormorant Garamond + Manrope
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Display Font */}
        <div className="rounded-2xl border border-hk-champagne/40 bg-white p-8 shadow-sm">
          <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-xs font-bold uppercase tracking-wider text-hk-taupe">
            Display &amp; Headings
          </span>
          <h3 className="mt-4 font-editorial text-4xl text-hk-charcoal">
            Cormorant Garamond
          </h3>
          <p className="mt-2 font-editorial text-lg italic text-hk-taupe">
            Elegan, hangat, dan sarat kehormatan adat &amp; keanggunan modern.
          </p>

          <div className="mt-6 space-y-4 border-t border-hk-soft-beige pt-6">
            <div>
              <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                Display Title (60px)
              </span>
              <div className="font-editorial text-4xl md:text-5xl text-hk-charcoal leading-tight">
                Rangkai Hari Bahagiamu
              </div>
            </div>
            <div>
              <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                Heading 2 (36px)
              </span>
              <div className="font-editorial text-2xl md:text-3xl text-hk-charcoal">
                Menyelaraskan Restu &amp; Impian
              </div>
            </div>
            <div>
              <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                Editorial Italic (24px)
              </span>
              <div className="font-editorial text-xl md:text-2xl italic text-hk-taupe">
                "Dari Menganti hingga pusat Kebumen, setiap detail tertata sempurna."
              </div>
            </div>
          </div>
        </div>

        {/* Body Font */}
        <div className="rounded-2xl border border-hk-champagne/40 bg-white p-8 shadow-sm">
          <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-xs font-bold uppercase tracking-wider text-hk-taupe">
            UI &amp; Body Text
          </span>
          <h3 className="mt-4 font-manrope text-3xl font-bold text-hk-charcoal">
            Manrope
          </h3>
          <p className="mt-2 font-manrope text-sm text-hk-taupe">
            Modern, ergonomis, berkejelasan tinggi pada layar ponsel keluarga.
          </p>

          <div className="mt-6 space-y-4 border-t border-hk-soft-beige pt-6">
            <div>
              <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                Button &amp; Navigation (14px Bold / Uppercase)
              </span>
              <div className="font-manrope text-sm font-semibold tracking-wider text-hk-charcoal">
                MULAI SEKARANG • JELAJAHI VENDOR • BOOKING TANGGAL
              </div>
            </div>
            <div>
              <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                Body Regular (15px)
              </span>
              <p className="font-manrope text-sm leading-relaxed text-hk-charcoal/80">
                HariKita memberikan perlindungan rekening bersama (escrow) terpercaya,
                kontrak digital transparan, serta kurasi vendor lokal terbaik di Kebumen
                tanpa biaya tersembunyi.
              </p>
            </div>
            <div>
              <span className="font-manrope text-[11px] uppercase tracking-wider text-hk-champagne">
                Numerical Data &amp; Badges (12px SemiBold)
              </span>
              <div className="font-manrope text-xs font-semibold text-hk-taupe">
                IDR 15.000.000 • DP 30% H-30 • PELUNASAN H-7 ACARA
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
