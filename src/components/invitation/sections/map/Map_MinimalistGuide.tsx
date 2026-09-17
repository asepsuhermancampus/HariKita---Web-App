"use client";

import React, { useState } from "react";
import { soundscape } from "@/lib/sound/soundscapeEngine";
import { MapPin, Navigation, Copy, Check, ExternalLink, QrCode, Compass } from "lucide-react";

export const Map_MinimalistGuide: React.FC<{
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  themePrimary?: string;
}> = ({ venueName, venueAddress, googleMapsUrl, themePrimary = "#1E293B" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${venueName}, ${venueAddress}`);
    soundscape.playCoin();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="map" className="py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block">
            LOCATION &amp; TRANSIT GUIDE
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900">
            Panduan Menuju Lokasi
          </h2>
          <div className="w-16 h-0.5 bg-slate-900" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Main Info (2 Cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-slate-900">{venueName}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{venueAddress}</p>
            </div>

            {/* Checkpoints Guide */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <span className="text-xs font-mono uppercase font-bold text-slate-700 block">
                Patokan Jalur Akses Kebumen:
              </span>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Dari <strong>Stasiun Kebumen</strong>: ± 10 menit via Jl. Pemuda lurus ke arah barat.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Dari <strong>Alun-Alun Kebumen</strong>: ± 5 menit ke arah utara menuju Gedung Setda.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Tersedia area parkir luas untuk kendaraan roda dua maupun roda empat keluarga.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundscape.playTick()}
                className="py-3 px-5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Buka Rute Navigasi</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <button
                onClick={handleCopy}
                className="py-3 px-5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tersalin ke Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Alamat</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Navigation Card (1 Col) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-slate-800" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                QR Navigasi Cepat
              </span>
              <p className="text-[11px] text-slate-500">
                Scan langsung dari dashboard smartphone mobil Anda
              </p>
            </div>
            {/* Direct Link QR Frame */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 inline-block">
              <div className="w-32 h-32 bg-slate-900 text-white flex items-center justify-center rounded-lg text-center p-2">
                <span className="text-[10px] font-mono leading-tight">
                  SCAN DI SINI<br />MAPS READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
