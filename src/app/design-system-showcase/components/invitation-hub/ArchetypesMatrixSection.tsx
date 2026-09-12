'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, ChevronRight, Bookmark, Heart, ShieldCheck } from 'lucide-react';
import { ARCHETYPES_CONFIG, ArchetypeConfig } from '../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

export function ArchetypesMatrixSection() {
  const [selectedId, setSelectedId] = useState<string>('botanical');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const activeArchetype =
    ARCHETYPES_CONFIG.find((a) => a.id === selectedId) || ARCHETYPES_CONFIG[0];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section id="archetypes" className="scroll-mt-24">
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-2 border-b border-hk-champagne/40 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Sparkles className="h-5 w-5" />
            <span className="font-manrope text-xs font-bold uppercase tracking-widest">
              Bespoke Individuality
            </span>
          </div>
          <h2 className="mt-1 font-editorial text-3xl font-normal text-hk-charcoal">
            Matriks 8 Arketipe Mandiri (Anti Cookie-Cutter)
          </h2>
        </div>
        <p className="font-manrope text-xs text-hk-taupe max-w-md text-left md:text-right">
          Setiap arketipe memiliki identitas visual unik: geometri sudut kartu, palet aksen turunan, dan paduan tipografi khusus.
        </p>
      </div>

      {/* 8 Archetypes Tab Selector */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {ARCHETYPES_CONFIG.map((archetype) => {
          const isSelected = archetype.id === selectedId;
          return (
            <button
              key={archetype.id}
              onClick={() => setSelectedId(archetype.id)}
              className={cn(
                'group relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200',
                isSelected
                  ? 'border-hk-taupe bg-white shadow-md ring-2 ring-hk-taupe/20 -translate-y-0.5'
                  : 'border-hk-champagne/40 bg-white/70 hover:bg-white hover:border-hk-champagne'
              )}
            >
              {/* Color Dot Accent Indicator */}
              <div className="flex items-center gap-1.5 mb-2 w-full">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: archetype.accentColor }}
                />
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: archetype.secondaryAccent }}
                />
              </div>

              <span className="font-editorial text-base font-medium text-hk-charcoal leading-snug">
                {archetype.name.split(' ')[0]}
              </span>
              <span className="font-manrope text-[10px] text-hk-charcoal/60 truncate w-full">
                {archetype.subtitle.split(',')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Archetype Inspector & Interactive Mock Card */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Panel: Token Details (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-hk-champagne/40 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-hk-soft-beige/80 px-3 py-1 font-manrope text-xs font-bold uppercase tracking-wider text-hk-taupe">
                Arketipe Terpilih
              </span>
              <h3 className="mt-2 font-editorial text-3xl text-hk-charcoal">
                {activeArchetype.name}
              </h3>
              <p className="font-editorial text-lg italic text-hk-taupe">
                {activeArchetype.subtitle}
              </p>
            </div>
            <span className="rounded-lg border border-hk-champagne/50 bg-hk-ivory px-3 py-1.5 font-manrope text-xs font-semibold text-hk-charcoal">
              {activeArchetype.geometryBadge}
            </span>
          </div>

          <p className="font-manrope text-sm leading-relaxed text-hk-charcoal/80">
            {activeArchetype.description}
          </p>

          {/* Color Tokens Swatches */}
          <div className="border-t border-hk-soft-beige pt-5">
            <span className="font-manrope text-xs font-bold uppercase tracking-wider text-hk-charcoal/70">
              Palet Turunan &amp; Kontras Permukaan:
            </span>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Primary Accent */}
              <div
                onClick={() => handleCopy(activeArchetype.accentColor)}
                className="group p-2.5 rounded-xl border border-hk-champagne/40 bg-hk-ivory cursor-pointer hover:border-hk-taupe transition-colors"
              >
                <div
                  className="h-10 w-full rounded-lg mb-2 shadow-inner flex items-end justify-end p-1"
                  style={{ backgroundColor: activeArchetype.accentColor }}
                >
                  <span className="rounded bg-white/80 p-0.5 text-[9px]">
                    {copiedHex === activeArchetype.accentColor ? (
                      <Check className="h-3 w-3 text-emerald-700" />
                    ) : (
                      <Copy className="h-3 w-3 text-hk-charcoal" />
                    )}
                  </span>
                </div>
                <span className="block font-manrope text-[10px] text-hk-charcoal/70">
                  Aksen Primer
                </span>
                <code className="font-mono text-xs font-bold text-hk-charcoal">
                  {activeArchetype.accentColor}
                </code>
              </div>

              {/* Secondary Accent */}
              <div
                onClick={() => handleCopy(activeArchetype.secondaryAccent)}
                className="group p-2.5 rounded-xl border border-hk-champagne/40 bg-hk-ivory cursor-pointer hover:border-hk-taupe transition-colors"
              >
                <div
                  className="h-10 w-full rounded-lg mb-2 shadow-inner flex items-end justify-end p-1"
                  style={{ backgroundColor: activeArchetype.secondaryAccent }}
                >
                  <span className="rounded bg-white/80 p-0.5 text-[9px]">
                    {copiedHex === activeArchetype.secondaryAccent ? (
                      <Check className="h-3 w-3 text-emerald-700" />
                    ) : (
                      <Copy className="h-3 w-3 text-hk-charcoal" />
                    )}
                  </span>
                </div>
                <span className="block font-manrope text-[10px] text-hk-charcoal/70">
                  Aksen Sekunder
                </span>
                <code className="font-mono text-xs font-bold text-hk-charcoal">
                  {activeArchetype.secondaryAccent}
                </code>
              </div>

              {/* Surface Canvas */}
              <div
                onClick={() => handleCopy(activeArchetype.surfaceColor)}
                className="group p-2.5 rounded-xl border border-hk-champagne/40 bg-hk-ivory cursor-pointer hover:border-hk-taupe transition-colors"
              >
                <div
                  className="h-10 w-full rounded-lg mb-2 shadow-inner border border-black/5 flex items-end justify-end p-1"
                  style={{ backgroundColor: activeArchetype.surfaceColor }}
                >
                  <span className="rounded bg-white/80 p-0.5 text-[9px]">
                    {copiedHex === activeArchetype.surfaceColor ? (
                      <Check className="h-3 w-3 text-emerald-700" />
                    ) : (
                      <Copy className="h-3 w-3 text-hk-charcoal" />
                    )}
                  </span>
                </div>
                <span className="block font-manrope text-[10px] text-hk-charcoal/70">
                  Permukaan Card
                </span>
                <code className="font-mono text-xs font-bold text-hk-charcoal">
                  {activeArchetype.surfaceColor}
                </code>
              </div>

              {/* Text / Ink */}
              <div
                onClick={() => handleCopy(activeArchetype.textColor)}
                className="group p-2.5 rounded-xl border border-hk-champagne/40 bg-hk-ivory cursor-pointer hover:border-hk-taupe transition-colors"
              >
                <div
                  className="h-10 w-full rounded-lg mb-2 shadow-inner flex items-end justify-end p-1"
                  style={{ backgroundColor: activeArchetype.textColor }}
                >
                  <span className="rounded bg-white/80 p-0.5 text-[9px]">
                    {copiedHex === activeArchetype.textColor ? (
                      <Check className="h-3 w-3 text-emerald-700" />
                    ) : (
                      <Copy className="h-3 w-3 text-hk-charcoal" />
                    )}
                  </span>
                </div>
                <span className="block font-manrope text-[10px] text-hk-charcoal/70">
                  Teks / Tinta
                </span>
                <code className="font-mono text-xs font-bold text-hk-charcoal">
                  {activeArchetype.textColor}
                </code>
              </div>
            </div>
          </div>

          {/* Typography & Assets Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-hk-soft-beige pt-5">
            <div>
              <span className="font-manrope text-xs font-bold uppercase tracking-wider text-hk-charcoal/70">
                Pasangan Tipografi:
              </span>
              <p className="mt-1 font-editorial text-base text-hk-charcoal">
                {activeArchetype.recommendedFontPair.heading}
              </p>
              <p className="font-manrope text-xs text-hk-taupe">
                + {activeArchetype.recommendedFontPair.body}
              </p>
            </div>

            <div>
              <span className="font-manrope text-xs font-bold uppercase tracking-wider text-hk-charcoal/70">
                Aset Vektor Kunci:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {activeArchetype.keyAssets.map((assetName, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-hk-soft-beige/70 px-2 py-0.5 font-manrope text-[11px] text-hk-charcoal"
                  >
                    {assetName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Mini Mock Card Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full text-center mb-2">
            <span className="font-manrope text-xs font-semibold text-hk-taupe uppercase tracking-wider">
              ✦ Live Archetype Token Preview Card
            </span>
          </div>

          {/* Dynamically Styled Archetype Card */}
          <div
            className="w-full max-w-[360px] p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            style={{
              backgroundColor: activeArchetype.surfaceColor,
              color: activeArchetype.textColor,
              borderRadius: activeArchetype.cornerRadius,
              border: `1.5px solid ${activeArchetype.accentColor}`,
              boxShadow: `0 10px 30px -10px ${activeArchetype.accentColor}33`,
            }}
          >
            {/* Top Monogram / Header Badge */}
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: `${activeArchetype.accentColor}33` }}>
              <span className="font-manrope text-[11px] uppercase tracking-widest font-semibold" style={{ color: activeArchetype.accentColor }}>
                The Wedding Celebration
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: `${activeArchetype.accentColor}18`, color: activeArchetype.accentColor }}>
                24.10.2026
              </span>
            </div>

            {/* Names in Cormorant Garamond */}
            <div className="my-4 text-center">
              <h4 className="font-editorial text-3xl font-medium tracking-wide">
                Aditya &amp; Ratna
              </h4>
              <p className="mt-1 font-editorial text-sm italic opacity-85" style={{ color: activeArchetype.accentColor }}>
                "Menyelaraskan Restu &amp; Impian di Kebumen"
              </p>
            </div>

            {/* Quote excerpt */}
            <div className="my-3 rounded-lg p-3 text-center text-xs leading-relaxed opacity-90" style={{ backgroundColor: `${activeArchetype.secondaryAccent}22` }}>
              <p className="italic font-editorial text-sm">
                "Dan di antara tanda-tanda kekuasaan-Nya diciptakan-Nya pasangan untukmu..."
              </p>
              <span className="block mt-1 font-manrope text-[10px] font-bold uppercase tracking-wider" style={{ color: activeArchetype.accentColor }}>
                QS. Ar-Rum: 21
              </span>
            </div>

            {/* Bottom Details & Button */}
            <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: `${activeArchetype.accentColor}33` }}>
              <span className="font-manrope text-[11px] font-medium opacity-80">
                Kabupaten Kebumen
              </span>
              <button
                className="px-3 py-1.5 rounded-md text-[11px] font-manrope font-semibold transition-transform active:scale-95 text-white shadow-xs"
                style={{ backgroundColor: activeArchetype.accentColor }}
              >
                Buka Undangan
              </button>
            </div>
          </div>
          <p className="mt-3 text-center font-manrope text-[11px] text-hk-charcoal/60">
            * Geometri kartu, border, dan palet di atas berubah otomatis mengikuti arketipe yang Anda klik.
          </p>
        </div>
      </div>
    </section>
  );
}
