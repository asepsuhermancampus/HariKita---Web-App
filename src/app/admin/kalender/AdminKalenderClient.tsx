"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Filter,
  Sparkles,
  Search,
  ShieldCheck,
} from "lucide-react";
import { EmptyState, DatePicker } from "@/components/harikita/ui";
import { AdminPageHeader } from "@/components/admin";
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
  const [selectedDate, setSelectedDate] = useState("");

  // Sumber tunggal: event dari DATABASE (admin-only). Tidak ada data demo/baseline
  // yang disuntikkan agar panel governance ini tidak menampilkan acara fiktif.
  const allEvents: MasterEvent[] = dbEvents.map((e) => ({
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

  // Filter events
  const filteredEvents = allEvents.filter((ev) => {
    const matchesDistrict =
      selectedDistrict === "all" ||
      ev.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesSearch =
      ev.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || ev.date === selectedDate;
    return matchesDistrict && matchesSearch && matchesDate;
  });

  const totalEscrowManaged = allEvents.reduce((acc, ev) => acc + ev.totalAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <AdminPageHeader
          title="Master Multi-Vendor Calendar"
          description="Peta jadwal seluruh pernikahan di 26 kecamatan Kabupaten Kebumen untuk sinkronisasi operasional multi-vendor."
          action={
            <Link
              href="/hub-koordinasi"
              className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#4A2E35] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#6B5E62]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" aria-hidden="true" />
              Buka Visual Radar 9Router
            </Link>
          }
        />

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
              <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Rekening Bersama Aman
            </span>
          </div>
        </div>

        {/* Filter by District & Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#C5A880]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#C5A880]" aria-hidden="true" />
              <label htmlFor="district-filter" className="text-xs font-semibold text-[#4A2E35]">Wilayah:</label>
              <select
                id="district-filter"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="focus-ring text-xs p-2 rounded-xl border border-[#E5D7C7] bg-[#FAF8F5] text-[#4A2E35] focus:outline-none focus:border-[#C5A880]"
              >
                <option value="all">Semua 26 Kecamatan di Kebumen</option>
                {ALL_26_KEBUMEN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    Kecamatan {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-52">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Filter tanggal acara..."
                size="sm"
                displayFormat="d MMMM yyyy"
              />
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6B5E62] absolute left-3 top-3" aria-hidden="true" />
            <label htmlFor="calendar-search" className="sr-only">Cari pengantin atau venue</label>
            <input
              id="calendar-search"
              type="search"
              placeholder="Cari pengantin atau venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus-ring w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E5D7C7] text-xs focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        {/* Master Calendar Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <EmptyState
              icon="inbox"
              title={
                allEvents.length === 0
                  ? "Belum ada jadwal acara di database"
                  : "Tidak ada jadwal yang cocok"
              }
              description={
                allEvents.length === 0
                  ? "Master calendar akan terisi otomatis ketika pesanan tersimpan di sistem. Tidak ada data contoh yang ditampilkan di panel ini."
                  : "Coba ubah filter wilayah atau kata kunci pencarian Anda."
              }
            />
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
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" aria-hidden="true" />
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
