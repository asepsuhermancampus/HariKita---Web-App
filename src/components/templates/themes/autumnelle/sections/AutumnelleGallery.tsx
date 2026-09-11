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
      <PressedFlowerDivider color={primaryColor} />

      <div className="space-y-2">
        <span
          className="text-xs font-serif font-bold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          Galeri Bahagia
        </span>
        <h2
          className="text-2xl sm:text-3xl font-serif font-bold"
          style={{ color: theme.colors.text || "#261F23" }}
        >
          Potret Kebersamaan Kami
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {galleryPhotos.map((photoUrl, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border shadow-xs aspect-square transform hover:scale-[1.02] transition-transform duration-300"
            style={{ borderColor: `${primaryColor}25` }}
          >
            <img
              src={photoUrl}
              alt={`Foto Galeri ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
