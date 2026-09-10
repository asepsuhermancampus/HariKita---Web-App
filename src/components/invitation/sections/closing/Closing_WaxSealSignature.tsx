"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { Heart, Lock, ArrowUp } from "lucide-react";

export const Closing_WaxSealSignature: React.FC<{
  brideName: string;
  groomName: string;
  theme: DedicatedTemplateProps["theme"];
  onCloseInvitation?: () => void;
}> = ({ brideName, groomName, theme, onCloseInvitation }) => {
  const primaryColor = theme?.colors?.primary || "#C5A880";

  const handleScrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer id="closing" className="py-24 px-4 sm:px-6 relative overflow-hidden text-center bg-stone-900 text-stone-200">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Wax Seal Emblem */}
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-600 text-amber-100 shadow-2xl border-2 border-amber-400 flex items-center justify-center text-xl font-serif font-bold shadow-amber-900/50">
          <span>{brideName.charAt(0)}&amp;{groomName.charAt(0)}</span>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 block">
            DENGAN PENUH RASA SYUKUR
          </span>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif max-w-md mx-auto italic">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.
          </p>
        </div>

        {/* Digital Calligraphy Names */}
        <div className="space-y-1 pt-4 border-t border-stone-800">
          <span className="text-xs text-stone-500 font-serif">Kami yang berbahagia,</span>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-amber-300">
            {brideName} &amp; {groomName}
          </h3>
          <p className="text-[11px] text-stone-500">Beserta segenap keluarga besar</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-2">
          <span>Doa Restu Anda Adalah Kehormatan Terindah Bagi Kami</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>

        {/* Combined Action Buttons: Tutup Undangan & Kembali ke Awal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {onCloseInvitation && (
            <button
              id="btn-close-invitation-outro"
              onClick={onCloseInvitation}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-bold tracking-wider shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Tutup Undangan</span>
            </button>
          )}

          <button
            id="btn-scroll-top-outro"
            onClick={handleScrollToTop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-serif font-semibold border border-stone-700 text-stone-300 hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke Awal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
