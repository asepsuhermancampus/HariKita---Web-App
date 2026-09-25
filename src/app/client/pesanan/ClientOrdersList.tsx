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
import type { OrderViewModel } from "@/server/queries/orders";

/**
 * Daftar pesanan klien (client component).
 *
 * `dbOrders` berasal dari database dan selalu owner-scoped di server.
 */
export function ClientOrdersList({
  dbOrders,
  distances = {},
}: {
  dbOrders: OrderViewModel[];
  distances?: Record<string, Array<{ vendorName: string; km: number; minutes: number | null; source: string }>>;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const orders = dbOrders;

  const filteredOrders = orders.filter((o) => {
    const isTerminal = ["COMPLETED", "REFUNDED", "CANCELLED", "EXPIRED"].includes(o.status);
    if (filter === "active") return !isTerminal;
    if (filter === "completed") return isTerminal;
    return true;
  });

  return (
    <>
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
          Aktif ({orders.filter((o) => !["COMPLETED", "REFUNDED", "CANCELLED", "EXPIRED"].includes(o.status)).length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-full text-xs font-manrope transition-all cursor-pointer ${
            filter === "completed"
              ? "bg-emerald-800 text-white font-bold shadow-xs"
              : "bg-white text-hk-charcoal/75 hover:text-hk-charcoal border border-hk-champagne/40 font-medium"
          }`}
        >
          Selesai ({orders.filter((o) => ["COMPLETED", "REFUNDED", "CANCELLED", "EXPIRED"].includes(o.status)).length})
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
            const isCompleted = order.paymentStatus === "FULLY_PAID";
            const isDpPaid = order.paymentStatus === "DP_PAID";
            const isRefunded = ["REFUND_PENDING", "REFUNDED"].includes(order.status);
            const isCancelled = ["CANCELLED", "EXPIRED"].includes(order.status);

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
                    {isRefunded
                      ? order.status === "REFUNDED" ? "Dana Telah Dikembalikan" : "Pengembalian Dana Diproses"
                      : isCancelled
                        ? "Pesanan Dibatalkan"
                        : order.status === "COMPLETED"
                          ? "Acara Selesai"
                        : isCompleted
                      ? "Lunas, Dana dalam Rekber"
                      : isDpPaid
                        ? "DP Terverifikasi (Escrow Aman)"
                        : "Menunggu Pembayaran DP"}
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

                    {distances[order.id] && distances[order.id].length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {distances[order.id].map((d, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-hk-champagne/40 bg-white px-2.5 py-1 text-[11px] text-hk-charcoal"
                          >
                            <MapPin className="h-3 w-3 text-hk-taupe" aria-hidden="true" />
                            {d.vendorName}: ± {d.km} km
                            {d.minutes != null ? ` · ± ${d.minutes} mnt` : " (perkiraan)"}
                          </span>
                        ))}
                      </div>
                    )}

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
                    <div className={`flex justify-between font-bold ${isDpPaid || isCompleted ? "text-emerald-800" : "text-amber-800"}`}>
                      <span>{isRefunded ? "Pembayaran Tercatat:" : isCompleted ? "Total Terbayar:" : isDpPaid ? "DP Terbayar:" : isCancelled ? "Tagihan:" : "Tagihan DP:"}</span>
                      <span className="font-manrope tabular-nums">
                        Rp {(isRefunded || isCompleted ? order.financials.paidAmount : isDpPaid ? order.financials.paidDpAmount : order.financials.dpAmount).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-hk-charcoal/70 text-[11px]">
                      <span>{isRefunded ? "Status Dana:" : isCompleted ? "Sisa Tagihan:" : isCancelled ? "Status Pesanan:" : "Sisa Pelunasan (H-7):"}</span>
                      <span className="font-manrope tabular-nums">
                        {isRefunded
                          ? order.status === "REFUNDED" ? "Dikembalikan" : "Diproses"
                          : isCancelled
                            ? "Dibatalkan"
                            : `Rp ${(isCompleted ? Math.max(0, order.financials.totalAmount - order.financials.paidAmount) : order.financials.pelunasanAmount).toLocaleString("id-ID")}`}
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
    </>
  );
}
