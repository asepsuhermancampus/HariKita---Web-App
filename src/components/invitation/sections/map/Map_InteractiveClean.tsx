"use client";

import React, { useState } from "react";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { MapPin, Navigation, Copy, Check, ExternalLink } from "lucide-react";

export const Map_InteractiveClean: React.FC<{
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  themePrimary?: string;
}> = ({ venueName, venueAddress, googleMapsUrl, themePrimary = "#C5A880" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${venueName}, ${venueAddress}`);
    soundscape.playCoin();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="map" className="py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-500 inline-flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-rose-500" />
            <span>Petunjuk Lokasi</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800">
            Peta Lokasi Acara
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Kemudahan navigasi langsung menuju lokasi acara di Kebumen.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
          {/* Simulated Map Container with Clean Gradient Pin */}
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center group">
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 text-center space-y-3 p-6 max-w-sm">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500 text-white shadow-xl flex items-center justify-center animate-bounce">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <strong className="text-slate-900 font-bold block text-sm sm:text-base">{venueName}</strong>
                <p className="text-xs text-slate-500 line-clamp-2">{venueAddress}</p>
              </div>
            </div>

            {/* Direct Open Button Overlay */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundscape.playTick()}
              className="absolute bottom-4 right-4 bg-white/95 text-slate-800 py-2 px-3.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 flex items-center gap-1.5 border border-slate-200 transition-transform active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
              <span>Buka Google Maps</span>
            </a>
          </div>

          {/* Address Box & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5 text-left w-full">
              <span className="text-[10px] uppercase font-bold text-slate-400">Alamat Lengkap</span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{venueAddress}</p>
            </div>

            <button
              onClick={handleCopy}
              className="shrink-0 w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Salin Alamat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
