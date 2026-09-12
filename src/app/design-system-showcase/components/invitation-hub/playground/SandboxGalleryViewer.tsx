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
} from 'lucide-react';
import { SANDBOX_GALLERY_PHOTOS } from '../../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

export type GalleryStyle =
  | 'marquee'
  | 'bento'
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
  const [isMarqueePaused, setIsMarqueePaused] = useState<boolean>(false);

  const photos = SANDBOX_GALLERY_PHOTOS;

  const styleOptions: { id: GalleryStyle; label: string; desc: string }[] = [
    { id: 'bento', label: '1. Luxury Bento Grid', desc: 'Modular asimetris diselingi kutipan cinta' },
    { id: 'marquee', label: '2. Infinite Running Marquee', desc: 'Foto bergerak horizontal mulus tanpa henti' },
    { id: 'deck', label: '3. 3D Stacked Deck Swipe', desc: 'Kartu bertumpuk dengan efek kedalaman' },
    { id: 'polaroid', label: '4. Polaroid Pinboard', desc: 'Kertas polaroid dengan selotip transparan' },
    { id: 'filmstrip', label: '5. Cinema Film Strip 35mm', desc: 'Rol pita sinematik dengan kode frame' },
    { id: 'arch', label: '6. Arch Portal Carousel', desc: 'Gerbang lengkung arsitektural berslide' },
    { id: 'accordion', label: '7. Architectural Accordion', desc: 'Kolom vertikal rapat yang melebar halus' },
    { id: 'orbit', label: '8. Celestial Orbit Sphere', desc: 'Foto lingkaran berputar kosmik lembut' },
  ];

  return (
    <div className="rounded-2xl border border-hk-champagne/40 bg-white p-6 md:p-8 shadow-sm">
      {/* Playground Header */}
      <div className="mb-6 flex flex-col gap-3 border-b border-hk-soft-beige pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="rounded-full bg-hk-soft-beige px-3 py-1 font-manrope text-[11px] font-bold uppercase tracking-wider text-hk-taupe">
            Galeri Pengantin Studio &amp; Outdoor Kebumen
          </span>
          <h3 className="mt-1 font-editorial text-2xl text-hk-charcoal">
            Live Simulator 8 Gaya Galeri
          </h3>
        </div>
        <span className="font-manrope text-xs text-hk-taupe">
          Klik foto mana saja untuk menguji <strong>Lightbox Fullscreen</strong>
        </span>
      </div>

      {/* Style Selector Chips */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {styleOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveStyle(opt.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-manrope font-semibold transition-all',
              activeStyle === opt.id
                ? 'text-white shadow-xs'
                : 'bg-hk-ivory text-hk-charcoal/80 border border-hk-champagne/40 hover:border-hk-taupe'
            )}
            style={{
              backgroundColor: activeStyle === opt.id ? accentColor : undefined,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* RENDER SELECTED GALLERY STYLE */}
      <div className="relative min-h-[420px] rounded-xl border border-hk-champagne/30 bg-hk-ivory/50 p-4 md:p-6 overflow-hidden flex items-center justify-center">
        {/* 1. LUXURY BENTO GRID */}
        {activeStyle === 'bento' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-5xl">
            {/* Big Hero Card */}
            <div
              onClick={() => setLightboxPhoto(photos[0].src)}
              className="group relative sm:col-span-2 sm:row-span-2 h-72 sm:h-auto min-h-[280px] overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-sm cursor-pointer"
            >
              <img
                src={photos[0].src}
                alt={photos[0].title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="font-manrope text-[10px] uppercase tracking-widest text-hk-champagne">
                  {photos[0].subtitle}
                </span>
                <h4 className="font-editorial text-2xl font-normal">{photos[0].title}</h4>
              </div>
            </div>

            {/* Photo 2 */}
            <div
              onClick={() => setLightboxPhoto(photos[1].src)}
              className="group relative h-48 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-sm cursor-pointer"
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

            {/* Typography Bento Quote Card */}
            <div
              className="flex flex-col justify-between rounded-2xl border border-hk-champagne/50 p-5 text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              <span className="font-editorial text-3xl opacity-60">“</span>
              <p className="font-editorial text-lg italic leading-snug">
                "Di antara debur ombak Menganti, dua hati berlabuh dalam kepastian."
              </p>
              <span className="font-manrope text-[10px] uppercase tracking-widest opacity-80">
                Aditya &amp; Ratna
              </span>
            </div>

            {/* Photo 3 */}
            <div
              onClick={() => setLightboxPhoto(photos[2].src)}
              className="group relative h-48 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-sm cursor-pointer"
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
              className="group relative h-48 overflow-hidden rounded-2xl border border-hk-champagne/40 shadow-sm cursor-pointer"
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
          </div>
        )}

        {/* 2. INFINITE RUNNING MARQUEE */}
        {activeStyle === 'marquee' && (
          <div
            className="w-full overflow-hidden relative cursor-pointer"
            onMouseEnter={() => setIsMarqueePaused(true)}
            onMouseLeave={() => setIsMarqueePaused(false)}
          >
            <div className="mb-2 flex items-center justify-between text-xs font-manrope text-hk-charcoal/70 px-2">
              <span className="flex items-center gap-1.5">
                {isMarqueePaused ? <Pause className="h-3.5 w-3.5 text-hk-taupe" /> : <Play className="h-3.5 w-3.5 text-hk-taupe animate-pulse" />}
                {isMarqueePaused ? 'Animasi Dijeda (Sentuh/Hover)' : 'Otomatis Berjalan (Arahkan Kursor untuk Jeda)'}
              </span>
              <span>8 Foto Prewedding</span>
            </div>

            <div
              className={cn(
                'flex gap-4 w-max',
                isMarqueePaused ? '' : 'animate-[marquee_25s_linear_infinite]'
              )}
            >
              {[...photos, ...photos].map((photo, idx) => (
                <div
                  key={`${photo.id}-${idx}`}
                  onClick={() => setLightboxPhoto(photo.src)}
                  className="group relative h-64 w-48 shrink-0 overflow-hidden rounded-xl border border-hk-champagne/40 bg-white shadow-sm"
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white">
                    <span className="font-editorial text-sm truncate">{photo.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 3D STACKED DECK SWIPE */}
        {activeStyle === 'deck' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-80 w-64">
              {photos.slice(0, 4).map((photo, idx) => {
                const diff = (idx - deckIndex + 4) % 4;
                const isTop = diff === 0;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (isTop) setLightboxPhoto(photo.src);
                      else setDeckIndex((d) => (d + 1) % 4);
                    }}
                    className={cn(
                      'absolute inset-0 rounded-2xl border border-hk-champagne/50 bg-white p-3 shadow-xl transition-all duration-300 cursor-pointer',
                      isTop
                        ? 'z-30 scale-100 rotate-0 filter-none'
                        : diff === 1
                        ? 'z-20 scale-95 translate-y-4 rotate-3 blur-[1.5px] opacity-80'
                        : diff === 2
                        ? 'z-10 scale-90 translate-y-8 -rotate-3 blur-[3px] opacity-60'
                        : 'z-0 scale-85 translate-y-12 rotate-6 blur-[5px] opacity-40'
                    )}
                  >
                    <div className="h-[210px] w-full overflow-hidden rounded-xl">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-editorial text-lg text-hk-charcoal">{photo.title}</p>
                      <span className="font-manrope text-[10px] text-hk-taupe">{photo.subtitle}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setDeckIndex((d) => (d - 1 + 4) % 4)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal hover:bg-hk-soft-beige"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-manrope text-xs font-semibold text-hk-charcoal">
                {deckIndex + 1} / 4 Kartu Bertumpuk
              </span>
              <button
                onClick={() => setDeckIndex((d) => (d + 1) % 4)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal hover:bg-hk-soft-beige"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4. POLAROID PINBOARD */}
        {activeStyle === 'polaroid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-4 w-full max-w-4xl">
            {photos.slice(0, 4).map((photo, idx) => {
              const rotations = ['-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2'];
              return (
                <div
                  key={photo.id}
                  onClick={() => setLightboxPhoto(photo.src)}
                  className={cn(
                    'group relative rounded-sm border border-hk-champagne/40 bg-white p-3 pb-8 shadow-md transition-all hover:scale-105 hover:z-20 cursor-pointer',
                    rotations[idx % rotations.length]
                  )}
                >
                  {/* Washi Tape Strip */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-16 bg-[#E8DED1]/70 border border-black/5 shadow-xs rotate-1" />

                  <div className="h-44 w-full overflow-hidden bg-hk-ivory">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 text-center font-editorial text-sm italic text-hk-charcoal">
                    "{photo.title}"
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. CINEMA FILM STRIP 35MM */}
        {activeStyle === 'filmstrip' && (
          <div className="w-full overflow-x-auto py-4">
            <div className="flex bg-[#1F1F1F] p-4 rounded-xl border border-hk-charcoal shadow-2xl w-max gap-4 items-center">
              {photos.map((photo, idx) => (
                <div key={photo.id} className="flex flex-col items-center">
                  {/* Top Sprocket Perforations */}
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="h-2.5 w-3.5 rounded-xs bg-white/20" />
                    ))}
                  </div>

                  {/* Film Frame */}
                  <div
                    onClick={() => setLightboxPhoto(photo.src)}
                    className="relative h-48 w-60 overflow-hidden border-2 border-white/20 bg-black cursor-pointer group"
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                    <span className="absolute bottom-1 right-2 font-mono text-[9px] text-white/80">
                      HK-35MM #{idx + 1}
                    </span>
                  </div>

                  {/* Bottom Sprocket Perforations */}
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="h-2.5 w-3.5 rounded-xs bg-white/20" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. ARCH PORTAL CAROUSEL */}
        {activeStyle === 'arch' && (
          <div className="flex flex-col items-center py-4 w-full">
            <div className="relative flex items-center justify-center gap-4 w-full max-w-xl">
              {/* Prev Button */}
              <button
                onClick={() => setArchIndex((a) => (a - 1 + photos.length) % photos.length)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal shadow-sm hover:bg-hk-soft-beige"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Center Arch Portal Card */}
              <div
                onClick={() => setLightboxPhoto(photos[archIndex].src)}
                className="relative h-96 w-72 overflow-hidden rounded-t-[140px] rounded-b-2xl border-2 border-hk-champagne shadow-xl cursor-pointer group"
              >
                <img
                  src={photos[archIndex].src}
                  alt={photos[archIndex].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white text-center">
                  <span className="font-manrope text-[10px] uppercase tracking-widest text-hk-champagne">
                    Arch Frame Kasunanan
                  </span>
                  <h4 className="font-editorial text-2xl">{photos[archIndex].title}</h4>
                  <span className="font-manrope text-xs text-white/80">{photos[archIndex].subtitle}</span>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setArchIndex((a) => (a + 1) % photos.length)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal shadow-sm hover:bg-hk-soft-beige"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <span className="mt-4 font-manrope text-xs font-semibold text-hk-taupe">
              0{archIndex + 1} / 0{photos.length} Portal Slide
            </span>
          </div>
        )}

        {/* 7. ARCHITECTURAL ACCORDION */}
        {activeStyle === 'accordion' && (
          <div className="flex h-80 w-full max-w-4xl gap-2 overflow-hidden rounded-2xl border border-hk-champagne/40 bg-white p-3">
            {photos.slice(0, 5).map((photo) => (
              <div
                key={photo.id}
                onClick={() => setLightboxPhoto(photo.src)}
                className="group relative h-full flex-1 overflow-hidden rounded-xl transition-all duration-500 ease-out hover:flex-[3] cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                  <h4 className="font-editorial text-lg">{photo.title}</h4>
                  <span className="font-manrope text-[10px] text-hk-champagne">{photo.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 8. CELESTIAL ORBIT SPHERE */}
        {activeStyle === 'orbit' && (
          <div className="relative flex flex-col items-center justify-center py-6">
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full border-2 border-dashed border-[#D4AF37]/50 p-4">
              {/* Spinning Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/30 animate-[spin_20s_linear_infinite]" />

              {/* Center Photo Circle */}
              <div
                onClick={() => setLightboxPhoto(photos[0].src)}
                className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-white shadow-2xl cursor-pointer group"
              >
                <img
                  src={photos[0].src}
                  alt={photos[0].title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h4 className="font-editorial text-2xl text-hk-charcoal">{photos[0].title}</h4>
              <p className="font-editorial text-sm italic text-hk-taupe">
                "Dua insan dinaungi rasi bintang dan doa restu semesta"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX FULLSCREEN MODAL */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-6 w-6" />
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
