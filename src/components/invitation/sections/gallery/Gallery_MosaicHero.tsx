"use client";

import React, { useState } from "react";
import Image from "next/image";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Sparkles, ZoomIn } from "lucide-react";
import { GalleryLightboxModal } from "@/components/invitation/cards";

export const Gallery_MosaicHero: React.FC<{
  photos: string[];
  themePrimary?: string;
}> = ({ photos }) => {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (idx: number) => {
    soundscape.playTick();
    setLightboxIndex(idx);
    setIsOpen(true);
  };

  const heroPhoto = photos[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
  const subPhotos = photos.slice(1, 4);

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-500 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Mosaic Art Gallery</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Kolase Memori Terindah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Merekam setiap senyum dan pandangan penuh kasih</p>
        </div>

        {/* Mosaic Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Hero Photo (2 Cols) */}
          <div
            onClick={() => openLightbox(0)}
            className="md:col-span-2 relative h-96 sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border border-slate-200"
          >
            <Image
              src={heroPhoto}
              alt="Galeri Utama"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="flex items-center justify-between w-full text-white">
                <span className="text-xs font-serif font-semibold">Potret Prewedding Terpilih</span>
                <ZoomIn className="w-5 h-5 opacity-80" />
              </div>
            </div>
          </div>

          {/* Right Sub-grid (1 Col, 3 Rows) */}
          <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
            {subPhotos.map((src, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx + 1)}
                className="relative h-28 sm:h-36 rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-slate-200"
              >
                <Image
                  src={src}
                  alt={`Galeri ${idx + 2}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Photos Grid for Remaining Photos */}
        {photos.length > 4 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {photos.slice(4).map((src, idx) => (
              <div
                key={idx + 4}
                onClick={() => openLightbox(idx + 4)}
                className="relative h-40 sm:h-52 rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-slate-200"
              >
                <Image
                  src={src}
                  alt={`Galeri ${idx + 5}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}

        <GalleryLightboxModal
          isOpen={isOpen}
          photos={photos}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </section>
  );
};
