"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Lock,
  QrCode,
  Trash2,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { KEBUMEN_DISTRICTS } from "@/data/multi-vendor-catalog";
import { createOrderWithAutoHoldAction } from "@/server/actions/order";
import { DatePicker } from "@/components/harikita/ui";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    dpAmount,
    eventDate,
    eventLocation,
    customerName,
    customerWhatsApp,
    paymentType,
    notes,
    setEventDate,
    setEventLocation,
    setCustomerInfo,
    setPaymentType,
    removeItem,
    clearCart,
  } = useCart();

  const [name, setName] = useState(customerName || "");
  const [whatsapp, setWhatsapp] = useState(customerWhatsApp || "");
  const [selectedDate, setSelectedDate] = useState(eventDate || "2026-10-24");
  const [district, setDistrict] = useState(eventLocation || "Kebumen Kota");
  const [payOption, setPayOption] = useState<"dp_30" | "full_100">(paymentType || "dp_30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      alert("Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda.");
      return;
    }
    if (items.length === 0) {
      alert("Keranjang racikan masih kosong.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setCustomerInfo(name, whatsapp);
    setEventDate(selectedDate);
    setEventLocation(district);
    setPaymentType(payOption);

    // Persist order ke database via Server Action (harga dihitung server).
    const result = await createOrderWithAutoHoldAction({
      eventDate: selectedDate,
      clientName: name,
      clientPhone: whatsapp,
      city: "Kebumen",
      notes: notes,
      items: items.map((it) => ({
        catalogVendorId: it.vendorId,
        catalogPackageId: it.packageId,
        quantity: it.quantity,
      })),
    });

    if (!result.success) {
      setSubmitError(result.message || "Gagal membuat pesanan. Silakan coba lagi.");
      setIsSubmitting(false);
      return;
    }

    clearCart();
    // Redirect ke halaman pembayaran dengan orderId asli dari database.
    router.push(`/pembayaran/${result.data.orderId}`);
  };

  const amountToPay = payOption === "dp_30" ? dpAmount : subtotal;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-manrope font-bold uppercase tracking-widest border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Checkout &amp; Booking Terproteksi Escrow</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl text-hk-charcoal font-normal">
          Konfirmasi Pesanan &amp; Kunci Tanggal
        </h1>
        <p className="font-manrope text-xs sm:text-sm text-hk-charcoal/70">
          Tanpa registrasi rumit. Cukup masukkan nama &amp; WhatsApp untuk mengunci jadwal vendor terpilih di Kabupaten Kebumen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Lazy Registration & Event Specs */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-hk-champagne/60 shadow-md space-y-6">
          <h3 className="font-editorial text-2xl font-bold text-hk-charcoal border-b border-hk-champagne/30 pb-3">
            1. Data Pemesan &amp; Detail Acara
          </h3>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-manrope font-semibold text-hk-charcoal block">
                Nama Lengkap Calon Pengantin / Keluarga: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Siti Rahmawati"
                className="w-full p-3 rounded-2xl border border-hk-champagne/60 text-xs font-manrope focus:outline-hidden focus:ring-2 focus:ring-hk-taupe"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-manrope font-semibold text-hk-charcoal block">
                Nomor WhatsApp Aktif: *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full p-3 rounded-2xl border border-hk-champagne/60 text-xs font-manrope focus:outline-hidden focus:ring-2 focus:ring-hk-taupe"
              />
              <span className="text-[10px] text-hk-charcoal/60 block">
                Invoice resmi &amp; pengingat jadwal fitting/test food otomatis dikirim ke nomor ini.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <DatePicker
                  label="Tanggal Acara Hari H:"
                  required
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  placeholder="Pilih tanggal acara..."
                  minDate={new Date()}
                  displayFormat="EEEE, dd MMMM yyyy"
                  triggerClassName="rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-manrope font-semibold text-hk-charcoal block">
                  Lokasi Acara di Kebumen: *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-hk-champagne/60 text-xs font-manrope focus:outline-hidden focus:ring-2 focus:ring-hk-taupe"
                >
                  {KEBUMEN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      Kecamatan {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Method Choice */}
            <div className="pt-4 space-y-2">
              <label className="text-xs font-manrope font-bold text-hk-charcoal block">
                2. Pilih Skema Pembayaran:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPayOption("dp_30")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    payOption === "dp_30"
                      ? "border-hk-taupe bg-hk-ivory/80 ring-2 ring-hk-champagne/40"
                      : "border-hk-champagne/50 bg-white hover:bg-hk-ivory/40"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-editorial text-lg font-bold text-hk-charcoal block">
                      DP 30% Kunci Tanggal
                    </span>
                    <p className="text-[11px] font-manrope text-hk-charcoal/70">
                      Cukup bayar 30% sekarang untuk mengunci jadwal vendor. Pelunasan 70% di H-7 acara.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-800 mt-2 block">
                    Rp {dpAmount.toLocaleString("id-ID")}
                  </span>
                </label>

                <label
                  onClick={() => setPayOption("full_100")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    payOption === "full_100"
                      ? "border-hk-taupe bg-hk-ivory/80 ring-2 ring-hk-champagne/40"
                      : "border-hk-champagne/50 bg-white hover:bg-hk-ivory/40"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-editorial text-lg font-bold text-hk-charcoal block">
                      Bayar Lunas 100%
                    </span>
                    <p className="text-[11px] font-manrope text-hk-charcoal/70">
                      Dana tetap diamankan di Rekening Bersama HariKita hingga acara sukses selesai.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-hk-charcoal mt-2 block">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              {submitError && (
                <div role="alert" className="mb-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-manrope text-red-800">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{submitError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-hk-taupe py-3.5 text-sm font-manrope font-bold text-white shadow-md hover:bg-hk-charcoal transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "Memproses & mengunci jadwal vendor..."
                    : `Bayar Sekarang via QRIS (Rp ${amountToPay.toLocaleString("id-ID")})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary: Cart Items Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-hk-ivory/60 border border-hk-champagne/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-hk-champagne/40 pb-3">
            <h3 className="font-editorial text-xl font-bold text-hk-charcoal">
              Ringkasan Racikan ({items.length} Layanan)
            </h3>
            <Link href="/builder" className="text-xs font-manrope font-semibold text-hk-taupe hover:underline">
              Ubah Racikan
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <p className="font-manrope text-xs text-hk-charcoal/60">
                Keranjang racikan masih kosong.
              </p>
              <Link
                href="/builder"
                className="inline-block px-4 py-2 rounded-full bg-hk-taupe text-white text-xs font-manrope font-bold"
              >
                Mulai Racik Paket
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-hk-champagne/40 flex items-start justify-between gap-3 text-xs font-manrope"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-hk-charcoal block">{item.categoryTitle}</span>
                    <p className="text-[11px] text-hk-taupe font-medium">{item.vendorName}</p>
                    <p className="text-[10px] text-hk-charcoal/60">Kec. {item.district}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-hk-charcoal block">
                      Rp {(item.unitPrice * item.quantity).toLocaleString("id-ID")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-[10px] flex items-center gap-0.5 mt-1 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-hk-champagne/40 space-y-2 text-xs font-manrope">
            <div className="flex justify-between text-hk-charcoal/70">
              <span>Subtotal Layanan Vendor:</span>
              <span className="font-mono font-bold text-hk-charcoal">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-hk-charcoal/70">
              <span>Biaya Platform &amp; Server (10%):</span>
              <span className="font-mono font-bold text-hk-charcoal">
                Rp {Math.round(subtotal * 0.1).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-emerald-800">
              <span>Proteksi Rekening Bersama:</span>
              <span className="font-mono font-bold">Termasuk (Gratis)</span>
            </div>
            <div className="flex justify-between text-hk-charcoal font-bold pt-1 border-t border-hk-champagne/20">
              <span>Total Nilai Pesanan:</span>
              <span className="font-mono text-sm">
                Rp {Math.round(subtotal * 1.1).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between font-bold text-emerald-800 pt-1">
              <span>Tagihan DP 30% Sekarang:</span>
              <span className="font-mono text-sm">
                Rp {Math.round(subtotal * 1.1 * 0.3).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-hk-charcoal/60 text-[11px]">
              <span>Sisa Pelunasan 70% (H-7):</span>
              <span className="font-mono">
                Rp {(Math.round(subtotal * 1.1) - Math.round(subtotal * 1.1 * 0.3)).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-[11px] font-manrope text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              Dana DP aman di Rekening Bersama resmi HariKita. 30% hak vendor dicairkan pada H-3 untuk persiapan bahan.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
