"use client";

import React, { useEffect, useState } from "react";
import { MailOpen, Heart, Sparkles } from "lucide-react";

interface EnvelopeCoverGateProps {
  brideName: string;
  groomName: string;
  guestName: string;
  eventDate: string;
  onOpen: () => void;
  isOpened: boolean;
  archetypeId?: string;
}

export const EnvelopeCoverGate: React.FC<EnvelopeCoverGateProps> = ({
  brideName,
  groomName,
  guestName,
  eventDate,
  onOpen,
  isOpened,
}) => {
  const [shouldRender, setShouldRender] = useState(!isOpened);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (!isOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setIsAnimatingOut(true);
      const timer = setTimeout(() => setShouldRender(false), 900);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpened]);

  if (!shouldRender) return null;

  const formattedDate = new Date(eventDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleOpenClick = () => {
    onOpen();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-transform duration-900 ease-in-out select-none ${
        isAnimatingOut ? "-translate-y-full opacity-90" : "translate-y-0 opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #1c181b 0%, #291d24 50%, #151113 100%)",
      }}
    >
      {/* Decorative Shimmer & Starry Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,168,115,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 bg-black/40 backdrop-blur-2xl border border-amber-300/30 p-8 rounded-3xl shadow-2xl shadow-black/80">
        {/* Monogram Seal */}
        <div className="mx-auto w-20 h-20 rounded-full border border-amber-300/40 bg-amber-400/10 flex items-center justify-center text-amber-200 text-2xl font-serif shadow-inner animate-pulse">
          {brideName.charAt(0)} & {groomName.charAt(0)}
        </div>

        {/* Header Titles */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs tracking-widest uppercase text-amber-300/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Walimatul &apos;Ursy • The Wedding of</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white tracking-wide">
            {brideName} <span className="text-amber-300 font-light">&</span> {groomName}
          </h2>
          <p className="text-xs text-slate-300">{formattedDate}</p>
        </div>

        {/* Guest Name Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1 backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </p>
          <p className="text-lg font-semibold text-amber-200 font-serif capitalize">
            {guestName || "Tamu Undangan"}
          </p>
          <p className="text-[11px] text-slate-400 italic">
            *Mohon maaf apabila ada kesalahan penulisan nama/gelar
          </p>
        </div>

        {/* Buka Undangan Action Button */}
        <button
          id="btn-buka-undangan"
          onClick={handleOpenClick}
          className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 w-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[48px]"
        >
          <MailOpen className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          <span className="tracking-wide uppercase text-xs font-bold">Buka Undangan</span>
          <Heart className="w-4 h-4 fill-slate-950/40 text-transparent" />
        </button>
      </div>
    </div>
  );
};
