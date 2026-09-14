"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Crown,
  Briefcase,
  SlidersHorizontal,
  FileText,
  Clock,
  ArrowRight,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import {
  EventConstellationHub,
  ConstellationRole,
} from "@/components/coordination/EventConstellationHub";
import { sanitizeContent, GuardResult } from "@/lib/content-guard";
import { InvoiceModal, InvoiceData } from "@/components/invoicing/InvoiceModal";
import { useOrders } from "@/lib/order-store";

function HubKoordinasiContent() {
  const searchParams = useSearchParams();
  const urlBookingId = searchParams.get("bookingId");
  const { orders } = useOrders();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    urlBookingId || (orders.length > 0 ? orders[0].bookingId : "HKB-2026-001")
  );
  const [activeRole, setActiveRole] = useState<ConstellationRole>("pengantin");
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Content Guard Interactive Simulator State
  const [inputBio, setInputBio] = useState(
    "Spesialis MUA pengantin Kebumen. Untuk booking hubungi wa: 0812-3456-7890 atau DM instagram @alula_mua."
  );
  const [guardResult, setGuardResult] = useState<GuardResult>(
    sanitizeContent(
      "Spesialis MUA pengantin Kebumen. Untuk booking hubungi wa: 0812-3456-7890 atau DM instagram @alula_mua."
    )
  );

  const handleTestContent = (text: string) => {
    setInputBio(text);
    setGuardResult(sanitizeContent(text));
  };

  // Mock Invoice Data for Demo Modal
  const mockInvoiceData: InvoiceData = {
    invoiceNumber: selectedBookingId,
    issueDate: "14 September 2026",
    customerName: "Siti Rahmawati & Dimas Pratama",
    customerWhatsApp: "0812-3456-7890",
    eventDate: "Sabtu, 24 Oktober 2026",
    eventLocation: "Gedung Bale Marmer, Kebumen Kota",
    items: [
      {
        id: "1",
        categoryId: "mua",
        categoryTitle: "Makeup Artist (MUA)",
        vendorId: "v_mua_01",
        vendorName: "Alula MUA & Hijab",
        district: "Kebumen Kota",
        packageId: "pkg_mua_akad",
        packageName: "Paket Rias Pengantin Soft Glam",
        unitPrice: 2200000,
        quantity: 1,
        callTime: "05.00 WIB",
      },
      {
        id: "2",
        categoryId: "busana",
        categoryTitle: "Busana Pengantin & Fitting",
        vendorId: "v_busana_01",
        vendorName: "Griya Busana Rarasati",
        district: "Kebumen Kota",
        packageId: "pkg_busana_akad",
        packageName: "Sewa Perdana Kebaya Modern & Beskap",
        unitPrice: 2800000,
        quantity: 1,
        callTime: "06.00 WIB",
      },
      {
        id: "3",
        categoryId: "foto",
        categoryTitle: "Dokumentasi Foto & Video",
        vendorId: "v_foto_01",
        vendorName: "Menganti Cinematic & Story",
        district: "Ayah",
        packageId: "pkg_foto_wedding",
        packageName: "Liputan Penuh Akad & Resepsi 4K",
        unitPrice: 4200000,
        quantity: 1,
        callTime: "07.30 WIB",
      },
    ],
    totalAmount: 9200000,
    dpAmount: 2760000,
    finalAmount: 6440000,
    paymentType: "dp_30",
    status: "LUNAS DP 30%",
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-hk-charcoal py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hk-champagne/15 border border-hk-champagne/40 text-hk-charcoal text-xs font-manrope font-bold uppercase tracking-widest shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-hk-taupe" />
          <span>Sesi Kolaborasi Vendor Hyperlocal Kebumen</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl text-hk-charcoal font-bold leading-tight">
          Hub Koordinasi Acara Hari H
        </h1>

        <p className="font-manrope text-xs sm:text-sm text-hk-charcoal/70 max-w-2xl mx-auto leading-relaxed">
          Ruang kendali visual berbasis model <strong>9Router</strong> yang menyatukan calon pengantin, seluruh mitra vendor terpilih di Kebumen, dan admin HariKita ke dalam satu peta kesiapan waktu (*call sheets*) secara tersinkronisasi.
        </p>

        {/* Event Selector Dropdown */}
        {orders.length > 0 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-xs font-manrope text-hk-taupe font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Pilih Acara di Radar:</span>
            </span>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="rounded-full bg-white border border-hk-champagne/60 px-4 py-1.5 text-xs font-manrope text-hk-charcoal focus:outline-hidden focus:ring-2 focus:ring-hk-taupe shadow-xs"
            >
              {orders.map((o) => (
                <option key={o.bookingId} value={o.bookingId} className="bg-white text-hk-charcoal">
                  {o.bookingId} — {o.customerName} ({o.eventDate})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href={`/pesanan/${selectedBookingId}/invoice`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-hk-charcoal text-white text-xs font-manrope font-bold hover:bg-hk-taupe transition-all shadow-md"
          >
            <FileText className="w-4 h-4" />
            <span>Lihat Invoice &amp; Kwitansi Escrow</span>
          </Link>

          <Link
            href="/builder"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-hk-champagne/60 bg-white text-hk-charcoal text-xs font-manrope font-semibold hover:bg-hk-champagne/15 transition-all shadow-xs"
          >
            <span>Buka Simulator Racik Paket</span>
            <ArrowRight className="w-3.5 h-3.5 text-hk-taupe" />
          </Link>
        </div>
      </div>

      {/* SECTION 1: THE EVENT CONSTELLATION GRAPH (9ROUTER STYLE) */}
      <div className="max-w-7xl mx-auto">
        <EventConstellationHub bookingId={selectedBookingId} initialRole={activeRole} />
      </div>

      {/* SECTION 2: EXPLANATION OF 3 ROLE PERSPECTIVES */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-hk-champagne/40 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-hk-champagne/15 border border-hk-champagne/30 flex items-center justify-center text-hk-charcoal">
            <Crown className="w-6 h-6 text-hk-taupe" />
          </div>
          <h4 className="font-editorial text-2xl font-bold text-hk-charcoal">
            1. Perspektif Pengantin (Pelanggan)
          </h4>
          <p className="font-manrope text-xs sm:text-sm text-hk-charcoal/75 leading-relaxed">
            Semua vendor dan pusat acara menyala aktif serentak dengan aliran pulsa cahaya emas. Memberikan rasa tenang (*peace of mind*) dan kepastian bahwa seluruh tim vendor kompak bersiap untuk hari bahagia Anda.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-hk-champagne/40 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-hk-champagne/15 border border-hk-champagne/30 flex items-center justify-center text-hk-charcoal">
            <Briefcase className="w-6 h-6 text-hk-taupe" />
          </div>
          <h4 className="font-editorial text-2xl font-bold text-hk-charcoal">
            2. Perspektif Mitra Vendor (MUA, Foto, dll)
          </h4>
          <p className="font-manrope text-xs sm:text-sm text-hk-charcoal/75 leading-relaxed">
            Fokus utama menyorot akun vendor tersebut dengan garis koneksi emas tebal ke acara klien disertai jam tugasnya. Vendor lain tampil redup, menumbuhkan komitmen tanggung jawab agar tampil optimal tanpa terlambat.
          </p>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-hk-champagne/40 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-hk-champagne/15 border border-hk-champagne/30 flex items-center justify-center text-hk-charcoal">
            <SlidersHorizontal className="w-6 h-6 text-hk-taupe" />
          </div>
          <h4 className="font-editorial text-2xl font-bold text-hk-charcoal">
            3. Perspektif Super Admin (HariKita)
          </h4>
          <p className="font-manrope text-xs sm:text-sm text-hk-charcoal/75 leading-relaxed">
            Radar komprehensif seluruh acara pernikahan se-Kabupaten Kebumen. Memantau status kesiapan vendor (Standby, OTW, Active, Delay) untuk memastikan kepuasan keluarga dan kelancaran acara.
          </p>
        </div>
      </div>

      {/* SECTION 3: ANTI-DISINTERMEDIATION CONTENT GUARD INTERACTIVE DEMO */}
      <div className="max-w-7xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-hk-champagne/40 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hk-champagne/20 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-manrope font-bold text-amber-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Sistem Proteksi Anti-Kebocoran Transaksi (Anti-Disintermediation)</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-hk-charcoal">
              Simulasi Sensor Otomatis Nomor HP &amp; Medsos Vendor
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-hk-charcoal/70">
              Mencegah vendor nakal mengalihkan transaksi ke luar platform HariKita dengan menyensor kontak pribadi secara otomatis.
            </p>
          </div>

          <span className={`px-3.5 py-1.5 rounded-full text-xs font-manrope font-bold self-start md:self-auto border ${
            guardResult.flagged
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-emerald-50 text-emerald-800 border-emerald-300"
          }`}>
            {guardResult.flagged ? "⚠️ Pelanggaran Kontak Terdeteksi" : "✓ Konten Aman"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-manrope font-semibold text-hk-charcoal block">
              Coba Ketik Bio / Deskripsi Paket (Uji Coba Teks Bebas):
            </label>
            <textarea
              rows={4}
              value={inputBio}
              onChange={(e) => handleTestContent(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#FAF8F5] border border-hk-champagne/40 text-xs sm:text-sm font-manrope text-hk-charcoal focus:outline-hidden focus:ring-2 focus:ring-hk-taupe leading-relaxed shadow-inner"
              placeholder="Ketik teks di sini..."
            />
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-hk-taupe">Coba Template Cepat:</span>
              <button
                type="button"
                onClick={() =>
                  handleTestContent(
                    "Hubungi kami di nol delapan satu dua tiga empat lima enam untuk nego harga offline."
                  )
                }
                className="text-[11px] text-hk-taupe underline hover:text-hk-charcoal font-medium"
              >
                [Uji Ejaan Kata]
              </button>
              <button
                type="button"
                onClick={() =>
                  handleTestContent(
                    "Paket MUA wedding terpercaya Kebumen Kota dengan produk internasional tahan 12 jam."
                  )
                }
                className="text-[11px] text-emerald-700 underline hover:text-emerald-900 font-medium"
              >
                [Teks Bersih]
              </button>
            </div>
          </div>

          {/* Output Censored Box */}
          <div className="space-y-2">
            <label className="text-xs font-manrope font-semibold text-hk-charcoal block">
              Hasil Sensor Sistem HariKita (Tampilan Publik yang Aman):
            </label>
            <div className="p-4 rounded-2xl bg-white border border-emerald-400/50 text-xs sm:text-sm font-manrope text-hk-charcoal min-h-[110px] leading-relaxed shadow-inner">
              {guardResult.cleanText}
            </div>

            {guardResult.flagged && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-manrope text-amber-900">
                <strong>Kata Kunci yang Disensor:</strong> {guardResult.matches.join(", ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        invoice={mockInvoiceData}
      />
    </div>
  );
}

export default function HubKoordinasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] text-hk-charcoal p-12 text-center text-xs font-manrope">Memuat Hub Koordinasi 9Router HariKita...</div>}>
      <HubKoordinasiContent />
    </Suspense>
  );
}
