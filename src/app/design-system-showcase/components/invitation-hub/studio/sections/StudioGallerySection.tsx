'use client';

import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { SANDBOX_GALLERY_PHOTOS } from '../../../../data/mock-invitation-sandbox';

interface StudioGallerySectionProps {
  galleryVariant: string;
  themeColor: string;
}

export function StudioGallerySection({ galleryVariant, themeColor }: StudioGallerySectionProps) {
  const photos = SANDBOX_GALLERY_PHOTOS.slice(0, 6);

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

      {/* Masonry-style Grid Display */}
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
              alt={photo.alt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="font-manrope text-[9px] text-white/90 truncate">{photo.caption}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center font-mono text-[9px] text-hk-taupe">
        * Format Galeri: {galleryVariant}
      </p>
    </div>
  );
}
