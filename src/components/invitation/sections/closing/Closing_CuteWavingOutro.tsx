"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { Heart, Smile } from "lucide-react";

export const Closing_CuteWavingOutro: React.FC<{
  brideName: string;
  groomName: string;
  theme: DedicatedTemplateProps["theme"];
}> = ({ brideName, groomName }) => {
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
      </div>
    </footer>
  );
};
