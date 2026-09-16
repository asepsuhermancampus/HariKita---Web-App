"use client";

import React, { useState } from "react";
import {
  Wallet,
  ShieldCheck,
  FileCheck2,
  Download,
  AlertCircle,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface VendorRevenueSplitCardProps {
  grossRevenue?: number;
  walletBalance?: number;
  ordersCount?: number;
}

export function VendorRevenueSplitCard({
  grossRevenue = 15850000,
  walletBalance = 4900000,
  ordersCount = 21,
}: VendorRevenueSplitCardProps) {
  const [activeTab, setActiveTab] = useState<"escrow" | "sla" | "invoice">("escrow");

  // Perhitungan Split Revenue 90% Vendor : 10% Superadmin (Platform Provider)
  const platformFeeRate = 0.10; // 10%
  const vendorNetRate = 0.90; // 90%

  const platformFee = Math.round(grossRevenue * platformFeeRate);
  const vendorNetRevenue = grossRevenue - platformFee;

  // Termin Pembayaran Escrow
  const dpEscrow30 = Math.round(vendorNetRevenue * 0.30);
  const settlementEscrow70 = vendorNetRevenue - dpEscrow30;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6 font-manrope">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hk-champagne/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-hk-ivory border border-hk-champagne/40 flex items-center justify-center text-hk-taupe">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
              Perhitungan Omset, Bagi Hasil &amp; Escrow
            </h3>
            <p className="text-xs text-hk-charcoal/70">
              Skema transparan: 90% Hak Bersih Mitra Vendor &amp; 10% Platform Fee HariKita (Superadmin).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Rekening Bersama Terproteksi</span>
        </div>
      </div>

      {/* Main Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-hk-charcoal/60">
              Total Omset Kotor (GMV)
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-hk-taupe" />
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-normal text-hk-charcoal tabular-nums">
            {formatRupiah(grossRevenue)}
          </p>
          <p className="text-[10px] text-hk-charcoal/60">
            Dari {ordersCount} pesanan terkonfirmasi di Kebumen
          </p>
        </div>

        {/* 90% Vendor Share */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border border-emerald-200 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800">
              Hak Bersih Vendor (90%)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              90% Net
            </span>
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-normal text-emerald-950 tabular-nums">
            {formatRupiah(vendorNetRevenue)}
          </p>
          <p className="text-[10px] text-emerald-700">
            Bebas potongan tersembunyi &amp; bebas biaya transport
          </p>
        </div>

        {/* 10% SuperAdmin / Platform Fee */}
        <div className="p-5 rounded-2xl bg-hk-soft-beige/50 border border-hk-champagne/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-hk-charcoal/60">
              Bagi Hasil HariKita (10%)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white text-hk-charcoal border border-hk-champagne/40 text-[10px] font-bold">
              Superadmin
            </span>
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-normal text-hk-charcoal tabular-nums">
            {formatRupiah(platformFee)}
          </p>
          <p className="text-[10px] text-hk-charcoal/60">
            Biaya server, escrow, kurasi lokal &amp; WA gateway
          </p>
        </div>
      </div>

      {/* Tab Selector Details */}
      <div className="flex items-center gap-2 border-b border-hk-champagne/30 pb-2">
        <button
          onClick={() => setActiveTab("escrow")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "escrow"
              ? "bg-hk-charcoal text-white shadow-2xs"
              : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-soft-beige/50"
          }`}
        >
          Mekanisme Escrow (30% / 70%)
        </button>
        <button
          onClick={() => setActiveTab("sla")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "sla"
              ? "bg-hk-charcoal text-white shadow-2xs"
              : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-soft-beige/50"
          }`}
        >
          Standar SLA &amp; Kontrak
        </button>
        <button
          onClick={() => setActiveTab("invoice")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === "invoice"
              ? "bg-hk-charcoal text-white shadow-2xs"
              : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-soft-beige/50"
          }`}
        >
          E-Invoice &amp; Bukti Potong
        </button>
      </div>

      {/* Tab 1: Escrow Mechanism */}
      {activeTab === "escrow" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-hk-charcoal flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-hk-taupe" />
                <span>Termin 1: Uang Muka DP 30%</span>
              </span>
              <span className="text-xs font-bold text-hk-taupe tabular-nums">
                {formatRupiah(dpEscrow30)}
              </span>
            </div>
            <p className="text-xs text-hk-charcoal/70 leading-relaxed">
              Dicairkan otomatis pada <strong>H-3 sebelum hari H</strong> untuk modal operasional lapangan, pembelian bahan segar, penataan busana, dan briefing kru.
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mengunci ketersediaan tanggal acara</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-hk-charcoal flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Termin 2: Pelunasan 70%</span>
              </span>
              <span className="text-xs font-bold text-hk-charcoal tabular-nums">
                {formatRupiah(settlementEscrow70)}
              </span>
            </div>
            <p className="text-xs text-hk-charcoal/70 leading-relaxed">
              Dicairkan pada <strong>H+2 pasca-acara</strong> langsung ke saldo siap tarik vendor setelah konfirmasi kepuasan dan serah terima hasil jasa ke klien.
            </p>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-hk-taupe">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proteksi ganda dari pembatalan sepihak</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SLA Standards */}
      {activeTab === "sla" && (
        <div className="p-4 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 space-y-3 animate-in fade-in duration-200">
          <h4 className="text-xs font-bold text-hk-charcoal">
            Pedoman Standar Layanan (SLA) Resmi Mitra Vendor Kebumen
          </h4>
          <ul className="text-xs text-hk-charcoal/80 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Waktu Tiba (Call Time):</strong> Seluruh tim vendor wajib hadir di venue acara minimal 60 menit sebelum sesi dimulai.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Garansi Kru Cadangan:</strong> Jika personel utama berhalangan mendadak, vendor wajib mengirimkan tenaga pengganti setara dengan portofolio terverifikasi.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Kebijakan Non-Bocor Kontak:</strong> Koordinasi transaksi &amp; add-on wajib melalui invoicing HariKita untuk perlindungan rekening bersama.</span>
            </li>
          </ul>
        </div>
      )}

      {/* Tab 3: E-Invoice & Tax Slip */}
      {activeTab === "invoice" && (
        <div className="p-4 rounded-2xl bg-hk-ivory/50 border border-hk-champagne/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-hk-charcoal">
                Salinan Dokumen E-Invoice &amp; Potongan Platform Fee
              </h4>
              <p className="text-xs text-hk-charcoal/70 mt-0.5">
                Dokumen pembukuan digital resmi untuk pencatatan keuangan dan perpajakan studio vendor Anda.
              </p>
            </div>
            <button
              onClick={() => alert("Mengunduh salinan rekap invoice resmi...")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hk-charcoal text-white text-xs font-bold hover:bg-black transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Rekap PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
