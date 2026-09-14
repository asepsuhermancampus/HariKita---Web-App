"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useNotifications, VendorNotificationRecord } from "@/lib/notification-store";

export default function VendorInboxPage() {
  const [filter, setFilter] = useState<"all" | "new" | "confirmed">("all");
  const { notifications, confirmOrder, triggerWhatsAppReminder } = useNotifications("all");

  const filteredOrders = notifications.filter((o) => {
    if (filter === "new") return o.status === "NEW";
    if (filter === "confirmed") return o.status === "CONFIRMED";
    return true;
  });

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs font-manrope text-hk-charcoal/70 flex items-center gap-1 mb-1">
              <Link href="/vendor" className="hover:text-hk-charcoal">
                Portal Mitra Vendor
              </Link>
              <span>/</span>
              <span className="text-hk-charcoal font-semibold">Kotak Masuk Pesanan</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-hk-charcoal">
              Kotak Masuk Order &amp; Notifikasi
            </h1>
            <p className="text-xs font-manrope text-hk-charcoal/70 mt-0.5">
              Pesanan nyata yang masuk seketika setelah calon pengantin melunasi DP 30% ke Rekening Bersama HariKita.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/vendor/kalender"
              className="px-4 py-2 rounded-full bg-white border border-hk-champagne/60 text-hk-charcoal text-xs font-manrope font-bold hover:bg-hk-ivory transition-colors shadow-2xs"
            >
              Cek Kalender Sibuk
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 border-b border-hk-champagne/40 pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              filter === "all"
                ? "bg-hk-charcoal text-white shadow-xs"
                : "bg-white text-hk-charcoal/70 hover:text-hk-charcoal border border-hk-champagne/40"
            }`}
          >
            Semua Pesanan ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("new")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              filter === "new"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white text-hk-charcoal/70 hover:text-hk-charcoal border border-hk-champagne/40"
            }`}
          >
            Pesanan Baru ({notifications.filter((n) => n.status === "NEW").length})
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold transition-all ${
              filter === "confirmed"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white text-hk-charcoal/70 hover:text-hk-charcoal border border-hk-champagne/40"
            }`}
          >
            Terkonfirmasi ({notifications.filter((n) => n.status === "CONFIRMED").length})
          </button>
        </div>

        {/* Double-Notification Notice */}
        <div className="p-4 rounded-2xl bg-white border border-hk-champagne/50 shadow-2xs flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs font-manrope text-hk-charcoal/70 leading-relaxed">
            <strong className="text-hk-charcoal block font-semibold">Sistem Notifikasi Ganda HariKita (Double Notification):</strong>
            Setiap ada pesanan baru, rincian otomatis masuk ke kotak masuk ini dan diteruskan via 
            <strong className="text-hk-charcoal"> Notifier WhatsApp HariKita</strong>. Jika Anda belum mengonfirmasi dalam waktu 24 jam, pengingat otomatis akan dikirimkan kembali agar jadwal klien tetap aman.
          </div>
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-hk-champagne/40 text-xs font-manrope text-hk-charcoal/60">
              Tidak ada pesanan pada filter ini.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isConf = order.status === "CONFIRMED";
              const waLink = triggerWhatsAppReminder(order);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-hk-champagne/60 shadow-md p-5 sm:p-6 space-y-4 font-manrope"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hk-champagne/20">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-hk-charcoal px-2.5 py-1 rounded-full bg-hk-ivory border border-hk-champagne/50">
                        {order.bookingId}
                      </span>
                      <span className="text-xs text-hk-charcoal/70 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
                        <span>{order.eventDate}</span>
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isConf
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isConf ? "Jadwal Terkunci & Diterima" : "Menunggu Konfirmasi Jadwal"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-hk-taupe uppercase tracking-wider block">
                        Mitra: {order.vendorName}
                      </span>
                      <h3 className="font-editorial text-xl font-bold text-hk-charcoal mt-0.5">
                        {order.clientName}
                      </h3>
                      <p className="text-xs font-semibold text-hk-charcoal/80 mt-0.5">
                        {order.packageName}
                      </p>
                      <div className="text-xs text-hk-charcoal/70 flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-hk-taupe" />
                          <span>Call Time: <strong>{order.callTime}</strong></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-hk-taupe" />
                          <span>{order.venue}</span>
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-xs text-hk-charcoal/60">Nilai Jasa Mitra:</div>
                      <div className="font-mono text-xl font-bold text-hk-charcoal">
                        Rp {order.price.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        DP 30% Terkunci di Escrow: Rp {order.dpAmount.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="p-3 rounded-2xl bg-hk-ivory/60 border border-hk-champagne/40 text-xs text-hk-charcoal/80">
                      <strong className="text-hk-charcoal block mb-0.5 font-semibold">Catatan Khusus Klien:</strong>
                      {order.notes}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-hk-charcoal/60 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pencairan DP 30% otomatis rilis ke dompet pada H-3 acara.</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-full border border-emerald-500/40 bg-emerald-50 text-emerald-800 text-xs font-manrope font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim WA Pengingat</span>
                      </a>

                      <Link
                        href={`/hub-koordinasi?bookingId=${order.bookingId}`}
                        className="px-3.5 py-2 rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal text-xs font-manrope font-semibold hover:bg-hk-ivory transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-hk-taupe" />
                        <span>Cek Radar 9Router</span>
                      </Link>

                      {!isConf ? (
                        <button
                          type="button"
                          onClick={() => confirmOrder(order.id)}
                          className="px-4 py-2 rounded-full bg-hk-charcoal text-white text-xs font-manrope font-bold hover:bg-hk-taupe transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-hk-champagne" />
                          <span>Konfirmasi &amp; Kunci Jadwal</span>
                        </button>
                      ) : (
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-manrope font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Terkonfirmasi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
