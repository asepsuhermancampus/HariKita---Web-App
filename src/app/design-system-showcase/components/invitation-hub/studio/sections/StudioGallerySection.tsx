'use client';

import React from 'react';
import { Camera, Film, Layers, Grid } from 'lucide-react';
import { SANDBOX_GALLERY_PHOTOS } from '@/app/design-system-showcase/data/mock-invitation-sandbox';

interface StudioGallerySectionProps {
  galleryVariant: string;
  themeColor: string;
}

export function StudioGallerySection({ galleryVariant, themeColor }: StudioGallerySectionProps) {
  const photos = SANDBOX_GALLERY_PHOTOS.slice(0, 6);

  const renderGalleryContent = () => {
    switch (galleryVariant) {
      case 'filmstrip-reel':
        return (
          <div className="space-y-2">
            {/* Filmstrip Top & Bottom Sprocket Styling */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/80 rounded-t-lg overflow-hidden">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="h-2 w-3 rounded-xs bg-white/20 shrink-0" />
              ))}
            </div>

            {/* Horizontal Swipe Reel */}
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-2 py-2 bg-neutral-900 rounded-b-lg scrollbar-thin scrollbar-thumb-neutral-700">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="snap-center shrink-0 w-56 group relative overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 shadow-md"
                >
                  <div className="aspect-4/3 w-full overflow-hidden">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2.5 bg-neutral-900/90 text-white flex items-center justify-between">
                    <div>
                      <p className="font-editorial text-xs font-semibold text-white/90 truncate">{photo.title}</p>
                      <span className="font-manrope text-[9px] text-white/50">{photo.subtitle}</span>
                    </div>
                    <span className="font-mono text-[9px] text-amber-400/80">#0{i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center font-manrope text-[10px] text-hk-taupe/80 italic">
              ← Geser horizontal untuk melihat reel foto lainnya →
            </p>
          </div>
        );

      case 'polaroid-scatter':
        return (
          <div className="grid grid-cols-2 gap-4 pt-3 pb-2 px-1">
            {photos.map((photo, i) => {
              // Alternating subtle rotations for playful scrapbook polaroid look
              const rotationClasses = [
                '-rotate-2 hover:rotate-0',
                'rotate-3 hover:rotate-0',
                '-rotate-1 hover:rotate-0',
                'rotate-2 hover:rotate-0',
                '-rotate-3 hover:rotate-0',
                'rotate-1 hover:rotate-0',
              ];
              const rotClass = rotationClasses[i % rotationClasses.length];

              return (
                <div
                  key={photo.id}
                  className={`group relative rounded-xl bg-white p-2 pb-4 shadow-md border border-hk-champagne/50 transition-all duration-300 hover:scale-105 hover:z-10 ${rotClass}`}
                >
                  {/* Tape strip on top */}
                  <div
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-12 rounded-xs shadow-2xs backdrop-blur-xs opacity-75 ${
                      i % 2 === 0 ? 'bg-amber-100/90 rotate-1' : 'bg-rose-100/90 -rotate-2'
                    }`}
                  />
                  <div className="aspect-square w-full overflow-hidden rounded-xs bg-neutral-100">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-editorial text-xs text-hk-charcoal font-medium truncate">{photo.title}</p>
                    <span className="font-manrope text-[8px] text-hk-taupe truncate block">{photo.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'classic-grid':
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-hk-champagne/60 bg-white shadow-xs"
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                  <p className="font-editorial text-xs font-semibold leading-tight">{photo.title}</p>
                  <span className="font-manrope text-[9px] text-white/70">{photo.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'editorial-masonry':
      default:
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className={`group relative overflow-hidden rounded-xl border border-hk-champagne/40 bg-white shadow-2xs ${
                  i === 0 || i === 3 ? 'row-span-2 aspect-3/4' : 'aspect-square'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="font-manrope text-[9px] text-white/90 truncate">
                    {photo.subtitle || photo.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 px-3 py-4 text-hk-charcoal">
      <div className="text-center">
        <span
          className="font-manrope text-[10px] font-bold uppercase tracking-widest"
          style={{ color: themeColor }}
        >
          Potret Bahagia &amp; Kenangan Indah
        </span>
        <h3 className="font-editorial text-2xl font-medium text-hk-charcoal mt-0.5">
          Galeri Pre-wedding
        </h3>
      </div>

      {/* Render Selected Gallery Layout */}
      {renderGalleryContent()}

      <div className="flex items-center justify-center gap-1.5 pt-1">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
        <p className="font-mono text-[9px] text-hk-taupe capitalize">
          Format Galeri: {galleryVariant.replace('-', ' ')}
        </p>
      </div>
    </div>
  );
}

