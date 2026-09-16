"use client";

import React, { useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { calculateLightboxNavigation } from "@/lib/invitation/lightbox";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndexChange(calculateLightboxNavigation(currentIndex, photos.length, "next"));
      if (e.key === "ArrowLeft") onIndexChange(calculateLightboxNavigation(currentIndex, photos.length, "prev"));
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentIndex, photos.length, onClose, onIndexChange]);

  // Focus trap + Escape + return focus (Phase 7 a11y).
  useFocusTrap(dialogRef, isOpen && photos.length > 0, onClose, initialFocusRef);

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
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau galeri foto, ${currentIndex + 1} dari ${photos.length}`}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      {/* Top Bar: Counter & Close Button */}
      <div className="absolute top-4 left-0 right-0 px-6 flex items-center justify-between text-white z-20">
        <span className="text-xs font-mono tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
          {currentIndex + 1} / {photos.length}
        </span>

        <button
          ref={initialFocusRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup pratinjau foto"
          className="focus-ring p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
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
            aria-label="Foto sebelumnya"
            className="focus-ring absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white z-20 transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Foto selanjutnya"
            className="focus-ring absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white z-20 transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentPhoto}
          alt={`Galeri Pernikahan ${currentIndex + 1} dari ${photos.length}`}
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800";
          }}
        />
      </div>
    </div>
  );
};
