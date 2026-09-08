"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  ShieldAlert,
  Calendar,
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingUp,
} from "lucide-react";

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"funnel" | "calendar" | "escrow">("funnel");

  // 10-Stage Conversion Funnel Telemetry Data
  const funnelSteps = [
    { step: 1, name: "Trafik Landing Page Kebumen", count: 4850, pct: "100%" },
    { step: 2, name: "Lihat Detail Vendor & Portofolio", count: 2910, pct: "60.0%" },
    { step: 3, name: "Buka Simulator Mix-and-Match", count: 1840, pct: "37.9%" },
    { step: 4, name: "Simulasi Ganti Pax / Baki / Tema", count: 1220, pct: "25.1%" },
    { step: 5, name: "Klik 'Ajukan Pesanan & Booking'", count: 480, pct: "9.8%" },
    { step: 6, name: "Input WhatsApp (Lazy Registration)", count: 210, pct: "4.3%" },
    { step: 7, name: "Terbit Invoice DP 30% Escrow", count: 145, pct: "2.9%" },
    { step: 8, name: "DP 30% Terbayar (Kunci Tanggal)", count: 98, pct: "2.0%" },
    { step: 9, name: "Pelunasan 70% Terbayar H-7", count: 62, pct: "1.2%" },
    { step: 10, name: "Penyelesaian Sukses Pasca-Acara H+2", count: 59, pct: "1.2%" },
  ];

  const masterCalendarEvents = [
    {
      date: "2026-11-20",
      client: "Bima & Citra",
      venue: "Gedung Setda Kebumen",
      status: "TERKUNCI_DP",
      vendorsCount: 6,
      vendors: ["Menganti Studio", "Griya Rarasati", "Alula MUA", "Rasa Boga", "HariKita Undangan"],
    },
    {
      date: "2026-11-28",
      client: "Dimas & Anggi",
      venue: "Trio Azana Hotel Kebumen",
      status: "TERKUNCI_DP",
      vendorsCount: 4,
      vendors: ["Asmara Flora", "Pradana Cinema", "Kriya Anyam", "L'Aura Cakes"],
    },
    {
      date: "2026-12-05",
      client: "Reza & Winda",
      venue: "Pendopo Kabumian Kebumen",
      status: "SELESAI_PELUNASAN",
      vendorsCount: 8,
      vendors: ["Semua 8 Vendor Konsorsium"],
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/25 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Admin Dashboard Governance</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold mt-2">
            Master Kontrol HariKita Kebumen
          </h1>
          <p className="text-xs text-plum-light mt-1">
            Monitoring 10-Tahapan Funnel Konversi, Jadwal Multi-Vendor Seluruh Kebumen, dan Kliring Dana Escrow.
          </p>
        </div>

        {/* Global GMV Stats */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-gold/30 shadow-xs text-right">
            <span className="text-[10px] text-plum-light font-bold uppercase">Total Nilai Transaksi (GMV)</span>
            <p className="font-mono text-xl font-bold text-plum">{formatRupiah(142500000)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gold/20 pb-2">
        <button
          onClick={() => setActiveTab("funnel")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "funnel"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Master 10-Tahapan Funnel Konversi</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "calendar"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Master Kalender Multi-Vendor Se-Kebumen</span>
        </button>

        <button
          onClick={() => setActiveTab("escrow")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "escrow"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Kliring & Settlement Rekening Bersama</span>
        </button>
      </div>

      {/* TAB 1: 10-STAGE FUNNEL */}
      {activeTab === "funnel" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-sm space-y-2">
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Telemetri 10 Tahapan Konversi Platform
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Memantau alur perjalanan pengguna mulai dari kunjungan awal, interaksi dengan simulator, lazy registration WhatsApp, hingga rilis escrow pasca-acara di Kebumen.
            </p>
          </div>

          <div className="space-y-2">
            {funnelSteps.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-2xl bg-white border border-gold/25 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-gold/15 text-plum-dark text-xs font-bold flex items-center justify-center font-mono">
                    {item.step}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-plum block">{item.name}</span>
                    <span className="text-[10px] text-plum-light font-mono">{item.count} Pengguna</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div
                      className="gold-gradient-bg h-full rounded-full"
                      style={{ width: item.pct }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-gold-dark w-12 text-right">
                    {item.pct}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER CALENDAR SE-KEBUMEN */}
      {activeTab === "calendar" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-sm space-y-2">
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Peta Jadwal Seluruh Vendor Kabupaten Kebumen
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Memastikan tidak ada bentrok jadwal antar vendor lokal pada tanggal yang sama. Seluruh booking diverifikasi secara real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {masterCalendarEvents.map((evt, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-gold/30 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gold-dark bg-gold/15 px-3 py-1 rounded-full">
                    {evt.date}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                    {evt.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif-luxury text-xl font-bold text-plum">{evt.client}</h4>
                  <p className="text-xs text-plum-light flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{evt.venue}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-gold/15 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-plum-light">
                    {evt.vendorsCount} Vendor Terlibat:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {evt.vendors.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-gold/20 text-plum">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESCROW SETTLEMENT */}
      {activeTab === "escrow" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-sm space-y-2">
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Pusat Penyelesaian & Kliring Rekening Bersama
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Daftar transaksi dalam masa tahan escrow. Rilis 30% hak vendor operasional H-3 dan rilis 70% pelunasan pasca-acara H+2 di Kebumen.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-gold/25 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-gold/20 pb-3">
              <span className="font-bold text-plum">Pesanan: HK-KBM-202611-001 (Bima & Citra)</span>
              <span className="font-mono font-bold text-emerald-700">DP 30% Siap Rilis H-3</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-plum">
              <div>
                <span className="text-plum-light block">Total Nilai Paket:</span>
                <span className="font-mono font-bold">{formatRupiah(16800000)}</span>
              </div>
              <div>
                <span className="text-plum-light block">DP 30% Terbayar:</span>
                <span className="font-mono font-bold text-emerald-800">{formatRupiah(5040000)}</span>
              </div>
              <div>
                <span className="text-plum-light block">Pelunasan 70% (Escrow):</span>
                <span className="font-mono font-bold text-amber-700">{formatRupiah(11760000)}</span>
              </div>
              <div>
                <span className="text-plum-light block">Jadwal Rilis Pelunasan:</span>
                <span className="font-bold">22 Nov 2026 (H+2)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button className="btn btn-xs gold-gradient-bg text-plum-dark font-bold rounded-full border-none">
                Verifikasi & Rilis Hak Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
