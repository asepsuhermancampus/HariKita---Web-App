"use client";

import React, { useState } from "react";
import {
  CloudSun,
  Sun,
  Wind,
  Droplets,
  Sunset,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface VendorWeatherWidgetProps {
  category?: string;
  district?: string;
}

export function VendorWeatherWidget({
  category = "Pre-wedding",
  district = "Kebumen",
}: VendorWeatherWidgetProps) {
  const [selectedDay, setSelectedDay] = useState<"today" | "event">("event");

  // Mock data prakiraan cuaca Kebumen real-time
  const weatherData = {
    temp: 28,
    tempMin: 24,
    tempMax: 31,
    condition: "Cerah Berawan (Ideal untuk Outdoor)",
    humidity: 74,
    windSpeed: 14,
    windDirection: "Selatan (Samudra Hindia)",
    goldenHour: "17:15 - 17:48 WIB",
    uvIndex: "Moderat (SPF 30+ disarankan)",
  };

  // Rekomendasi operasional spesifik sesuai kategori layanan vendor
  const getCategoryAdvice = () => {
    switch (category) {
      case "Makeup Artist (MUA)":
        return {
          title: "Saran Teknis Riasan MUA",
          text: "Kelembapan 74%: Gunakan primer mattifying anti-humidity dan setting spray ekstra lock agar soft-glam bertahan 12+ jam di venue semi-outdoor.",
          color: "text-hk-taupe",
        };
      case "Dekorasi & Florist":
        return {
          title: "Saran Struktur Pelaminan & Florist",
          text: "Angin laut 14 km/jam: Pastikan pemberat rangka backdrop 3x2.5m terpasang ganda dan gunakan spons hidrasi bunga basah untuk ketahanan ronce melati.",
          color: "text-emerald-800",
        };
      case "Pre-wedding":
      case "Dokumentasi Foto-Video":
        return {
          title: "Rekomendasi Pencahayaan Golden Hour",
          text: "Cahaya keemasan terbaik Pantai Menganti / Bukit Hood terjadi pada pukul 17:15 WIB. Siapkan lensa 85mm & filter ND untuk tangkapan sinematik sunset.",
          color: "text-amber-800",
        };
      case "Katering & Food Stalls":
        return {
          title: "Saran Higienitas & Penyajian Katering",
          text: "Suhu siang 31°C: Siapkan cover acrylic untuk food stalls hidangan pembuka dan perbanyak pasokan es batu untuk welcome drink tamu.",
          color: "text-blue-800",
        };
      default:
        return {
          title: "Saran Logistik Lapangan",
          text: "Cuaca diprakirakan bersahabat tanpa potensi hujan lebat. Tim dapat tiba di lokasi sesuai SLA tanpa kendala cuaca ekstrem.",
          color: "text-hk-charcoal",
        };
    }
  };

  const advice = getCategoryAdvice();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-5 font-manrope">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hk-champagne/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
              Prakiraan Cuaca Hari H Wilayah Kebumen
            </h3>
            <p className="text-xs text-hk-charcoal/70">
              Sensor mikroklimat pesisir &amp; daratan Kabupaten Kebumen untuk antisipasi teknis kru vendor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-hk-ivory p-1 rounded-full border border-hk-champagne/40 self-start sm:self-auto">
          <button
            onClick={() => setSelectedDay("event")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedDay === "event"
                ? "bg-hk-charcoal text-white shadow-2xs"
                : "text-hk-charcoal/70 hover:text-hk-charcoal"
            }`}
          >
            Hari H Acara
          </button>
          <button
            onClick={() => setSelectedDay("today")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedDay === "today"
                ? "bg-hk-charcoal text-white shadow-2xs"
                : "text-hk-charcoal/70 hover:text-hk-charcoal"
            }`}
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Main Weather Display */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        {/* Big Temperature Block */}
        <div className="sm:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex flex-col justify-center items-center text-center shadow-xs">
          <Sun className="w-8 h-8 text-amber-600 mb-1 animate-pulse" />
          <span className="font-editorial text-4xl sm:text-5xl font-normal text-hk-charcoal tabular-nums">
            {weatherData.temp}°C
          </span>
          <span className="text-[11px] font-bold text-amber-900 mt-0.5">
            {weatherData.condition}
          </span>
          <span className="text-[10px] text-amber-800/70 mt-1">
            Min: {weatherData.tempMin}°C • Max: {weatherData.tempMax}°C
          </span>
        </div>

        {/* Detailed Metrics */}
        <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 flex items-start gap-2.5">
            <Droplets className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-hk-charcoal/60">
                Kelembapan Udara
              </span>
              <p className="text-sm font-bold text-hk-charcoal tabular-nums">
                {weatherData.humidity}%
              </p>
              <p className="text-[10px] text-hk-charcoal/60 mt-0.5">Lembap Tropis Kebumen</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 flex items-start gap-2.5">
            <Wind className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-hk-charcoal/60">
                Kecepatan Angin
              </span>
              <p className="text-sm font-bold text-hk-charcoal tabular-nums">
                {weatherData.windSpeed} km/jam
              </p>
              <p className="text-[10px] text-hk-charcoal/60 mt-0.5">{weatherData.windDirection}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 flex items-start gap-2.5">
            <Sunset className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-hk-charcoal/60">
                Golden Hour Sunset
              </span>
              <p className="text-sm font-bold text-hk-charcoal tabular-nums">
                {weatherData.goldenHour}
              </p>
              <p className="text-[10px] text-hk-charcoal/60 mt-0.5">Spot Pantai &amp; Bukit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Category Advice Alert */}
      <div className="p-4 rounded-2xl bg-hk-soft-beige/60 border border-hk-champagne/40 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-hk-taupe shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-hk-charcoal">{advice.title}</h4>
          <p className="text-xs text-hk-charcoal/80 mt-0.5 leading-relaxed">{advice.text}</p>
        </div>
      </div>
    </div>
  );
}
