"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  ShieldCheck,
  Clock,
  ChevronRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useOrders } from "@/lib/order-store";
import { BadgePremium } from "@/components/harikita/ui";

export default function ClientPesananPage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { orders } = useOrders();

  const filteredOrders = orders.filter((o) => {
    if (filter === "active") return o.paymentStatus !== "FULLY_PAID";
    if (filter === "completed") return o.paymentStatus === "FULLY_PAID";
    return true;
  });

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hk-champagne/40 pb-6">
        <div>
          <div className="text-xs font-manrope text-hk-charcoal/70 flex items-center gap-1 mb-1.5">
            <Link href="/client" className="hover:text-hk-charcoal font-medium">
              Portal Klien
            </Link>
            <span>/</span>
            <span className="text-hk-charcoal font-semibold">Daftar Pesanan &amp; Invoice</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-hk-charcoal leading-tight">
            Riwayat Pesanan &amp; Kontrak Acara
          </h1>
          <p className="text-xs sm:text-sm font-manrope text-hk-charcoal/80 mt-1 leading-relaxed">
            Kelola pesanan paket acara Anda, cetak dokumen tagihan escrow resmi, dan pantau radar koordinasi vendor.
          </p>
        </div>

        <Link
          href="/builder"
          className="px-5 py-2.5 rounded-full bg-hk-taupe text-white text-xs font-manrope font-semibold hover:bg-[#78644e] transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-hk-champagne" />
          <span>Racik Paket Baru</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-xs font-manrope transition-all cursor-pointer ${
            filter === "all"
              ? "bg-hk-charcoal text-white font-bold shadow-xs"
              : "bg-white text-hk-charcoal/75 hover:text-hk-charcoal border border-hk-champagne/40 font-medium"
          }`}
        >
          Semua Pesanan ({orders.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-full text-xs font-manrope transition-all cursor-pointer ${
            filter === "active"
              ? "bg-amber-800 text-white font-bold shadow-xs"
              : "bg-white text-hk-charcoal/75 hover:text-hk-charcoal border border-hk-champagne/40 font-medium"
          }`}
        >
          Aktif / Terbayar DP ({orders.filter((o) => o.paymentStatus !== "FULLY_PAID").length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-full text-xs font-manrope transition-all cursor-pointer ${
            filter === "completed"
              ? "bg-emerald-800 text-white font-bold shadow-xs"
              : "bg-white text-hk-charcoal/75 hover:text-hk-charcoal border border-hk-champagne/40 font-medium"
          }`}
        >
          Selesai ({orders.filter((o) => o.paymentStatus === "FULLY_PAID").length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white border border-hk-champagne/40 text-xs font-manrope text-hk-charcoal/70 space-y-3">
            <p>Belum ada riwayat pesanan pada filter ini.</p>
            <Link
              href="/builder"
              className="inline-block px-5 py-2.5 rounded-full bg-hk-taupe text-white text-xs font-manrope font-bold hover:bg-[#78644e] transition-all shadow-xs"
            >
              Mulai Racik Paket
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isDpPaid = order.paymentStatus === "DP_PAID";
            const isCompleted = order.paymentStatus === "FULLY_PAID";

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-6 sm:p-7 space-y-5 font-manrope"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hk-champagne/20">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-hk-soft-beige/60 border border-hk-champagne/50 text-hk-charcoal">
                      {order.bookingId}
                    </span>
                    <span className="text-xs font-semibold text-hk-charcoal/70 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
                      <span>{order.eventDate}</span>
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isCompleted
                      ? "Selesai & Rekber Tuntas"
                      : "DP 30% Terverifikasi (Escrow Aman)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7 space-y-3">
                    <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
                      {order.customerName}
                    </h3>
                    <div className="text-xs text-hk-charcoal/70 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-hk-taupe" />
                      <span>{order.eventLocation}, Kec. {order.district}</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-hk-charcoal/70 uppercase tracking-wider block mb-1.5">
                        Daftar Layanan &amp; Vendor Terpilih ({order.items.length} Mitra):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-hk-soft-beige/40 border border-hk-champagne/30 text-hk-charcoal font-medium"
                          >
                            {item.vendorName} ({item.categoryTitle})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 bg-hk-soft-beige/30 p-4 rounded-2xl border border-hk-champagne/40 space-y-2 text-xs">
                    <div className="flex justify-between text-hk-charcoal/70">
                      <span>Total Nilai Pesanan:</span>
                      <span className="font-manrope tabular-nums font-bold text-hk-charcoal">
                        Rp {order.financials.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>DP 30% Terbayar:</span>
                      <span className="font-manrope tabular-nums">
                        Rp {order.financials.dpAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-hk-charcoal/70 text-[11px]">
                      <span>Sisa Pelunasan 70% (H-7):</span>
                      <span className="font-manrope tabular-nums">
                        Rp {order.financials.pelunasanAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-hk-champagne/20">
                  <div className="text-[11px] text-hk-charcoal/70 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-hk-taupe" />
                    <span>Pencairan DP 30% ke vendor rilis otomatis H-3 acara.</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/hub-koordinasi?bookingId=${order.bookingId}`}
                      className="px-3.5 py-2 rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal text-xs font-semibold hover:bg-hk-soft-beige/40 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-hk-taupe" />
                      <span>Radar Hub Koordinasi</span>
                    </Link>

                    <Link
                      href={`/pesanan/${order.bookingId}/invoice`}
                      className="px-4 py-2 rounded-full bg-hk-taupe text-white text-xs font-bold hover:bg-[#78644e] transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-hk-champagne" />
                      <span>Lihat Invoice &amp; Cetak PDF</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
