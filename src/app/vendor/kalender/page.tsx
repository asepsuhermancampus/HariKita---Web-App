"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useAvailability, availabilityStore } from "@/lib/availability-store";

export default function VendorKalenderPage() {
  const currentVendorName = "Griya Busana Rarasati";
  const availabilityState = useAvailability();

  // Get current vendor's blackout entries from store
  const vendorBlackouts = availabilityStore.getVendorBlackouts(currentVendorName);

  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("Sudah Dipesan Offline");

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDate) {
      availabilityStore.addBlackout({
        vendorName: currentVendorName,
        date: newDate,
        reason,
      });
      setNewDate("");
    }
  };

  const handleRemoveDate = (d: string) => {
    availabilityStore.removeBlackout(currentVendorName, d);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/vendor" className="hover:text-[#4A2E35]">
                Portal Mitra Vendor
              </Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Kalender Blackout</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Kalender Blackout Dates
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Kunci tanggal di mana jadwal Anda sudah terisi di luar platform HariKita atau saat libur operasional.
            </p>
          </div>

          <Link
            href="/hub-koordinasi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4A2E35] text-white text-xs font-semibold hover:bg-[#6B5E62] transition-colors shadow-sm self-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            Cek Matriks Ketersediaan
          </Link>
        </div>

        {/* Lock Date Form Card */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#FAF8F5] pb-3">
            <Lock className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-base font-bold text-[#4A2E35]">
              Kunci Tanggal Offline Baru
            </h3>
          </div>

          <form onSubmit={handleAddDate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Pilih Tanggal:
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#4A2E35] font-semibold mb-1">
                Alasan Penguncian:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              >
                <option value="Sudah Dipesan Offline">Sudah Dipesan Offline</option>
                <option value="Libur Kru / Istirahat">Libur Kru / Istirahat</option>
                <option value="Acara Keluarga Internal">Acara Keluarga Internal</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A2E35] text-white font-semibold hover:bg-[#6B5E62] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
                Kunci Tanggal Ini
              </button>
            </div>
          </form>
        </div>

        {/* Current Blackout Dates List */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#FAF8F5] pb-3">
            <h3 className="font-serif text-base font-bold text-[#4A2E35]">
              Daftar Tanggal Terkunci ({vendorBlackouts.length} Tanggal)
            </h3>
            <span className="text-xs text-[#6B5E62]">
              Calon pengantin tidak dapat memesan jadwal pada tanggal ini.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vendorBlackouts.map((item) => (
              <div
                key={`${item.vendorId}-${item.date}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-[#4A2E35] block font-mono text-sm">
                      {item.date}
                    </strong>
                    <span className="text-[11px] text-[#6B5E62]">{item.reason}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveDate(item.date)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px]"
                  title="Buka kembali tanggal ini"
                >
                  <Unlock className="w-3.5 h-3.5" /> Buka Kunci
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
