"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { PressedFlowerDivider } from "@/components/invitation/svg/autumnelle";

export const AutumnelleGallery: React.FC<{
  galleryPhotos: DedicatedTemplateProps["galleryPhotos"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ galleryPhotos, theme }) => {
  const primaryColor = theme.colors.primary || "#5C6F57";

  return (
    <section id="gallery" className="py-16 px-4 max-w-2xl mx-auto space-y-10 text-center">
      <PressedFlowerDivider size="80%" color={primaryColor} />

      <div className="space-y-2">
        <span className="text-xs font-serif font-bold uppercase tracking-widest text-emerald-800">
          Galeri Bahagia
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">
          Potret Kebersamaan Kami
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {galleryPhotos.map((photoUrl, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border border-emerald-200/50 shadow-sm aspect-square transform hover:scale-[1.02] transition-transform duration-300"
          >
            <img src={photoUrl} alt={`Foto Galeri ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
};
