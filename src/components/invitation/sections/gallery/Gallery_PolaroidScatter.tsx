"use client";

import React, { useState } from "react";
import Image from "next/image";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Camera, ZoomIn } from "lucide-react";
import { GalleryLightboxModal } from "@/components/invitation/cards";

export const Gallery_PolaroidScatter: React.FC<{
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

  const rotations = ["-rotate-3", "rotate-2", "-rotate-2", "rotate-3"];

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-amber-50/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            <span>Polaroid Photo Snaps</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Potret Manis Hari Ini
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Koleksi foto polaroid penuh tawa dan kebahagiaan</p>
        </div>

        {/* Scattered Polaroids Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {photos.map((src, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              className={`relative bg-white p-3 pb-5 rounded-2xl shadow-xl border border-slate-100 cursor-pointer group hover:rotate-0 hover:scale-105 transition-all duration-300 ${
                rotations[idx % rotations.length]
              }`}
            >
              {/* Tape */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/80 backdrop-blur-xs border-t border-b border-amber-300/50 shadow-2xs z-10" />

              <div className="relative h-60 w-full rounded-xl overflow-hidden bg-slate-100">
                <Image
                  src={src}
                  alt={`Polaroid ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>

              <p className="text-center text-[11px] font-handwriting text-slate-500 pt-3 italic">
                Sweet Moment #{idx + 1}
              </p>
            </div>
          ))}
        </div>

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
