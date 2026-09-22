"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  Calendar,
  Wallet,
  Lock,
} from "lucide-react";
import { DatePicker } from "@/components/harikita/ui";
import { DashPageHeader } from "@/components/dashboard";

export default function VendorPortalPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "package" | "wallet">("calendar");

  // Mock Vendor Data
  const vendorInfo = {
    name: "Menganti Cinematic & Studio",
    category: "Pre-wedding",
    city: "Kebumen",
    walletBalance: 4900000,
    ordersCompleted: 24,
    rating: 4.9,
  };

  // Blackout dates state
  const [blackoutDates, setBlackoutDates] = useState<string[]>([
    "2026-11-14",
    "2026-11-15",
    "2026-12-05",
  ]);
  const [newDateInput, setNewDateInput] = useState("");

  const toggleBlackoutDate = (dateStr: string) => {
    if (blackoutDates.includes(dateStr)) {
      setBlackoutDates(blackoutDates.filter((d) => d !== dateStr));
    } else {
      setBlackoutDates([...blackoutDates, dateStr]);
    }
  };

  const addCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDateInput && !blackoutDates.includes(newDateInput)) {
      setBlackoutDates([...blackoutDates, newDateInput]);
      setNewDateInput("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title={vendorInfo.name}
        description={`Kategori ${vendorInfo.category} • ${vendorInfo.city} • ${vendorInfo.ordersCompleted} acara sukses`}
        action={
          <div className="flex items-center gap-4 rounded-2xl border border-hk-champagne/30 bg-white p-4 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-hk-champagne to-hk-taupe text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-hk-taupe">
                Saldo Dompet Payout
              </span>
              <p className="font-mono text-xl font-bold text-hk-charcoal">
                {formatRupiah(vendorInfo.walletBalance)}
              </p>
            </div>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hk-soft-beige pb-2">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "calendar"
              ? "bg-hk-taupe text-white shadow-sm"
              : "text-hk-taupe hover:bg-hk-ivory"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Kalender Blackout Dates</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "wallet"
              ? "bg-hk-taupe text-white shadow-sm"
              : "text-hk-taupe hover:bg-hk-ivory"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Dompet Payout & Termin Escrow</span>
        </button>
      </div>

      {/* TAB 1: BLACKOUT DATES CALENDAR */}
      {activeTab === "calendar" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-hk-champagne/30 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-editorial text-xl font-medium text-hk-charcoal">
                Kunci Tanggal Sibuk / Booking Offline
              </h3>
              <p className="text-xs text-hk-taupe leading-relaxed">
                Tanggal yang Anda kunci di sini otomatis <strong>TIDAK BISA DIBOOKING</strong> oleh calon pengantin di platform HariKita Kebumen. Ini mencegah terjadinya double-booking jadwal pemotretan atau acara.
              </p>
            </div>

            {/* Quick add date */}
            <form onSubmit={addCustomDate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="w-full sm:w-64">
                <DatePicker
                  value={newDateInput}
                  onChange={(d) => setNewDateInput(d)}
                  placeholder="Pilih tanggal offline..."
                  size="sm"
                  blackoutDates={blackoutDates}
                  displayFormat="EEEE, dd MMMM yyyy"
                />
              </div>
              <button
                type="submit"
                className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-hk-taupe px-4 text-sm font-bold text-white hover:bg-hk-charcoal"
              >
                <Lock className="w-3.5 h-3.5" />
                Kunci Tanggal Ini
              </button>
            </form>
          </div>

          {/* List of currently locked dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {blackoutDates.map((dateStr) => (
              <div
                key={dateStr}
                className="p-4 rounded-2xl bg-[#fdeceb] border border-[#f3c9c6] flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#fadad7] text-[#a2352f]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-[#7a2620] block">
                      {dateStr}
                    </span>
                    <span className="text-[10px] text-[#a2352f] font-semibold">Terkunci (Offline)</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleBlackoutDate(dateStr)}
                  className="focus-ring min-h-9 rounded-lg px-3 text-[10px] font-bold text-[#a2352f] hover:bg-[#f3c9c6]/60"
                >
                  Buka Kunci
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WALLET & ESCROW PAYOUTS */}
      {activeTab === "wallet" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main Balance Card */}
          <div className="p-6 rounded-3xl bg-white border border-hk-champagne/30 shadow-sm space-y-4">
            <span className="text-xs uppercase font-bold text-hk-taupe">Saldo Siap Tarik</span>
            <p className="font-mono text-3xl font-bold text-hk-charcoal">
              {formatRupiah(vendorInfo.walletBalance)}
            </p>
            <p className="text-[11px] text-hk-taupe leading-relaxed">
              Hak dana 30% dari pesanan yang telah memasuki H-3 acara, dan 70% pelunasan dari acara yang telah sukses diselesaikan di Kebumen.
            </p>
            <button className="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-full bg-hk-taupe px-4 text-sm font-bold text-white hover:bg-hk-charcoal">
              Tarik Saldo ke Rekening BCA
            </button>
          </div>

          {/* Escrow On-Hold Card */}
          <div className="p-6 rounded-3xl bg-white border border-hk-champagne/30 shadow-sm space-y-4">
            <span className="text-xs uppercase font-bold text-[#8a6410]">Dana On-Hold di Escrow</span>
            <p className="font-mono text-3xl font-bold text-hk-charcoal">
              {formatRupiah(2450000)}
            </p>
            <p className="text-[11px] text-hk-taupe leading-relaxed">
              Pelunasan 70% dari 1 acara aktif yang sedang berlangsung (Bima &amp; Citra). Akan otomatis cair pada H+2 pasca-acara setelah konfirmasi sukses klien.
            </p>
            <div className="p-2.5 rounded-xl bg-[#fbf0d8] text-[#7a5608] text-[11px] border border-[#f0dcae]">
              Acara tanggal: 20 Nov 2026 (Setda Kebumen)
            </div>
          </div>

          {/* Performance Metrik */}
          <div className="p-6 rounded-3xl bg-white border border-hk-champagne/30 shadow-sm space-y-4">
            <span className="text-xs uppercase font-bold text-[#157a4d]">Metrik Trafik Profil</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-hk-charcoal">
                <span>Views Portofolio:</span>
                <span className="font-bold">428 kali</span>
              </div>
              <div className="flex justify-between text-hk-charcoal">
                <span>Klik Pricelist:</span>
                <span className="font-bold">112 kali</span>
              </div>
              <div className="flex justify-between text-hk-charcoal">
                <span>Masuk Keranjang Builder:</span>
                <span className="font-bold">39 kali</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#e5f4ec] text-[#157a4d] text-[11px] font-semibold border border-[#bfe6d1]">
              Kategori terpopuler di Kebumen bulan ini
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
