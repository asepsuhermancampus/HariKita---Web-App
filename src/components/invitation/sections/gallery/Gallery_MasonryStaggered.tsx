"use client";

import React, { useState } from "react";
import Image from "next/image";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Camera, ZoomIn } from "lucide-react";
import { GalleryLightboxModal } from "@/components/invitation/cards";

export const Gallery_MasonryStaggered: React.FC<{
  photos: string[];
  themePrimary?: string;
}> = ({ photos, themePrimary = "#C5A880" }) => {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (idx: number) => {
    soundscape.playTick();
    setLightboxIndex(idx);
    setIsOpen(true);
  };

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold uppercase tracking-widest shadow-xs">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>Visual Portrait Moments</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Galeri Potret Bahagia
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Sentuh foto untuk memperbesar tampilan</p>
        </div>

        {/* Masonry Columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((src, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              className="relative break-inside-avoid rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 group cursor-pointer hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-slate-100">
                <Image
                  src={src}
                  alt={`Galeri Prewedding ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-xs border border-white/40">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
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
