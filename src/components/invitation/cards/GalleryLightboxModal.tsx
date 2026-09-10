"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { calculateLightboxNavigation } from "@/lib/invitation/lightbox";

interface GalleryLightboxModalProps {
  photos: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const GalleryLightboxModal: React.FC<GalleryLightboxModalProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange(calculateLightboxNavigation(currentIndex, photos.length, "next"));
      if (e.key === "ArrowLeft") onIndexChange(calculateLightboxNavigation(currentIndex, photos.length, "prev"));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onIndexChange]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIndexChange(calculateLightboxNavigation(currentIndex, photos.length, "next"));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIndexChange(calculateLightboxNavigation(currentIndex, photos.length, "prev"));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Top Bar: Counter & Close Button */}
      <div className="absolute top-4 left-0 right-0 px-6 flex items-center justify-between text-white z-20">
        <span className="text-xs font-mono tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
          {currentIndex + 1} / {photos.length}
        </span>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Tutup Preview Foto"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Buttons: Prev & Next */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white z-20 transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Foto Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white z-20 transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Foto Selanjutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Preview Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl max-h-[80vh] w-full flex items-center justify-center animate-in zoom-in-95 duration-200"
      >
        <img
          src={currentPhoto}
          alt={`Galeri Pernikahan ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
          }}
        />
      </div>
    </div>
  );
};
