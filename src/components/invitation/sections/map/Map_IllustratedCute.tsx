"use client";

import React, { useState } from "react";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { MapPin, Navigation, Copy, Check, Car, Compass } from "lucide-react";

export const Map_IllustratedCute: React.FC<{
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  themePrimary?: string;
}> = ({ venueName, venueAddress, googleMapsUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${venueName}, ${venueAddress}`);
    soundscape.playCoin();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="map" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-rose-50/30">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Denah Kartun Menggemaskan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Menuju Hari Bahagia Kita
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">Jangan sampai tersesat ya! Ikuti panduan denah lucu di bawah ini:</p>
        </div>

        {/* Cute Illustrated Map Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-rose-200/80 space-y-6 relative">
          {/* Illustrated Cartoon Map Canvas */}
          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-emerald-50 to-sky-50 border-2 border-dashed border-rose-300 p-6 flex flex-col items-center justify-center text-center">
            {/* Cute Cartoon Landmarks SVG Representation */}
            <div className="absolute top-4 left-6 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white/90 px-3 py-1 rounded-full shadow-xs">
              <span>🏖️ Arah Pantai Menganti</span>
            </div>
            <div className="absolute top-4 right-6 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-white/90 px-3 py-1 rounded-full shadow-xs">
              <span>🏛️ Alun-Alun Kebumen</span>
            </div>
            <div className="absolute bottom-4 left-6 flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-white/90 px-3 py-1 rounded-full shadow-xs">
              <span>🚆 Stasiun Kereta Kebumen</span>
            </div>

            {/* Center Destination Castle Pin */}
            <div className="relative z-10 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500 text-white shadow-xl flex items-center justify-center -rotate-6 animate-pulse">
                <span className="text-3xl">💒</span>
              </div>
              <div className="bg-white/95 backdrop-blur-xs p-3 rounded-2xl shadow-md border border-rose-200 max-w-xs mx-auto">
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Titik Temu Kita</span>
                <strong className="text-slate-800 text-xs sm:text-sm">{venueName}</strong>
              </div>
            </div>
          </div>

          {/* Address & Navigation Buttons */}
          <div className="space-y-4">
            <p className="text-xs text-slate-600 text-center leading-relaxed">
              📍 <strong>Alamat:</strong> {venueAddress}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundscape.playTick()}
                className="py-3 px-4 rounded-2xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Buka Rute di Google Maps</span>
              </a>

              <button
                onClick={handleCopy}
                className="py-3 px-4 rounded-2xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600">Alamat Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Salin Alamat ke Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
