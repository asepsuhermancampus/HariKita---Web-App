"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  QrCode,
  Sparkles,
  MapPin,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useOrders, OrderRecord } from "@/lib/order-store";
import { DecorativeDivider, WaxSealBadge, VintageStampBadge } from "@/components/harikita/ui";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default function PesananInvoicePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId || "HKB-2026-001";
  const { getOrderById } = useOrders();

  const [order, setOrder] = useState<OrderRecord | undefined>(undefined);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const found = getOrderById(bookingId);
    setOrder(found);
  }, [bookingId, getOrderById]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Fallback defaults jika order sedang dimuat
  const displayBookingId = order ? order.bookingId : bookingId;
  const customerName = order ? order.customerName : "Siti Rahmawati & Dimas Pratama";
  const customerWhatsApp = order ? order.customerWhatsApp : "081234567890";
  const eventDate = order ? order.eventDate : "24 Oktober 2026";
  const eventLocation = order ? order.eventLocation : "Gedung Bale Marmer Kebumen";
  const district = order ? order.district : "Kebumen Kota";
  const paymentStatus = order ? order.paymentStatus : "DP_PAID";
  
  const financials = order?.financials || {
    subtotal: 15850000,
    platformFee: 1585000,
    escrowFee: 0,
    totalAmount: 17435000,
    dpAmount: 5230500,
    pelunasanAmount: 12204500,
  };

  const items = order?.items || [
    {
      id: "item_def_1",
      categoryId: "prewed",
      categoryTitle: "Pre-wedding Alam & Studio",
      vendorName: "Menganti Cinematic & Studio",
      packageName: "Paket Pantai Menganti Sunset",
      unitPrice: 3500000,
      quantity: 1,
      callTime: "14:00 WIB",
      district: "Ayah",
    },
    {
      id: "item_def_2",
      categoryId: "busana",
      categoryTitle: "Busana Pengantin & Fitting",
      vendorName: "Griya Busana Rarasati",
      packageName: "Sewa Perdana Kebaya Brokat & Beskap",
      unitPrice: 4200000,
      quantity: 1,
      callTime: "06:00 WIB",
      district: "Kebumen Kota",
    },
    {
      id: "item_def_3",
      categoryId: "mua",
      categoryTitle: "Makeup Artist (MUA)",
      vendorName: "Alula MUA & Hijab",
      packageName: "Rias Pengantin Soft Glam Akad",
      unitPrice: 2800000,
      quantity: 1,
      callTime: "04:30 WIB",
      district: "Kebumen Kota",
    },
    {
      id: "item_def_4",
      categoryId: "katering",
      categoryTitle: "Katering Prasmanan & Stall",
      vendorName: "Dapur Rasa Boga Kebumen",
      packageName: "Prasmanan Selaras 200 Pax",
      unitPrice: 5350000,
      quantity: 1,
      callTime: "09:00 WIB",
      district: "Kutowinangun",
    },
  ];

  const waShareMessage = encodeURIComponent(
    `*BUKTI PEMBAYARAN REKENING BERSAMA HARIKITA*\n\n` +
    `• Kode Booking: ${displayBookingId}\n` +
    `• Calon Pengantin: ${customerName}\n` +
    `• Tanggal Acara: ${eventDate}\n` +
    `• Lokasi: ${eventLocation} (${district})\n` +
    `• Status: DP 30% Terbayar & Terkunci di Rekber (Rp ${financials.dpAmount.toLocaleString("id-ID")})\n` +
    `• Sisa Pelunasan: Rp ${financials.pelunasanAmount.toLocaleString("id-ID")} (Jatuh tempo H-7)\n\n` +
    `Lihat Invoice & Radar Koordinasi Vendor: ${typeof window !== "undefined" ? window.location.href : "https://harikita.id"}`
  );

  return (
    <div className="min-h-screen bg-hk-ivory text-hk-charcoal py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0 print:m-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Action Bar (Hidden during Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/client/pesanan"
            className="inline-flex items-center gap-1.5 text-xs font-manrope font-semibold text-hk-charcoal/70 hover:text-hk-charcoal transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Ke Riwayat Pesanan
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/hub-koordinasi?bookingId=${displayBookingId}`}
              className="px-3.5 py-1.5 rounded-full bg-hk-charcoal text-white text-xs font-manrope font-bold hover:bg-hk-taupe transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-hk-champagne" />
              <span>Buka Radar 9Router</span>
            </Link>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-full bg-white border border-hk-champagne/60 text-xs font-manrope font-semibold text-hk-charcoal hover:bg-hk-ivory transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <a
              href={`https://wa.me/?text=${waShareMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-manrope font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Invoice Container Card */}
        <div className="bg-white rounded-3xl border border-hk-champagne/60 shadow-xl overflow-hidden print:border-none print:shadow-none">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-hk-charcoal via-[#3A2228] to-hk-charcoal text-white p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    HariKita
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-hk-champagne px-2 py-0.5 rounded-full bg-white/10 font-manrope font-bold">
                    Official Escrow Invoice
                  </span>
                </div>
                <p className="text-xs text-white/70 font-manrope mt-1">
                  Platform Pernikahan &amp; Event Intim Hyperlocal Kabupaten Kebumen
                </p>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-hk-champagne block">
                  Nomor Tagihan Resmi
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-white block">
                  {displayBookingId}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3" />
                  DP 30% Terverifikasi Rekening Bersama
                </span>
              </div>
            </div>
          </div>

          {/* Body Information */}
          <div className="p-6 sm:p-8 space-y-6 font-manrope">
            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-hk-champagne/30 text-xs">
              <div>
                <span className="text-hk-charcoal/60 block text-[11px] font-semibold">Calon Pengantin:</span>
                <strong className="text-hk-charcoal text-sm block font-editorial">{customerName}</strong>
                <span className="text-hk-charcoal/70">WA: {customerWhatsApp}</span>
              </div>

              <div>
                <span className="text-hk-charcoal/60 block text-[11px] font-semibold">Tanggal &amp; Waktu Acara:</span>
                <div className="flex items-center gap-1.5 font-semibold text-hk-charcoal mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-hk-taupe" />
                  <span>{eventDate}</span>
                </div>
                <span className="text-emerald-700 font-semibold text-[11px]">Jadwal Vendor Terkunci</span>
              </div>

              <div>
                <span className="text-hk-charcoal/60 block text-[11px] font-semibold">Lokasi Acara di Kebumen:</span>
                <div className="flex items-start gap-1 text-hk-charcoal mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" />
                  <span>{eventLocation}, Kec. {district}</span>
                </div>
              </div>
            </div>

            {/* Itemized Services Table */}
            <div>
              <h3 className="font-editorial text-lg font-bold text-hk-charcoal mb-3">
                Rincian Layanan &amp; Vendor Terpilih Kebumen
              </h3>
              <div className="border border-hk-champagne/40 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-hk-ivory/80 border-b border-hk-champagne/40 text-hk-charcoal/70 font-semibold">
                      <th className="p-3">Kategori &amp; Nama Paket</th>
                      <th className="p-3">Mitra Vendor Lokal</th>
                      <th className="p-3">Call Time</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hk-champagne/20">
                    {items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-hk-ivory/30 transition-colors">
                        <td className="p-3">
                          <strong className="text-hk-charcoal block">{item.categoryTitle}</strong>
                          <span className="text-[11px] text-hk-charcoal/70">{item.packageName}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-hk-taupe">{item.vendorName}</span>
                          <span className="block text-[10px] text-hk-charcoal/50">Kec. {item.district}</span>
                        </td>
                        <td className="p-3 text-hk-charcoal/80 font-mono text-[11px]">
                          {item.callTime || "08:00 WIB"}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-hk-charcoal">
                          Rp {(item.unitPrice * (item.quantity || 1)).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="bg-hk-ivory/40 rounded-2xl p-5 border border-hk-champagne/40 space-y-2.5 text-xs">
              <div className="flex justify-between text-hk-charcoal/70">
                <span>Subtotal Jasa Mitra Vendor:</span>
                <span className="font-mono font-bold text-hk-charcoal">
                  Rp {financials.subtotal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between text-hk-charcoal/70">
                <span>Biaya Platform, Server &amp; Kurasi Lokal (10%):</span>
                <span className="font-mono font-bold text-hk-charcoal">
                  Rp {financials.platformFee.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between text-emerald-800">
                <span>Proteksi Rekening Bersama (Escrow Guarantee):</span>
                <span className="font-mono font-bold">Gratis (Termasuk)</span>
              </div>

              <div className="pt-2 border-t border-hk-champagne/40 flex justify-between text-sm font-bold text-hk-charcoal">
                <span>Total Nilai Pesanan:</span>
                <span className="font-mono text-base">
                  Rp {financials.totalAmount.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>DP 30% Terbayar via Rekber:</span>
                </span>
                <span className="font-mono text-base text-emerald-800">
                  Rp {financials.dpAmount.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between text-hk-charcoal/60 text-[11px] pt-1">
                <span>Sisa Termin Pelunasan 70% (H-7 Acara):</span>
                <span className="font-mono font-bold text-hk-charcoal/80">
                  Rp {financials.pelunasanAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Escrow Mechanism Explanation */}
            <div className="p-4 rounded-2xl bg-white border border-hk-champagne/50 shadow-2xs space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-hk-charcoal">
                <ShieldCheck className="w-4 h-4 text-hk-taupe" />
                <span>Aturan Pencairan Rekening Bersama HariKita:</span>
              </div>
              <ul className="list-disc list-inside text-hk-charcoal/70 space-y-1 text-[11px] leading-relaxed">
                <li>
                  <strong>Pencairan Operasional (DP 30%):</strong> Cair ke saldo dompet vendor pada <strong>H-3 acara</strong> untuk pembelian bahan dan mobilisasi kru.
                </li>
                <li>
                  <strong>Pencairan Pelunasan (70%):</strong> Cair pada <strong>H+2 setelah acara</strong> selesai dan klien mengonfirmasi tidak ada wanprestasi.
                </li>
              </ul>
            </div>

            {/* Footer QR & Signature */}
            <div className="pt-4 border-t border-hk-champagne/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white border border-hk-champagne/60 shadow-2xs">
                  <QrCode className="w-12 h-12 text-hk-charcoal" />
                </div>
                <div className="text-[11px] text-hk-charcoal/60 leading-tight">
                  <span className="font-bold text-hk-charcoal block">Verifikasi Keaslian Invoice</span>
                  Pindai QR untuk validasi transaksi di sistem escrow HariKita Kebumen.
                </div>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[10px] uppercase font-mono tracking-widest text-hk-taupe block">
                  HariKita Trust &amp; Escrow
                </span>
                <p className="font-editorial text-lg text-hk-charcoal font-bold">
                  PT HariKita Media Digital
                </p>
                <span className="text-[10px] text-hk-charcoal/50">Kebumen, Jawa Tengah</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Link to 9Router Hub */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-hk-ivory via-white to-hk-ivory border border-hk-champagne/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-hk-taupe shrink-0" />
            <div>
              <strong className="text-hk-charcoal block">Koordinasikan Seluruh Vendor di 9Router Hub:</strong>
              <span className="text-hk-charcoal/70 text-[11px]">
                Pantau jam hadir (*call time*), simulasi tugas, dan status kesiapan vendor Anda secara visual.
              </span>
            </div>
          </div>
          <Link
            href={`/hub-koordinasi?bookingId=${displayBookingId}`}
            className="shrink-0 px-4 py-2 rounded-full bg-hk-taupe text-white font-manrope font-bold hover:bg-hk-charcoal transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Buka Radar 9Router</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
