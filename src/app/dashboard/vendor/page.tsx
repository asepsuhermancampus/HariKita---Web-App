"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  Store,
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/25 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>Portal Mitra Vendor Terverifikasi Kebumen</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold mt-2">
            {vendorInfo.name}
          </h1>
          <p className="text-xs text-plum-light mt-1">
            Kategori: <strong className="text-plum">{vendorInfo.category}</strong> • Lokasi: {vendorInfo.city} • Rating: ⭐ {vendorInfo.rating} ({vendorInfo.ordersCompleted} Acara Sukses)
          </p>
        </div>

        {/* Quick Wallet Balance */}
        <div className="p-4 rounded-2xl bg-white border border-gold/30 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl gold-gradient-bg text-plum-dark flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-plum-light uppercase tracking-wider font-bold">
              Saldo Dompet Payout
            </span>
            <p className="font-mono text-xl font-bold text-plum">
              {formatRupiah(vendorInfo.walletBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gold/20 pb-2">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "calendar"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Kalender Blackout Dates (Kunci Tanggal Offline)</span>
        </button>

        <button
          onClick={() => setActiveTab("wallet")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "wallet"
              ? "gold-gradient-bg text-plum-dark shadow-sm"
              : "text-plum-light hover:bg-gold/10"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Dompet Payout & Termin Escrow</span>
        </button>
      </div>

      {/* TAB 1: BLACKOUT DATES CALENDAR */}
      {activeTab === "calendar" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif-luxury text-xl font-bold text-plum">
                Kunci Tanggal Sibuk / Booking Offline
              </h3>
              <p className="text-xs text-plum-light leading-relaxed">
                Tanggal yang Anda kunci di sini otomatis <strong>TIDAK BISA DIBOOKING</strong> oleh calon pengantin di platform HariKita Kebumen. Ini mencegah terjadinya double-booking jadwal pemotretan atau acara.
              </p>
            </div>

            {/* Quick add date */}
            <form onSubmit={addCustomDate} className="flex items-center gap-3 pt-2">
              <input
                type="date"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="input input-sm bg-[#FAF8F5] border-gold/30 rounded-xl text-plum text-xs"
              />
              <button
                type="submit"
                className="btn btn-sm gold-gradient-bg text-plum-dark font-bold rounded-xl border-none"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                Kunci Tanggal Ini
              </button>
            </form>
          </div>

          {/* List of currently locked dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {blackoutDates.map((dateStr) => (
              <div
                key={dateStr}
                className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-rose-900 block">
                      {dateStr}
                    </span>
                    <span className="text-[10px] text-rose-600 font-semibold">Terkunci (Offline Booking)</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleBlackoutDate(dateStr)}
                  className="btn btn-xs btn-ghost text-rose-700 hover:bg-rose-200/60 rounded-lg text-[10px]"
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
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-md space-y-4">
            <span className="text-xs uppercase font-bold text-gold-dark">Saldo Siap Tarik</span>
            <p className="font-mono text-3xl font-bold text-plum">
              {formatRupiah(vendorInfo.walletBalance)}
            </p>
            <p className="text-[11px] text-plum-light leading-relaxed">
              Hak dana 30% dari pesanan yang telah memasuki H-3 acara, dan 70% pelunasan dari acara yang telah sukses diselesaikan di Kebumen.
            </p>
            <button className="btn btn-sm w-full gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-sm">
              Tarik Saldo ke Rekening BCA
            </button>
          </div>

          {/* Escrow On-Hold Card */}
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-md space-y-4">
            <span className="text-xs uppercase font-bold text-amber-700">Dana On-Hold di Escrow</span>
            <p className="font-mono text-3xl font-bold text-plum">
              {formatRupiah(2450000)}
            </p>
            <p className="text-[11px] text-plum-light leading-relaxed">
              Pelunasan 70% dari 1 acara aktif yang sedang berlangsung (Bima & Citra). Akan otomatis cair pada H+2 pasca-acara setelah konfirmasi sukses klien.
            </p>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] border border-amber-200">
              Acara tanggal: 20 Nov 2026 (Setda Kebumen)
            </div>
          </div>

          {/* Performance Metrik */}
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-md space-y-4">
            <span className="text-xs uppercase font-bold text-emerald-800">Metrik Trafik Profil</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-plum">
                <span>Views Portofolio:</span>
                <span className="font-bold">428 kali</span>
              </div>
              <div className="flex justify-between text-plum">
                <span>Klik Pricelist:</span>
                <span className="font-bold">112 kali</span>
              </div>
              <div className="flex justify-between text-plum">
                <span>Masuk Keranjang Builder:</span>
                <span className="font-bold">39 kali</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] font-semibold border border-emerald-200">
              🔥 Kategori Terpopuler di Kebumen bulan ini!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
