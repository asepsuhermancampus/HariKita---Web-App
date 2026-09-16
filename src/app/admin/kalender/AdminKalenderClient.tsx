"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Filter,
  Users,
  Building,
  CheckCircle2,
  Sparkles,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useOrders } from "@/lib/order-store";
import { formatRupiah } from "@/lib/utils";
import type { AdminCalendarEventDTO } from "@/server/queries/orders";

const ALL_26_KEBUMEN_DISTRICTS = [
  "Adimulyo",
  "Alian",
  "Ambal",
  "Ayah",
  "Bonorowo",
  "Buayan",
  "Buluspesantren",
  "Gombong",
  "Karanganyar",
  "Karanggayam",
  "Karangsambung",
  "Kebumen Kota",
  "Klirong",
  "Kutowinangun",
  "Kuwarasan",
  "Mirit",
  "Padureso",
  "Pejagoan",
  "Petanahan",
  "Poncowarno",
  "Prembun",
  "Puring",
  "Rowokele",
  "Sadang",
  "Sempor",
  "Sruweng",
];

interface MasterEvent {
  id: string;
  date: string;
  client: string;
  venue: string;
  district: string;
  vendorsCount: number;
  totalAmount: number;
  vendors: { name: string; role: string; callTime: string }[];
  status: "TERKUNCI_DP" | "LUNAS_ESCROW" | "SELESAI";
}

export function AdminMasterKalenderPage({
  dbEvents = [],
}: {
  dbEvents?: AdminCalendarEventDTO[];
}) {
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { orders } = useOrders();

  // Baseline events in Kebumen
  const baselineEvents: MasterEvent[] = [
    {
      id: "HK-EV-01",
      date: "2026-10-18",
      client: "Aditya & Larasati",
      venue: "Pendopo Ronggowarsito",
      district: "Kebumen Kota",
      vendorsCount: 4,
      totalAmount: 18500000,
      vendors: [
        { name: "Arjuna Cinematic", role: "Foto & Video", callTime: "05:30 WIB" },
        { name: "Griya Rarasati", role: "Busana & Fitting", callTime: "06:00 WIB" },
        { name: "Alula MUA", role: "MUA", callTime: "04:30 WIB" },
        { name: "Dapur Rasa Boga", role: "Katering", callTime: "08:00 WIB" },
      ],
      status: "TERKUNCI_DP",
    },
    {
      id: "HK-EV-02",
      date: "2026-11-20",
      client: "Bima & Citra",
      venue: "Gedung Pertemuan Setda Kebumen",
      district: "Kebumen Kota",
      vendorsCount: 5,
      totalAmount: 24750000,
      vendors: [
        { name: "Menganti Studio", role: "Prewed", callTime: "08:00 WIB" },
        { name: "Griya Rarasati", role: "Busana", callTime: "06:00 WIB" },
        { name: "Alula MUA", role: "MUA", callTime: "05:00 WIB" },
        { name: "Dapur Rasa Boga", role: "Katering", callTime: "08:30 WIB" },
        { name: "HariKita Digital", role: "Undangan & Cetak", callTime: "08:00 WIB" },
      ],
      status: "TERKUNCI_DP",
    },
    {
      id: "HK-EV-03",
      date: "2026-11-28",
      client: "Dimas & Anggi",
      venue: "Hotel Mexolie Kebumen",
      district: "Kebumen Kota",
      vendorsCount: 3,
      totalAmount: 14200000,
      vendors: [
        { name: "Asmara Flora", role: "Dekorasi", callTime: "03:00 WIB" },
        { name: "Pradana Cinema", role: "Video", callTime: "07:00 WIB" },
        { name: "L'Aura Cakes", role: "Kue & Dessert", callTime: "08:00 WIB" },
      ],
      status: "TERKUNCI_DP",
    },
    {
      id: "HK-EV-04",
      date: "2026-12-12",
      client: "Fajar & Sekar",
      venue: "Kediaman Mempelai, Gombong",
      district: "Gombong",
      vendorsCount: 3,
      totalAmount: 12500000,
      vendors: [
        { name: "Hantaran Lestari", role: "Seserahan", callTime: "07:00 WIB" },
        { name: "Alula MUA", role: "MUA", callTime: "05:30 WIB" },
        { name: "Dapur Rasa Boga", role: "Katering", callTime: "09:00 WIB" },
      ],
      status: "TERKUNCI_DP",
    },
  ];

  // Convert real dynamic orders from orderStore into master events
  const dynamicEvents: MasterEvent[] = orders
    .filter((o) => !baselineEvents.some((b) => b.id === o.id))
    .map((ord) => ({
      id: ord.id,
      date: ord.eventDate,
      client: ord.customerName,
      venue: ord.eventLocation,
      district: ord.district || "Kebumen Kota",
      vendorsCount: ord.items.length,
      totalAmount: ord.financials?.totalAmount || 0,
      vendors: ord.items.map((i) => ({
        name: i.vendorName,
        role: i.categoryTitle,
        callTime: i.callTime || "08:00 WIB",
      })),
      status: ord.paymentStatus === "DP_PAID" ? "TERKUNCI_DP" : "LUNAS_ESCROW",
    }));

  // Event dari database (admin-only) — sumber utama bila tersedia.
  const dbMasterEvents: MasterEvent[] = dbEvents.map((e) => ({
    id: e.id,
    date: e.date,
    client: e.client,
    venue: e.venue,
    district: e.district,
    vendorsCount: e.vendorsCount,
    totalAmount: e.totalAmount,
    vendors: e.vendors,
    status: e.status,
  }));

  // Gabung: DB event + dynamic mock + baseline, hilangkan duplikat by id.
  const seenIds = new Set<string>();
  const allEvents: MasterEvent[] = [
    ...dbMasterEvents,
    ...dynamicEvents,
    ...baselineEvents,
  ].filter((ev) => {
    if (seenIds.has(ev.id)) return false;
    seenIds.add(ev.id);
    return true;
  });

  // Filter events
  const filteredEvents = allEvents.filter((ev) => {
    const matchesDistrict =
      selectedDistrict === "all" ||
      ev.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesSearch =
      ev.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  const totalEscrowManaged = allEvents.reduce((acc, ev) => acc + ev.totalAmount, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/admin" className="hover:text-[#4A2E35]">
                Super Admin
              </Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Master Kalender Kebumen</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Master Multi-Vendor Calendar
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Peta jadwal seluruh pernikahan di 26 kecamatan Kabupaten Kebumen untuk sinkronisasi operasional multi-vendor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/hub-koordinasi"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A2E35] text-white text-xs font-semibold hover:bg-[#6B5E62] transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              Buka Visual Radar 9Router
            </Link>
          </div>
        </div>

        {/* Master KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#C5A880]/30 shadow-sm">
            <span className="text-[11px] text-[#6B5E62] font-semibold block">
              Total Acara Terjadwal
            </span>
            <div className="font-serif text-2xl font-bold text-[#4A2E35] mt-1">
              {allEvents.length} Acara Pernikahan
            </div>
            <span className="text-[10px] text-emerald-700">Terkunci di Wilayah Kebumen</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#C5A880]/30 shadow-sm">
            <span className="text-[11px] text-[#6B5E62] font-semibold block">
              Vendor Bertugas Terkoneksi
            </span>
            <div className="font-serif text-2xl font-bold text-[#4A2E35] mt-1">
              {allEvents.reduce((acc, e) => acc + e.vendorsCount, 0)} Sesi Layanan
            </div>
            <span className="text-[10px] text-[#C5A880]">Sinkron ke Call Time Hari H</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#C5A880]/30 shadow-sm">
            <span className="text-[11px] text-[#6B5E62] font-semibold block">
              Total Nilai Escrow Terlindungi
            </span>
            <div className="font-serif text-xl font-bold text-emerald-800 mt-1">
              {formatRupiah(totalEscrowManaged)}
            </div>
            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Rekening Bersama Aman
            </span>
          </div>
        </div>

        {/* Filter by District & Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#C5A880]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#C5A880]" />
            <span className="text-xs font-semibold text-[#4A2E35]">Wilayah:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs p-2 rounded-xl border border-[#E5D7C7] bg-[#FAF8F5] text-[#4A2E35] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">Semua 26 Kecamatan di Kebumen</option>
              {ALL_26_KEBUMEN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  Kecamatan {d}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6B5E62] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari pengantin atau venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5D7C7] text-xs focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        {/* Master Calendar Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#C5A880]/30 p-8 text-center text-[#6B5E62] text-xs italic">
              Tidak ada jadwal pernikahan yang ditemukan untuk kriteria filter ini.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4 hover:border-[#C5A880] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FAF8F5]">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-[#4A2E35] text-white font-mono text-xs font-bold shrink-0">
                      {ev.date}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#C5A880] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5D7C7]">
                          {ev.id}
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#4A2E35]">
                          {ev.client}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B5E62] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                        <span>
                          {ev.venue} • Kecamatan <strong>{ev.district}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="font-mono text-xs font-bold text-[#4A2E35]">
                      {formatRupiah(ev.totalAmount)}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                      DP 30% Terkunci
                    </span>
                  </div>
                </div>

                {/* Vendors Call Time Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#6B5E62] block">
                    Mitra Vendor Bertugas ({ev.vendorsCount} Vendor Terkoneksi):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {ev.vendors.map((v, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] space-y-0.5"
                      >
                        <strong className="text-[#4A2E35] block truncate">{v.name}</strong>
                        <div className="text-[11px] text-[#6B5E62]">{v.role}</div>
                        <div className="text-[10px] text-[#C5A880] font-mono font-semibold">
                          Call: {v.callTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
