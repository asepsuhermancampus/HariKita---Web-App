'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Layers,
  Film,
  Camera,
  Heart,
} from 'lucide-react';
import { SANDBOX_GALLERY_PHOTOS } from '../../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

export type GalleryStyle =
  | 'bento'
  | 'marquee'
  | 'deck'
  | 'polaroid'
  | 'filmstrip'
  | 'arch'
  | 'accordion'
  | 'orbit';

interface SandboxGalleryViewerProps {
  accentColor: string;
}

export function SandboxGalleryViewer({ accentColor }: SandboxGalleryViewerProps) {
  const [activeStyle, setActiveStyle] = useState<GalleryStyle>('bento');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [deckIndex, setDeckIndex] = useState<number>(0);
  const [archIndex, setArchIndex] = useState<number>(0);
  const [orbitIndex, setOrbitIndex] = useState<number>(0);
  const [accordionHover, setAccordionHover] = useState<number | null>(0);
  const [isMarqueePaused, setIsMarqueePaused] = useState<boolean>(false);

  const photos = SANDBOX_GALLERY_PHOTOS; // 10 photos available

  const styleOptions: { id: GalleryStyle; label: string; count: string }[] = [
    { id: 'bento', label: '1. Luxury Bento Grid', count: '7 Foto + Kutipan' },
    { id: 'marquee', label: '2. Infinite Running Marquee', count: '10 Foto Roll' },
    { id: 'deck', label: '3. 3D Stacked Deck Swipe', count: '7 Foto Bertumpuk' },
    { id: 'polaroid', label: '4. Polaroid Pinboard', count: '8 Foto Polaroid' },
    { id: 'filmstrip', label: '5. Cinema Film Strip 35mm', count: '8 Frame Film' },
    { id: 'arch', label: '6. Arch Portal Carousel', count: '8 Portal + Rail' },
    { id: 'accordion', label: '7. Architectural Accordion', count: '7 Bilah Foto' },
    { id: 'orbit', label: '8. Celestial Orbit Sphere', count: '7 Satelit Orbit' },
  ];

  return (
    <div className="rounded-2xl border border-hk-champagne/40 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
      {/* Playground Header */}
      <div className="mb-6 flex flex-col gap-3 border-b border-hk-soft-beige pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-[11px] font-bold uppercase tracking-wider text-hk-taupe">
              Galeri Pengantin Studio &amp; Outdoor Kebumen
            </span>
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 font-manrope text-[10px] font-bold text-emerald-800">
              Min. 7 Foto Terpasang
            </span>
          </div>
          <h3 className="mt-1 font-editorial text-2xl text-hk-charcoal">
            Live Simulator 8 Gaya Galeri
          </h3>
        </div>
        <span className="font-manrope text-xs text-hk-taupe">
          Klik foto mana saja untuk membuka <strong>Lightbox Fullscreen</strong>
        </span>
      </div>

      {/* Style Selector Chips with Responsive Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-2 px-2 no-scrollbar sm:flex-wrap sm:overflow-visible sm:pb-0 mb-6">
        {styleOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveStyle(opt.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-manrope font-semibold transition-all flex items-center gap-1.5',
              activeStyle === opt.id
                ? 'text-white shadow-xs'
                : 'bg-hk-ivory text-hk-charcoal/80 border border-hk-champagne/40 hover:border-hk-taupe'
            )}
            style={{
              backgroundColor: activeStyle === opt.id ? accentColor : undefined,
            }}
          >
            <span>{opt.label}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[9px] font-bold',
                activeStyle === opt.id ? 'bg-white/20 text-white' : 'bg-hk-soft-beige text-hk-taupe'
              )}
            >
              {opt.count}
            </span>
          </button>
        ))}
      </div>

      {/* RENDER SELECTED GALLERY STYLE CONTAINER */}
      <div className="relative min-h-[440px] rounded-xl border border-hk-champagne/30 bg-hk-ivory/50 p-3 sm:p-5 md:p-6 overflow-hidden flex items-center justify-center">
        {/* ========================================================= */}
        {/* 1. LUXURY BENTO GRID (7 PHOTOS + 1 QUOTE CARD)           */}
        {/* ========================================================= */}
        {activeStyle === 'bento' && (
          <div className="w-full max-w-5xl">
            <div className="mb-3 flex items-center justify-between text-xs font-manrope text-hk-charcoal/70">
              <span className="font-bold uppercase tracking-wider text-hk-taupe">
                ✦ Susunan Modular 7 Foto Prewedding + Kartu Kutipan
              </span>
              <span>7 Foto Tampil</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Photo 1: Big Hero (2 cols, 2 rows on desktop) */}
              <div
                onClick={() => setLightboxPhoto(photos[0].src)}
                className="group relative sm:col-span-2 sm:row-span-2 h-72 sm:h-auto min-h-[260px] overflow-hidden rounded-2xl border border-hk-champagne/50 shadow-sm cursor-pointer"
              >
                <img
                  src={photos[0].src}
                  alt={photos[0].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="font-manrope text-[10px] uppercase tracking-widest text-hk-champagne">
                    {photos[0].subtitle}
                  </span>
                  <h4 className="font-editorial text-2xl font-normal">{photos[0].title}</h4>
                </div>
              </div>

              {/* Photo 2 */}
              <div
                onClick={() => setLightboxPhoto(photos[1].src)}
                className="group relative h-44 sm:h-48 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-xs cursor-pointer"
              >
                <img
                  src={photos[1].src}
                  alt={photos[1].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-manrope text-white backdrop-blur-xs">
                  {photos[1].title}
                </div>
              </div>

              {/* Bento Poetry Quote Card */}
              <div
                className="flex flex-col justify-between rounded-2xl border border-hk-champagne/50 p-4 sm:p-5 text-white shadow-sm min-h-[170px]"
                style={{ backgroundColor: accentColor }}
              >
                <span className="font-editorial text-3xl opacity-60">“</span>
                <p className="font-editorial text-base sm:text-lg italic leading-snug">
                  "Di antara debur ombak Menganti, dua hati berlabuh dalam kepastian restu."
                </p>
                <span className="font-manrope text-[10px] uppercase tracking-widest opacity-80">
                  Aditya &amp; Ratna
                </span>
              </div>

              {/* Photo 3 */}
              <div
                onClick={() => setLightboxPhoto(photos[2].src)}
                className="group relative h-44 sm:h-48 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-xs cursor-pointer"
              >
                <img
                  src={photos[2].src}
                  alt={photos[2].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-manrope text-white backdrop-blur-xs">
                  {photos[2].title}
                </div>
              </div>

              {/* Photo 4 */}
              <div
                onClick={() => setLightboxPhoto(photos[3].src)}
                className="group relative h-44 sm:h-48 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-xs cursor-pointer"
              >
                <img
                  src={photos[3].src}
                  alt={photos[3].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-manrope text-white backdrop-blur-xs">
                  {photos[3].title}
                </div>
              </div>

              {/* Photo 5: Wide Landscape */}
              <div
                onClick={() => setLightboxPhoto(photos[4].src)}
                className="group relative sm:col-span-2 h-44 sm:h-52 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-xs cursor-pointer"
              >
                <img
                  src={photos[4].src}
                  alt={photos[4].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-manrope text-white backdrop-blur-xs">
                  {photos[4].title} • {photos[4].subtitle}
                </div>
              </div>

              {/* Photo 6 */}
              <div
                onClick={() => setLightboxPhoto(photos[5].src)}
                className="group relative h-44 sm:h-52 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-xs cursor-pointer"
              >
                <img
                  src={photos[5].src}
                  alt={photos[5].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-manrope text-white backdrop-blur-xs">
                  {photos[5].title}
                </div>
              </div>

              {/* Photo 7 */}
              <div
                onClick={() => setLightboxPhoto(photos[6].src)}
                className="group relative h-44 sm:h-52 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-xs cursor-pointer"
              >
                <img
                  src={photos[6].src}
                  alt={photos[6].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-manrope text-white backdrop-blur-xs">
                  {photos[6].title}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. INFINITE RUNNING MARQUEE (ALL 10 PHOTOS)               */}
        {/* ========================================================= */}
        {activeStyle === 'marquee' && (
          <div
            className="w-full overflow-hidden relative cursor-pointer py-4"
            onMouseEnter={() => setIsMarqueePaused(true)}
            onMouseLeave={() => setIsMarqueePaused(false)}
            onTouchStart={() => setIsMarqueePaused(true)}
            onTouchEnd={() => setIsMarqueePaused(false)}
          >
            <div className="mb-3 flex items-center justify-between text-xs font-manrope text-hk-charcoal/70 px-2">
              <span className="flex items-center gap-1.5 font-semibold text-hk-taupe">
                {isMarqueePaused ? (
                  <Pause className="h-3.5 w-3.5 text-hk-taupe" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-hk-taupe animate-pulse" />
                )}
                {isMarqueePaused
                  ? 'Animasi Dijeda (Sentuh / Hover Aktif)'
                  : 'Berputar Otomatis (Sentuh / Arahkan Kursor untuk Jeda)'}
              </span>
              <span className="font-mono text-[11px]">10 Foto Prewedding Berjalan</span>
            </div>

            <div
              className={cn(
                'flex gap-3 sm:gap-4 w-max',
                isMarqueePaused ? '' : 'animate-[marquee_30s_linear_infinite]'
              )}
            >
              {[...photos, ...photos].map((photo, idx) => (
                <div
                  key={`${photo.id}-${idx}`}
                  onClick={() => setLightboxPhoto(photo.src)}
                  className="group relative h-60 w-44 sm:h-72 sm:w-52 shrink-0 overflow-hidden rounded-2xl border border-hk-champagne/50 bg-white shadow-sm"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3.5 text-white">
                    <span className="font-manrope text-[9px] uppercase tracking-wider text-hk-champagne">
                      HK-{String((idx % 10) + 1).padStart(2, '0')}
                    </span>
                    <span className="font-editorial text-base truncate">{photo.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. 3D STACKED DECK SWIPE (7 STACKED CARDS)                */}
        {/* ========================================================= */}
        {activeStyle === 'deck' && (
          <div className="flex flex-col items-center justify-center py-4 w-full">
            <div className="relative h-80 sm:h-96 w-64 sm:w-72">
              {photos.slice(0, 7).map((photo, idx) => {
                const diff = (idx - deckIndex + 7) % 7;
                const isTop = diff === 0;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (isTop) setLightboxPhoto(photo.src);
                      else setDeckIndex(idx);
                    }}
                    className={cn(
                      'absolute inset-0 rounded-2xl border bg-white p-3 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between',
                      isTop
                        ? 'z-30 scale-100 rotate-0 filter-none border-hk-taupe'
                        : diff === 1
                        ? 'z-20 scale-95 translate-y-3 rotate-2 blur-[1px] opacity-85 border-hk-champagne/60'
                        : diff === 2
                        ? 'z-10 scale-90 translate-y-6 -rotate-2 blur-[2px] opacity-70 border-hk-champagne/40'
                        : diff === 3
                        ? 'z-5 scale-85 translate-y-9 rotate-3 blur-[3px] opacity-50 border-hk-champagne/30'
                        : 'z-0 scale-80 translate-y-12 -rotate-3 blur-[4px] opacity-30 border-hk-champagne/20'
                    )}
                  >
                    <div className="h-[210px] sm:h-[260px] w-full overflow-hidden rounded-xl">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="font-editorial text-base sm:text-lg text-hk-charcoal leading-tight">
                        {photo.title}
                      </p>
                      <span className="font-manrope text-[10px] text-hk-taupe">
                        {photo.subtitle} • Kartu #{idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deck Navigation Controls */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setDeckIndex((d) => (d - 1 + 7) % 7)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal hover:bg-hk-soft-beige shadow-xs transition-transform active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* 7 Dot Indicators */}
              <div className="flex items-center gap-1.5 px-2">
                {photos.slice(0, 7).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDeckIndex(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      deckIndex === i ? 'w-5 bg-hk-taupe' : 'w-2 bg-hk-champagne/50'
                    )}
                  />
                ))}
              </div>

              <button
                onClick={() => setDeckIndex((d) => (d + 1) % 7)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal hover:bg-hk-soft-beige shadow-xs transition-transform active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="mt-2 font-manrope text-[11px] text-hk-charcoal/60">
              Kartu {deckIndex + 1} dari 7 Foto Bertumpuk (Ketuk kartu untuk geser / klik kartu depan untuk Lightbox)
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. POLAROID PINBOARD (8 POLAROID PHOTOS)                  */}
        {/* ========================================================= */}
        {activeStyle === 'polaroid' && (
          <div className="w-full max-w-5xl">
            <div className="mb-3 flex items-center justify-between text-xs font-manrope text-hk-charcoal/70">
              <span className="font-bold uppercase tracking-wider text-hk-taupe">
                ✦ Pinboard Dinding 8 Foto Polaroid Berwashi Tape
              </span>
              <span>8 Foto Tampil</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-2">
              {photos.slice(0, 8).map((photo, idx) => {
                const rotations = [
                  '-rotate-2',
                  'rotate-2',
                  '-rotate-1',
                  'rotate-3',
                  'rotate-1',
                  '-rotate-3',
                  'rotate-2',
                  '-rotate-2',
                ];
                return (
                  <div
                    key={photo.id}
                    onClick={() => setLightboxPhoto(photo.src)}
                    className={cn(
                      'group relative rounded-sm border border-hk-champagne/40 bg-white p-2.5 pb-6 sm:p-3 sm:pb-8 shadow-md transition-all hover:scale-105 hover:z-20 cursor-pointer',
                      rotations[idx % rotations.length]
                    )}
                  >
                    {/* Washi Tape Accent */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-12 sm:h-5 sm:w-16 bg-[#E8DED1]/80 border border-black/5 shadow-xs rotate-1" />

                    <div className="h-36 sm:h-44 w-full overflow-hidden bg-hk-ivory">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 text-center font-editorial text-xs sm:text-sm italic text-hk-charcoal truncate px-1">
                      "{photo.title}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. CINEMA FILM STRIP 35MM (8 FRAMES ROLL)                 */}
        {/* ========================================================= */}
        {activeStyle === 'filmstrip' && (
          <div className="w-full py-2">
            <div className="mb-3 flex items-center justify-between text-xs font-manrope text-hk-charcoal/70 px-1">
              <span className="font-bold uppercase tracking-wider text-hk-taupe">
                ✦ Rol Film Sinematik 35mm (Geser Horizontal untuk Melihat 8 Frame)
              </span>
              <span>8 Frame Film</span>
            </div>

            <div className="w-full overflow-x-auto pb-4 no-scrollbar">
              <div className="flex bg-[#1A1A1A] p-4 rounded-2xl border border-hk-charcoal shadow-2xl w-max gap-4 items-center">
                {photos.slice(0, 8).map((photo, idx) => (
                  <div key={photo.id} className="flex flex-col items-center">
                    {/* Top Sprockets */}
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="h-2 w-3 rounded-xs bg-white/20" />
                      ))}
                    </div>

                    {/* Frame Container */}
                    <div
                      onClick={() => setLightboxPhoto(photo.src)}
                      className="relative h-44 w-56 sm:h-52 sm:w-64 overflow-hidden border-2 border-white/25 bg-black cursor-pointer group rounded-xs"
                    >
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100 group-hover:scale-105 duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5 text-white">
                        <span className="font-editorial text-xs sm:text-sm truncate max-w-[140px]">
                          {photo.title}
                        </span>
                        <span className="font-mono text-[9px] text-white/80 bg-white/10 px-1.5 py-0.5 rounded">
                          HK-35MM #{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Sprockets */}
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="h-2 w-3 rounded-xs bg-white/20" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. ARCH PORTAL CAROUSEL (8 PORTALS + THUMBNAIL RAIL)      */}
        {/* ========================================================= */}
        {activeStyle === 'arch' && (
          <div className="flex flex-col items-center py-2 w-full max-w-2xl">
            <div className="mb-2 text-center text-xs font-manrope text-hk-taupe font-bold uppercase tracking-wider">
              ✦ Gerbang Kasunanan Utama &amp; Jalur Thumbnail 8 Foto
            </div>

            {/* Main Center Arch */}
            <div className="relative flex items-center justify-center gap-3 sm:gap-6 w-full">
              <button
                onClick={() => setArchIndex((a) => (a - 1 + 8) % 8)}
                className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal shadow-sm hover:bg-hk-soft-beige transition-transform active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div
                onClick={() => setLightboxPhoto(photos[archIndex].src)}
                className="relative h-72 sm:h-96 w-56 sm:w-72 overflow-hidden rounded-t-[120px] sm:rounded-t-[140px] rounded-b-2xl border-2 border-hk-champagne shadow-2xl cursor-pointer group"
              >
                <img
                  src={photos[archIndex].src}
                  alt={photos[archIndex].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-5 text-white text-center">
                  <span className="font-manrope text-[9px] uppercase tracking-widest text-hk-champagne">
                    Arch Kasunanan #{archIndex + 1}
                  </span>
                  <h4 className="font-editorial text-xl sm:text-2xl">{photos[archIndex].title}</h4>
                  <span className="font-manrope text-[11px] text-white/80">{photos[archIndex].subtitle}</span>
                </div>
              </div>

              <button
                onClick={() => setArchIndex((a) => (a + 1) % 8)}
                className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal shadow-sm hover:bg-hk-soft-beige transition-transform active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* 8 Thumbnail Rail Below */}
            <div className="mt-5 w-full flex items-center justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
              {photos.slice(0, 8).map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setArchIndex(i)}
                  className={cn(
                    'relative h-14 w-11 sm:h-16 sm:w-12 shrink-0 overflow-hidden rounded-t-xl rounded-b-md border transition-all',
                    archIndex === i
                      ? 'border-2 border-hk-taupe ring-2 ring-hk-taupe/30 scale-105 shadow-md'
                      : 'border-hk-champagne/50 opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={photo.src} alt={photo.title} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <span className="mt-1 font-manrope text-[11px] text-hk-charcoal/60">
              Menampilkan Portal {archIndex + 1} dari 8 Foto (Pilih thumbnail di atas untuk beralih instan)
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. ARCHITECTURAL ACCORDION (7 PHOTO PANELS)               */}
        {/* ========================================================= */}
        {activeStyle === 'accordion' && (
          <div className="w-full max-w-5xl py-2">
            <div className="mb-3 flex items-center justify-between text-xs font-manrope text-hk-charcoal/70">
              <span className="font-bold uppercase tracking-wider text-hk-taupe">
                ✦ 7 Bilah Arsitektural Vertikal (Sentuh / Hover untuk Melebarkan Foto)
              </span>
              <span>7 Bilah Foto</span>
            </div>

            {/* Desktop / Tablet Accordion */}
            <div className="hidden sm:flex h-80 sm:h-96 w-full gap-2 overflow-hidden rounded-2xl border border-hk-champagne/40 bg-white p-2.5">
              {photos.slice(0, 7).map((photo, idx) => {
                const isHovered = accordionHover === idx;
                return (
                  <div
                    key={photo.id}
                    onMouseEnter={() => setAccordionHover(idx)}
                    onClick={() => setLightboxPhoto(photo.src)}
                    className={cn(
                      'group relative h-full rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out',
                      isHovered ? 'flex-[4]' : 'flex-1'
                    )}
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="h-full w-full object-cover"
                    />
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white transition-opacity duration-300',
                        isHovered ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      <span className="font-manrope text-[9px] uppercase tracking-widest text-hk-champagne">
                        Bilah #{idx + 1}
                      </span>
                      <h4 className="font-editorial text-xl">{photo.title}</h4>
                      <p className="font-manrope text-xs text-white/80">{photo.subtitle}</p>
                    </div>

                    {/* Vertical Slice Label when collapsed */}
                    {!isHovered && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                        <span className="font-editorial text-xs text-white [writing-mode:vertical-lr] rotate-180 tracking-widest truncate">
                          {photo.title}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Touch-Friendly Stream for Accordion */}
            <div className="sm:hidden flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {photos.slice(0, 7).map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo.src)}
                  className="relative h-64 w-44 shrink-0 rounded-xl overflow-hidden border border-hk-champagne/50 shadow-xs"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                    <span className="font-manrope text-[9px] uppercase text-hk-champagne">
                      Bilah #{idx + 1}
                    </span>
                    <h5 className="font-editorial text-sm truncate">{photo.title}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. CELESTIAL ORBIT SPHERE (7 ORBITING SATELLITES)          */}
        {/* ========================================================= */}
        {activeStyle === 'orbit' && (
          <div className="relative flex flex-col items-center justify-center py-4 w-full max-w-xl">
            <div className="mb-2 text-center text-xs font-manrope text-hk-taupe font-bold uppercase tracking-wider">
              ✦ 7 Satelit Foto Kosmik Mengorbit Foto Fokus Tengah
            </div>

            {/* Orbit Ring Layout */}
            <div className="relative flex h-72 sm:h-88 w-72 sm:w-88 items-center justify-center rounded-full border-2 border-dashed border-[#D4AF37]/50 p-4">
              {/* Spinning Star Track */}
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/25 animate-[spin_35s_linear_infinite]" />

              {/* Center Focal Photo */}
              <div
                onClick={() => setLightboxPhoto(photos[orbitIndex].src)}
                className="relative h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-full border-4 border-white shadow-2xl cursor-pointer group z-10"
              >
                <img
                  src={photos[orbitIndex].src}
                  alt={photos[orbitIndex].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3 text-center">
                  <Maximize2 className="h-5 w-5 mb-1" />
                  <span className="font-editorial text-sm">{photos[orbitIndex].title}</span>
                </div>
              </div>

              {/* 7 Orbiting Satellite Thumbnails (placed symmetrically in ring) */}
              {photos.slice(0, 7).map((satPhoto, idx) => {
                const angle = (idx * 360) / 7;
                const radius = 125; // radius in px for orbit
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;

                return (
                  <button
                    key={satPhoto.id}
                    onClick={() => setOrbitIndex(idx)}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    title={`Pilih ${satPhoto.title}`}
                    className={cn(
                      'absolute h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 shadow-lg transition-all duration-300 z-20',
                      orbitIndex === idx
                        ? 'border-hk-taupe ring-4 ring-hk-taupe/30 scale-125'
                        : 'border-[#D4AF37] hover:scale-115 opacity-80 hover:opacity-100'
                    )}
                  >
                    <img src={satPhoto.src} alt={satPhoto.title} className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>

            {/* Orbit Navigation Controls Below */}
            <div className="mt-5 text-center">
              <h4 className="font-editorial text-xl sm:text-2xl text-hk-charcoal">
                {photos[orbitIndex].title}
              </h4>
              <p className="font-manrope text-xs text-hk-taupe mt-0.5">
                {photos[orbitIndex].subtitle} • Satelit #{orbitIndex + 1} dari 7 Foto Kosmik
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {photos.slice(0, 7).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setOrbitIndex(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      orbitIndex === i ? 'w-5 bg-hk-taupe' : 'w-2 bg-hk-champagne/50'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX FULLSCREEN MODAL */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-h-[92vh] max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxPhoto}
              alt="Lightbox Preview"
              className="max-h-[85vh] w-auto rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
