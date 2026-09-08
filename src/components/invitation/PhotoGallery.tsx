"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos || photos.length === 0) return null;

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto space-y-12 text-center">
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
          Moments of Joy
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
          Galeri Kebahagiaan
        </h2>
        <p className="text-xs text-plum-light font-medium">
          Momen-momen indah yang kami abadikan menuju hari pernikahan
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative h-64 rounded-2xl overflow-hidden shadow-md cursor-pointer border border-gold/30 hover:shadow-xl transition-all"
          >
            <Image
              src={photo}
              alt={`Galeri foto ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl"
          >
            <Image
              src={selectedPhoto}
              alt="Preview foto besar"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};
