"use client";

import React, { useState } from "react";
import { Mail, Heart, Sparkles } from "lucide-react";

interface EnvelopeCoverProps {
  brideName: string;
  groomName: string;
  guestName: string;
  eventDate: string;
  themePrimaryColor?: string;
  onOpen: () => void;
}

export const EnvelopeCover: React.FC<EnvelopeCoverProps> = ({
  brideName,
  groomName,
  guestName,
  eventDate,
  onOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenClick = () => {
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 ${
        isOpening ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at center, #FAF4EE 0%, #E8D8CA 100%)",
      }}
    >
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 text-gold/30 text-5xl select-none font-serif">✦</div>
      <div className="absolute bottom-6 right-6 text-gold/30 text-5xl select-none font-serif">✦</div>

      {/* Main Envelope Card */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-gold/30 text-center space-y-6">
        {/* Header Ribbon / Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 text-plum-dark text-xs uppercase tracking-widest font-semibold border border-gold/30">
          <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
          <span>The Wedding Celebration</span>
        </div>

        {/* Couple Names */}
        <div className="space-y-1">
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold tracking-tight">
            {brideName}
          </h1>
          <div className="flex items-center justify-center gap-3 py-1">
            <span className="h-[1px] w-12 bg-gold/50" />
            <span className="font-script text-2xl text-gold-dark">&</span>
            <span className="h-[1px] w-12 bg-gold/50" />
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold tracking-tight">
            {groomName}
          </h1>
        </div>

        {/* Date */}
        <p className="text-xs uppercase tracking-widest text-plum-light font-medium">
          {new Date(eventDate).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Recipient Box */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gold/30 space-y-1">
          <p className="text-xs text-plum-light font-medium">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
          <p className="font-serif-luxury text-lg text-plum font-bold capitalize">
            {guestName || "Tamu Undangan Terhormat"}
          </p>
          <p className="text-[10px] text-plum-light/70 italic">
            Mohon maaf jika ada kesalahan dalam penulisan nama dan gelar
          </p>
        </div>

        {/* 3D Wax Seal Button */}
        <div className="pt-2 flex flex-col items-center">
          <button
            onClick={handleOpenClick}
            disabled={isOpening}
            className="group relative flex items-center justify-center gap-3 px-8 py-3.5 rounded-full gold-gradient-bg text-plum-dark font-bold text-sm shadow-xl hover:brightness-105 active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-full wax-seal flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <span>Buka Undangan</span>
          </button>
          <span className="text-[11px] text-plum-light/70 mt-2 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            Klik untuk membuka & memutar musik
          </span>
        </div>
      </div>
    </div>
  );
};
