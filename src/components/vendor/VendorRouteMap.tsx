"use client";

import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Car,
  Clock,
  Compass,
  Sparkles,
  Route as RouteIcon,
} from "lucide-react";
import { KEBUMEN_DISTRICTS } from "@/lib/validations/client-profile";

interface VendorRouteMapProps {
  vendorStudioDistrict?: string;
  vendorStudioAddress?: string;
}

// Data koordinat aproksimasi & jarak antarkecamatan di Kabupaten Kebumen
const DISTRICT_COORDINATES: Record<string, { x: number; y: number; label: string }> = {
  Kebumen: { x: 50, y: 48, label: "Kebumen Kota (Pusat Pemerintahan)" },
  Gombong: { x: 26, y: 38, label: "Gombong (Pusat Niaga Barat)" },
  Karanganyar: { x: 38, y: 42, label: "Karanganyar (Hub Kereta & Tradisi)" },
  Kutowinangun: { x: 68, y: 52, label: "Kutowinangun (Jalur Utama Timur)" },
  Prembun: { x: 84, y: 50, label: "Prembun (Perbatasan Purworejo)" },
  Alian: { x: 54, y: 35, label: "Alian (Perbukitan Utara)" },
  Ambal: { x: 72, y: 72, label: "Ambal (Pesisir Pantai Selatan)" },
  Ayah: { x: 14, y: 75, label: "Ayah (Pantai Menganti & Karst)" },
  Buayan: { x: 22, y: 58, label: "Buayan (Jalur Wisata Goa Jatijajar)" },
  Buluspesantren: { x: 54, y: 68, label: "Buluspesantren (Pesisir)" },
  Bonorowo: { x: 88, y: 62, label: "Bonorowo (Lahan Hijau)" },
  Karanggayam: { x: 42, y: 22, label: "Karanggayam (Dataran Tinggi)" },
  Klirong: { x: 46, y: 64, label: "Klirong (Sentra Kerajinan)" },
  Kragan: { x: 48, y: 56, label: "Kragan" },
  Kuwarasan: { x: 32, y: 52, label: "Kuwarasan" },
  Mirit: { x: 82, y: 74, label: "Mirit (Pantai Laguna Laguna)" },
  Padureso: { x: 74, y: 24, label: "Padureso (Wadaslintang)" },
  Pejagoan: { x: 44, y: 46, label: "Pejagoan (Tepian Sungai Luk Ulo)" },
  Petanahan: { x: 40, y: 72, label: "Petanahan (Pantai Pandan Kuning)" },
  Poncowarno: { x: 64, y: 38, label: "Poncowarno (Agrowisata)" },
  Puring: { x: 28, y: 70, label: "Puring (Pantai Bopong)" },
  Rowokele: { x: 18, y: 44, label: "Rowokele (Goa Karangbolong)" },
  Sadang: { x: 58, y: 16, label: "Sadang (Cagar Geologi Utara)" },
  Sempor: { x: 24, y: 28, label: "Sempor (Waduk Sempor)" },
  Sruweng: { x: 40, y: 45, label: "Sruweng" },
};

// Estimasi jarak & waktu dari Kebumen Kota ke kecamatan lain
const DISTANCE_MATRIX: Record<string, { km: number; minutes: number; terrain: string }> = {
  Kebumen: { km: 2.5, minutes: 8, terrain: "Jalan Protokol Kota (Lancar)" },
  Gombong: { km: 21, minutes: 35, terrain: "Jalur Nasional III (Lancar)" },
  Karanganyar: { km: 14, minutes: 24, terrain: "Jalur Provinsi Datar" },
  Kutowinangun: { km: 12, minutes: 20, terrain: "Jalan Aspal Nasional" },
  Prembun: { km: 19, minutes: 32, terrain: "Jalur Timur Antarkota" },
  Alian: { km: 8, minutes: 16, terrain: "Jalan Kabupaten Beraspal" },
  Ambal: { km: 23, minutes: 38, terrain: "Jalur Daendels Selatan" },
  Ayah: { km: 44, minutes: 75, terrain: "Jalur Pesisir Berkelok Indah" },
  Buayan: { km: 31, minutes: 52, terrain: "Jalur Karst & Goa Wisata" },
  Buluspesantren: { km: 14, minutes: 25, terrain: "Jalan Daendels Pesisir" },
  Bonorowo: { km: 24, minutes: 40, terrain: "Jalan Pedesaan Luas" },
  Karanggayam: { km: 26, minutes: 55, terrain: "Tanjakan Perbukitan Utara" },
  Klirong: { km: 11, minutes: 20, terrain: "Jalan Datar Lancar" },
  Kragan: { km: 9, minutes: 18, terrain: "Jalan Datar" },
  Kuwarasan: { km: 23, minutes: 40, terrain: "Jalur Alternatif Barat" },
  Mirit: { km: 32, minutes: 50, terrain: "Jalur Daendels Ujung Timur" },
  Padureso: { km: 28, minutes: 55, terrain: "Tanjakan Bendungan" },
  Pejagoan: { km: 3, minutes: 8, terrain: "Perbatasan Kota Seberang Sungai" },
  Petanahan: { km: 17, minutes: 28, terrain: "Jalur Menuju Pesisir" },
  Poncowarno: { km: 16, minutes: 30, terrain: "Jalan Perbukitan Tenang" },
  Puring: { km: 28, minutes: 48, terrain: "Jalur Pantai Selatan" },
  Rowokele: { km: 34, minutes: 55, terrain: "Jalur Pesisir Bukit Barat" },
  Sadang: { km: 38, minutes: 70, terrain: "Jalur Geologi Luk Ulo" },
  Sempor: { km: 29, minutes: 50, terrain: "Akses Waduk & Perbukitan" },
  Sruweng: { km: 8, minutes: 15, terrain: "Jalur Nasional III" },
};

export function VendorRouteMap({
  vendorStudioDistrict = "Kebumen",
  vendorStudioAddress = "Jl. Pahlawan No. 12, Kebumen Kota",
}: VendorRouteMapProps) {
  const [selectedVenueDistrict, setSelectedVenueDistrict] = useState<string>("Ayah");
  const [venueName, setVenueName] = useState<string>("Pantai Menganti (Spot Prewed & Sunset)");

  const originCoords = DISTRICT_COORDINATES[vendorStudioDistrict] || { x: 50, y: 48, label: "Studio Vendor" };
  const destCoords = DISTRICT_COORDINATES[selectedVenueDistrict] || { x: 14, y: 75, label: "Venue Acara Klien" };

  const routeMetrics = DISTANCE_MATRIX[selectedVenueDistrict] || {
    km: 25,
    minutes: 45,
    terrain: "Jalan Kabupaten Kebumen (Lancar)",
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    `${vendorStudioAddress}, Kecamatan ${vendorStudioDistrict}, Kabupaten Kebumen`
  )}&destination=${encodeURIComponent(
    `${venueName}, Kecamatan ${selectedVenueDistrict}, Kabupaten Kebumen`
  )}`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hk-champagne/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <RouteIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
              Navigasi Peta Rute &amp; Estimasi Hari H
            </h3>
            <p className="text-xs text-hk-charcoal/70 font-manrope">
              Visualisasi jarak tempuh dari studio Anda ke lokasi acara calon pengantin di Kabupaten Kebumen.
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-hk-taupe hover:bg-[#78644e] text-white text-xs font-manrope font-semibold transition-all shadow-xs min-h-[44px] cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Buka di Google Maps / Waze</span>
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>
      </div>

      {/* Selector Venue Simulasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
            Lokasi Asal (Studio Vendor)
          </label>
          <div className="p-3 rounded-xl bg-hk-ivory/60 border border-hk-champagne/40 text-xs font-manrope text-hk-charcoal">
            <p className="font-bold flex items-center gap-1.5 text-hk-charcoal">
              <MapPin className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Kecamatan {vendorStudioDistrict}</span>
            </p>
            <p className="text-[11px] text-hk-charcoal/70 mt-0.5">{vendorStudioAddress}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-hk-charcoal font-manrope mb-1.5">
            Tujuan Acara Klien (Kecamatan di Kebumen)
          </label>
          <select
            value={selectedVenueDistrict}
            onChange={(e) => setSelectedVenueDistrict(e.target.value)}
            className="w-full py-2.5 px-3.5 rounded-xl border border-hk-champagne/60 focus:border-hk-taupe bg-hk-ivory/50 focus:bg-white text-xs text-hk-charcoal font-manrope focus:outline-none transition-all"
          >
            {KEBUMEN_DISTRICTS.map((kec) => (
              <option key={kec} value={kec}>
                Kecamatan {kec} {kec === "Ayah" ? "(Pantai Menganti / Logending)" : ""} {kec === "Kebumen" ? "(Pusat Kota / Setda)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual In-App Route Vector Map */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-radial from-[#F9F7F2] to-[#EFE7DC] border border-hk-champagne/40 overflow-hidden shadow-inner flex items-center justify-center p-4">
        {/* Kebumen Outline Representation & Road Grid */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-h-full preserve-3d"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.04))" }}
        >
          {/* Kabupaten Boundary Abstract Line */}
          <path
            d="M 15 35 Q 25 15 50 15 Q 75 15 85 30 Q 95 55 85 75 Q 55 88 15 80 Q 5 60 15 35 Z"
            fill="none"
            stroke="#D6C6B2"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Major Road Arteries in Kebumen */}
          <line x1="20" y1="40" x2="85" y2="52" stroke="#E0D2C1" strokeWidth="1.2" />
          <line x1="50" y1="18" x2="52" y2="70" stroke="#E0D2C1" strokeWidth="1" />
          <line x1="14" y1="75" x2="80" y2="74" stroke="#D8C6B0" strokeWidth="1.4" strokeDasharray="3 2" />

          {/* Active Travel Route (From Vendor Studio to Client Venue) */}
          <path
            d={`M ${originCoords.x} ${originCoords.y} Q ${(originCoords.x + destCoords.x) / 2 + 5} ${
              (originCoords.y + destCoords.y) / 2 - 8
            } ${destCoords.x} ${destCoords.y}`}
            fill="none"
            stroke="#88735B"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Vendor Studio Node (Origin) */}
          <circle cx={originCoords.x} cy={originCoords.y} r="3.2" fill="#2B2B2B" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx={originCoords.x} cy={originCoords.y} r="6" fill="#2B2B2B" opacity="0.15" />
          <text
            x={originCoords.x}
            y={originCoords.y - 4.5}
            textAnchor="middle"
            fontSize="3"
            fontWeight="bold"
            fill="#2B2B2B"
            fontFamily="sans-serif"
          >
            Studio Vendor ({vendorStudioDistrict})
          </text>

          {/* Client Venue Node (Destination) */}
          <circle cx={destCoords.x} cy={destCoords.y} r="3.6" fill="#88735B" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx={destCoords.x} cy={destCoords.y} r="7" fill="#88735B" opacity="0.25" className="animate-ping" />
          <text
            x={destCoords.x}
            y={destCoords.y + 7}
            textAnchor="middle"
            fontSize="3.2"
            fontWeight="bold"
            fill="#88735B"
            fontFamily="sans-serif"
          >
            Venue Acara ({selectedVenueDistrict})
          </text>
        </svg>

        {/* Floating Mini Compass & Route Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-hk-champagne/40 text-[10px] font-manrope font-bold text-hk-charcoal flex items-center gap-1.5 shadow-xs">
          <Compass className="w-3 h-3 text-hk-taupe animate-spin" style={{ animationDuration: "20s" }} />
          <span>Hyperlocal GPS Pilot Kebumen</span>
        </div>
      </div>

      {/* Route Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <RouteIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-hk-charcoal/60 font-manrope">
              Estimasi Jarak
            </span>
            <p className="text-sm font-manrope font-bold text-hk-charcoal tabular-nums">
              ± {routeMetrics.km} km
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-hk-charcoal/60 font-manrope">
              Waktu Tempuh Kendaraan
            </span>
            <p className="text-sm font-manrope font-bold text-hk-charcoal tabular-nums">
              ± {routeMetrics.minutes} Menit
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-hk-charcoal/60 font-manrope">
              Kondisi Medan Jalan
            </span>
            <p className="text-xs font-manrope font-semibold text-hk-charcoal truncate">
              {routeMetrics.terrain}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
