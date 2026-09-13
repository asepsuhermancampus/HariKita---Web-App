'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, QrCode, Copy, Check, Car } from 'lucide-react';
import { VenueLocationData } from '@/types/invitation-studio';
import { cn } from '@/lib/utils';

interface StudioLocationCardProps {
  venue: VenueLocationData;
  themeColor: string;
  ornamentId?: string;
}

export function StudioLocationCard({ venue, themeColor }: StudioLocationCardProps) {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyMapUrl = () => {
    navigator.clipboard.writeText(venue.googleMapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 px-3 py-2 text-hk-charcoal">
      {/* Header */}
      <div className="text-center">
        <span
          className="font-manrope text-[10px] font-bold uppercase tracking-widest"
          style={{ color: themeColor }}
        >
          Panduan Navigasi &amp; Lokasi Acara
        </span>
        <h3 className="mt-1 font-editorial text-2xl sm:text-3xl text-hk-charcoal font-medium">
          Denah &amp; Lokasi Acara
        </h3>
        <p className="font-manrope text-[11px] text-hk-charcoal/70 mt-1 max-w-sm mx-auto">
          Kehadiran Anda adalah berkah kehormatan bagi kami. Pindai QR atau gunakan tombol navigasi di bawah ini:
        </p>
      </div>

      {/* Main Venue Card */}
      <div className="rounded-2xl border border-hk-champagne/60 bg-white p-5 shadow-sm space-y-4">
        {/* Venue Title & Pin */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs text-white"
            style={{ backgroundColor: themeColor }}
          >
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-editorial text-xl font-bold text-hk-charcoal">{venue.venueName}</h4>
            <p className="font-manrope text-xs font-semibold text-hk-taupe mt-0.5">{venue.hallName}</p>
            <p className="font-manrope text-xs text-hk-charcoal/75 mt-1 leading-relaxed">
              {venue.address}, {venue.district}, {venue.city}, {venue.province} {venue.postalCode}
            </p>
          </div>
        </div>

        {/* Interactive Navigation Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={venue.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-manrope font-semibold text-white shadow-xs transition-transform active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Google Maps</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
          <a
            href={venue.wazeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-hk-champagne/60 bg-hk-ivory py-2 px-3 text-xs font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe transition-transform active:scale-95"
          >
            <Compass className="h-3.5 w-3.5 text-hk-taupe" />
            <span>Waze Rute</span>
            <ExternalLink className="h-3 w-3 text-hk-taupe/70" />
          </a>
        </div>

        {/* Smart GPS QR Code Card (Transformed from QRIS) */}
        <div className="rounded-xl border border-hk-champagne/50 bg-hk-ivory/50 p-4 flex flex-col sm:flex-row items-center gap-4">
          {/* QR Code Matrix Display */}
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white p-2 shadow-xs">
            <div className="relative h-full w-full flex flex-col justify-between items-center bg-[radial-gradient(#2B2B2B_1.5px,transparent_1.5px)] bg-[size:8px_8px] p-1.5">
              {/* Corner Position Anchors */}
              <div className="absolute top-1 left-1 h-6 w-6 border-2 border-hk-charcoal bg-transparent flex items-center justify-center">
                <div className="h-2.5 w-2.5 bg-hk-charcoal" />
              </div>
              <div className="absolute top-1 right-1 h-6 w-6 border-2 border-hk-charcoal bg-transparent flex items-center justify-center">
                <div className="h-2.5 w-2.5 bg-hk-charcoal" />
              </div>
              <div className="absolute bottom-1 left-1 h-6 w-6 border-2 border-hk-charcoal bg-transparent flex items-center justify-center">
                <div className="h-2.5 w-2.5 bg-hk-charcoal" />
              </div>
              {/* Center Map Pin Emblem */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white shadow-xs"
                  style={{ color: themeColor }}
                >
                  <MapPin className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* QR Explanations */}
          <div className="text-center sm:text-left flex-1 space-y-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[9px] font-manrope font-bold text-emerald-800">
              <QrCode className="h-3 w-3" />
              <span>Pindai GPS Instan</span>
            </div>
            <h5 className="font-editorial text-base font-semibold text-hk-charcoal leading-tight">
              Scan Navigasi ke Smartphone
            </h5>
            <p className="font-manrope text-[11px] text-hk-charcoal/70 leading-relaxed">
              Bagi tamu yang membuka undangan di laptop/tablet, cukup arahkan kamera smartphone ke QR ini untuk membuka peta langsung.
            </p>
            <button
              onClick={handleCopyMapUrl}
              className="inline-flex items-center gap-1 rounded-lg border border-hk-champagne/60 bg-white px-2.5 py-1 text-[10px] font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-700" />
                  <span className="text-emerald-700">Link Peta Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-hk-taupe" />
                  <span>Salin Link Google Maps</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parking & Logistics note */}
        <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 border border-amber-200/50 p-3 text-[11px] font-manrope text-amber-900">
          <Car className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
          <p className="leading-snug">{venue.parkingNotes}</p>
        </div>
      </div>
    </div>
  );
}
