'use client';

import React from 'react';
import { Lock, Heart } from 'lucide-react';
import { SANDBOX_COUPLE_DATA } from '@/app/design-system-showcase/data/mock-invitation-sandbox';

interface StudioClosingFamilyProps {
  onCloseInvitation: () => void;
  themeColor: string;
}

export function StudioClosingFamily({
  onCloseInvitation,
  themeColor,
}: StudioClosingFamilyProps) {
  const { groom, bride } = SANDBOX_COUPLE_DATA;

  return (
    <div className="bg-[#1C1C1E] text-white p-6 text-center space-y-5 rounded-t-3xl mt-6 select-none">
      <div className="space-y-2">
        <span
          className="font-editorial text-xs italic tracking-widest block uppercase text-hk-champagne"
        >
          Ungkapan Rasa Syukur &amp; Takzim
        </span>
        <h4 className="font-editorial text-2xl font-normal leading-snug">
          Terima Kasih Atas Doa &amp; Restu Anda
        </h4>
        <p className="font-editorial text-xs italic text-white/80 leading-relaxed max-w-xs mx-auto">
          "Merupakan suatu kehormatan dan kebahagiaan yang tak terhingga bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir untuk mengiringi langkah awal kami mengarungi bahtera rumah tangga."
        </p>
      </div>

      {/* Families Signatures */}
      <div className="border-t border-white/15 pt-4 space-y-3">
        <span className="font-mono text-[9px] uppercase tracking-widest text-white/60">
          Keluarga Besar yang Berbahagia:
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-manrope">
          <div>
            <span className="text-white/60 text-[9px] block">Keluarga Mempelai Pria:</span>
            <strong className="text-white">Bpk. {groom.fatherName} &amp; Ibu {groom.motherName}</strong>
          </div>
          <div>
            <span className="text-white/60 text-[9px] block">Keluarga Mempelai Wanita:</span>
            <strong className="text-white">Bpk. {bride.fatherName} &amp; Ibu {bride.motherName}</strong>
          </div>
        </div>
      </div>

      {/* Close and Relock Invitation button */}
      <div className="pt-2">
        <button
          onClick={onCloseInvitation}
          className="mx-auto flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-manrope font-semibold text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Tutup &amp; Kunci Undangan</span>
        </button>
      </div>

      {/* Copyright HariKita */}
      <div className="pt-2 text-[9px] font-mono text-white/40">
        HariKita • Hyperlocal Kebumen Digital Wedding System
      </div>
    </div>
  );
}
