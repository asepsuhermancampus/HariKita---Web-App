"use client";

import React from "react";
import Image from "next/image";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { Heart, Sparkles, Lock, ArrowUp } from "lucide-react";

export const Closing_PoeticPhotoOutro: React.FC<{
  brideName: string;
  groomName: string;
  theme: DedicatedTemplateProps["theme"];
  onCloseInvitation?: () => void;
}> = ({ brideName, groomName, onCloseInvitation }) => {
  const handleScrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer id="closing" className="relative min-h-[70vh] flex items-center justify-center text-center p-6 text-white overflow-hidden">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-black">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200"
          alt="Outro Backdrop"
          fill
          className="object-cover opacity-35 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        <Sparkles className="w-6 h-6 mx-auto text-amber-400 animate-pulse" />

        <div className="space-y-2">
          <p className="text-sm sm:text-base font-serif italic text-slate-200 leading-relaxed">
            &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
          </p>
          <span className="text-xs font-serif uppercase tracking-[0.25em] text-amber-300 block font-semibold">
            (QS. Ar-Rum: 21)
          </span>
        </div>

        <div className="pt-6 border-t border-white/20 space-y-2">
          <span className="text-xs text-slate-300 uppercase tracking-[0.25em] block font-serif font-semibold">
            KAMI YANG BERBAHAGIA
          </span>
          <h3 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-wide">
            {brideName} &amp; {groomName}
          </h3>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-300 pt-2">
          <span>Terima Kasih atas Doa &amp; Restu yang Tulus</span>
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
        </div>

        {/* Action Buttons: Tutup Undangan & Kembali ke Awal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {onCloseInvitation && (
            <button
              id="btn-close-invitation-outro"
              onClick={onCloseInvitation}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-bold tracking-wider shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer bg-white/20 hover:bg-white/30 border border-white/40 text-white"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Tutup Undangan</span>
            </button>
          )}

          <button
            id="btn-scroll-top-outro"
            onClick={handleScrollToTop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-semibold border border-white/30 text-slate-200 hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke Awal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
