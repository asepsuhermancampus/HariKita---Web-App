'use client';

import React from 'react';
import { Heart, Sparkles, Lock, ArrowDown } from 'lucide-react';
import { SANDBOX_COUPLE_DATA } from '../../../../data/mock-invitation-sandbox';
import { cn } from '@/lib/utils';

interface StudioGatekeeperCoverProps {
  onOpen: () => void;
  themeColor: string;
  isOpened: boolean;
}

export function StudioGatekeeperCover({
  onOpen,
  themeColor,
  isOpened,
}: StudioGatekeeperCoverProps) {
  const { groom, bride } = SANDBOX_COUPLE_DATA;

  if (isOpened) return null;

  return (
    <div className="relative flex min-h-[720px] flex-col justify-between p-6 text-center bg-[#FAF8F5] text-hk-charcoal select-none">
      {/* Top Header */}
      <div className="pt-6 space-y-1">
        <span
          className="font-editorial text-xs italic tracking-widest block uppercase"
          style={{ color: themeColor }}
        >
          The Wedding Celebration of
        </span>
        <h2 className="font-editorial text-4xl text-hk-charcoal font-medium tracking-tight">
          {groom.nickName} &amp; {bride.nickName}
        </h2>
        <p className="font-mono text-xs text-hk-champagne tracking-widest mt-1">
          SABTU, 24 . 10 . 2026
        </p>
      </div>

      {/* Guest Personalized Invitation Card */}
      <div className="rounded-2xl border border-hk-champagne/60 bg-white/90 p-5 shadow-xs backdrop-blur-xs space-y-2">
        <span className="font-manrope text-[10px] uppercase tracking-wider text-hk-charcoal/60">
          Kepada Yth. Bapak/Ibu/Saudara/i:
        </span>
        <div className="font-editorial text-2xl font-semibold text-hk-charcoal leading-snug">
          Tamu Kehormatan
        </div>
        <div className="inline-block rounded-full bg-hk-soft-beige px-3 py-0.5 font-manrope text-[10px] font-semibold text-hk-taupe">
          Keluarga Besar di Kebumen
        </div>
        <p className="font-manrope text-[10px] text-hk-charcoal/60 leading-relaxed pt-1">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
      </div>

      {/* 3D Wax Seal Opening Interactive Button */}
      <div className="pb-8 space-y-3 flex flex-col items-center">
        <button
          onClick={onOpen}
          className="group flex flex-col items-center gap-2.5 transition-transform active:scale-95"
        >
          {/* Wax Seal Circle with 3D Ring */}
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/60 transition-transform group-hover:scale-105"
            style={{
              background: `radial-gradient(circle at 35% 35%, #D4BA99, ${themeColor} 70%, #3D2D20 100%)`,
            }}
          >
            <Heart className="h-7 w-7 fill-white drop-shadow-xs" />
            <div className="absolute inset-0 rounded-full border border-white/30" />
          </div>

          <span
            className="font-manrope text-xs font-bold tracking-widest uppercase"
            style={{ color: themeColor }}
          >
            ✦ Buka Undangan ✦
          </span>
        </button>
        <span className="font-mono text-[9px] text-hk-charcoal/50">
          * Ketuk untuk membuka lembaran sakral
        </span>
      </div>
    </div>
  );
}
