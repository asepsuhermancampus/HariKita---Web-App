"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Calculator,
  Percent,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function VendorPaketPage() {
  const [packages, setPackages] = useState([
    {
      id: "pkg-1",
      name: "Paket Sunset Pantai Menganti (Cinematic)",
      price: 3500000,
      callTime: "05:30 WIB",
      desc: "Liputan video sinematik 4K, 1 menit teaser Reels/TikTok, 50 foto teredit tone hangat, all raw files.",
      active: true,
    },
    {
      id: "pkg-2",
      name: "Paket Akad & Resepsi Intimate Pendopo",
      price: 4500000,
      callTime: "06:30 WIB",
      desc: "Liputan hari H lengkap dari makeup subuh sampai selesai jamuan, 2 videographer & 1 pilot drone, flashdisk box kayu eksklusif.",
      active: true,
    },
    {
      id: "pkg-3",
      name: "Paket Casual Studio Indoor",
      price: 1800000,
      callTime: "10:00 WIB",
      desc: "Sesi 2 jam foto studio dengan 2 pilihan backdrop, 20 foto high resolution edit, 1 cetak frame 12R.",
      active: true,
    },
  ]);

  const platformFeeRate = 0.1; // 10%

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
              <span className="text-[#4A2E35] font-medium">Daftar Paket Layanan</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Manajemen Paket & Harga
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Atur daftar paket yang dapat dipilih langsung oleh calon pengantin di katalog dan mix-and-match builder.
            </p>
          </div>

          <button className="px-3.5 py-2 rounded-xl bg-[#4A2E35] text-white text-xs font-semibold hover:bg-[#6B5E62] transition-colors flex items-center gap-1.5 shadow-sm self-start">
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            Tambah Paket Baru
          </button>
        </div>

        {/* Commission Transparency Card */}
        <div className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-base font-bold text-[#4A2E35]">
              Transparansi Potongan & Biaya Platform HariKita
            </h3>
          </div>
          <p className="text-xs text-[#6B5E62] leading-relaxed">
            HariKita mengenakan komisi operasional tetap sebesar <strong>10%</strong> dari nilai pesanan yang berhasil.
            Biaya ini dialokasikan untuk pemeliharaan server database, proteksi rekening bersama (escrow),
            sistem pengingat WhatsApp otomatis, serta promosi vendor ke seluruh calon pengantin di Kabupaten Kebumen.
          </p>
        </div>

        {/* Packages List */}
        <div className="space-y-4">
          {packages.map((pkg) => {
            const platformFee = Math.round(pkg.price * platformFeeRate);
            const netIncome = pkg.price - platformFee;

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-[#C5A880]/30 shadow-sm p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-3 border-b border-[#FAF8F5]">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-[#4A2E35]">
                      {pkg.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#6B5E62] mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Standar Call Time: <strong>{pkg.callTime}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                      Aktif di Katalog
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#6B5E62] leading-relaxed">
                  {pkg.desc}
                </p>

                {/* Calculation Breakdown Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5D7C7] text-xs">
                  <div>
                    <span className="text-[#6B5E62] block text-[11px]">Harga Publik (Klien Bayar):</span>
                    <strong className="font-mono text-sm text-[#4A2E35]">
                      {formatRupiah(pkg.price)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#6B5E62] block text-[11px]">Komisi Platform HariKita (10%):</span>
                    <span className="font-mono text-sm text-red-700">
                      - {formatRupiah(platformFee)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-800 block text-[11px] font-semibold">Estimasi Bersih Vendor (90%):</span>
                    <strong className="font-mono text-base text-emerald-700">
                      {formatRupiah(netIncome)}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button className="px-3 py-1.5 rounded-lg border border-[#E5D7C7] text-[#4A2E35] text-xs font-semibold hover:bg-[#FAF8F5] flex items-center gap-1">
                    <Edit2 className="w-3 h-3 text-[#C5A880]" /> Edit Rincian
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
