"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { Film, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { GalleryLightboxModal } from "@/components/invitation/cards";

export const Gallery_FilmRollCarousel: React.FC<{
  photos: string[];
  themePrimary?: string;
}> = ({ photos }) => {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (dir: "left" | "right") => {
    soundscape.playTick();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  const openLightbox = (idx: number) => {
    soundscape.playTick();
    setLightboxIndex(idx);
    setIsOpen(true);
  };

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>Cinematic Film Roll</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Sorotan Galeri Sinematik
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll("left")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Film Reel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {photos.map((src, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              className="snap-center shrink-0 w-64 sm:w-80 h-96 relative rounded-2xl overflow-hidden cursor-pointer group border-2 border-slate-700 shadow-2xl"
            >
              <Image
                src={src}
                alt={`Film Reel ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full text-xs text-white">
                  <span className="font-mono text-[10px] text-amber-400">FRAME #{idx + 1}</span>
                  <ZoomIn className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                </div>
              </div>
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
