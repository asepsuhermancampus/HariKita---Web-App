"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { Heart, Smile, Lock, ArrowUp } from "lucide-react";

export const Closing_CuteWavingOutro: React.FC<{
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
    <footer id="closing" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-rose-100/60 text-slate-800 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Animated Couple Caricature Emojis */}
        <div className="text-5xl animate-bounce">
          👰‍♀️👋🤵‍♂️
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-rose-200 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
            <Smile className="w-3.5 h-3.5" />
            <span>Sampai Jumpa di Kebumen!</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Terima kasih banyak atas doa dan kehadiran teman-teman semua. Kehadiranmu sangat berarti bagi lembaran baru hidup kami!
          </p>
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-extrabold text-2xl text-slate-900">
              {brideName} &amp; {groomName}
            </h4>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500">
          <span>Salam hangat dan terima kasih dari kami sekeluarga</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>

        {/* Action Buttons: Tutup Undangan & Kembali ke Awal */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onCloseInvitation && (
            <button
              id="btn-close-invitation-outro"
              onClick={onCloseInvitation}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold tracking-wider shadow-md hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Tutup Undangan</span>
            </button>
          )}

          <button
            id="btn-scroll-top-outro"
            onClick={handleScrollToTop}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold border border-rose-300 text-slate-700 hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke Awal</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
