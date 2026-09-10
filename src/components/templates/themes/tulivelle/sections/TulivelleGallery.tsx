"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { TulipDivider } from "@/components/invitation/svg/tulivelle";

export const TulivelleGallery: React.FC<{
  galleryPhotos: DedicatedTemplateProps["galleryPhotos"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ galleryPhotos, theme }) => {
  const primaryColor = theme.colors.primary || "#7A8C74";
  const accentColor = theme.colors.accent || "#D48B72";

  return (
    <section id="gallery" className="py-16 px-4 max-w-2xl mx-auto space-y-10 text-center">
      <TulipDivider size="80%" color={primaryColor} secondaryColor={accentColor} />

      <div className="space-y-2">
        <span className="text-xs font-serif font-bold uppercase tracking-widest text-rose-800">
          Galeri Kenangan
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rose-950">
          Setiap Momen Penuh Cerita
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {galleryPhotos.map((photoUrl, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-[28px] border border-rose-200 shadow-sm aspect-square transform hover:scale-[1.02] transition-transform duration-300"
          >
            <img src={photoUrl} alt={`Foto Galeri ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
};
