"use client";

import React, { useState, useEffect, useCallback, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Clock,
  QrCode,
  Building2,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { orderStore } from "@/lib/order-store";
import { notificationStore } from "@/lib/notification-store";
import {
  simulatePaymentSuccessAction,
  createChargeAction,
  getActiveProviderAction,
  getPaymentStatusAction,
} from "@/server/actions/payment";
import type { GatewayProvider } from "@/server/payments/types";
import { qrStringToDataUrl } from "@/lib/qr";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
const MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

function loadSnapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.snap) return resolve();
    const src = MIDTRANS_IS_PRODUCTION
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("snap_load_error")));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("snap_load_error"));
    document.body.appendChild(script);
  });
}

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default function PembayaranEscrowPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId || "HKB-2026-001";
  const router = useRouter();

  const { items, subtotal, customerName, customerWhatsApp, eventDate, eventLocation, paymentType, clearCart } = useCart();

  // Hitung nominal DP vs Lunas
  const baseTotal = subtotal > 0 ? subtotal : 15850000; // fallback mock
  const dpAmount = Math.round(baseTotal * 0.3);
  const pelunasanAmount = baseTotal - dpAmount;
  const payAmount = paymentType === "full_100" ? baseTotal : dpAmount;

  // Countdown timer 15:00
  const [timeLeft, setTimeLeft] = useState(900); // 15 menit
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSimulatingSuccess, setIsSimulatingSuccess] = useState(false);
  const [isSnapLoading, setIsSnapLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "transfer">("qris");

  // Provider aktif (xendit | midtrans | simulated_qris) — ditentukan server.
  const [provider, setProvider] = useState<GatewayProvider | null>(null);
  // QR dinamis (Xendit): data URL gambar (dari qrString).
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [paidBanner, setPaidBanner] = useState(false);
  const chargeRequestedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Muat provider aktif sekali.
  useEffect(() => {
    let alive = true;
    getActiveProviderAction()
      .then((p) => {
        if (alive) setProvider(p);
      })
      .catch(() => {
        if (alive) setProvider("simulated_qris");
      });
    return () => {
      alive = false;
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /** Setelah pembayaran lunas → arahkan ke invoice. */
  const goToInvoice = useCallback(() => {
    clearCart();
    router.push(`/pesanan/${bookingId}/invoice`);
  }, [clearCart, router, bookingId]);

  /**
   * Membuat QRIS dinamis via Xendit:
   *  1. createChargeAction → qrString + attempt.
   *  2. Render qrString → gambar QR.
   *  3. Polling status hingga lunas (webhook Xendit menandai installment PAID).
   */
  const startXenditQris = useCallback(async () => {
    if (chargeRequestedRef.current) return;
    chargeRequestedRef.current = true;
    setIsQrLoading(true);
    setPaymentError(null);

    const charge = await createChargeAction({ orderId: bookingId, provider: "xendit" });
    if (!charge.success) {
      setPaymentError(charge.message || "Gagal membuat QRIS dinamis Xendit.");
      setIsQrLoading(false);
      chargeRequestedRef.current = false;
      return;
    }

    const qr = charge.data.qrString;
    if (!qr) {
      // Xendit dapat mengembalikan paymentUrl (checkout) alih-alih qrString.
      if (charge.data.paymentUrl && !charge.data.paymentUrl.startsWith("/")) {
        window.location.href = charge.data.paymentUrl;
        return;
      }
      setPaymentError("Gateway tidak mengembalikan QR. Silakan coba lagi.");
      setIsQrLoading(false);
      chargeRequestedRef.current = false;
      return;
    }

    try {
      const dataUrl = await qrStringToDataUrl(qr);
      setQrDataUrl(dataUrl);
      setIsQrLoading(false);
      setIsPolling(true);
    } catch {
      setPaymentError("Gagal merender QR. Silakan muat ulang halaman.");
      setIsQrLoading(false);
      chargeRequestedRef.current = false;
    }
  }, [bookingId]);

  // Auto-mulai QRIS Xendit begitu provider diketahui & tab QRIS aktif.
  useEffect(() => {
    if (provider === "xendit" && paymentMethod === "qris" && !qrDataUrl && !isQrLoading) {
      void startXenditQris();
    }
  }, [provider, paymentMethod, qrDataUrl, isQrLoading, startXenditQris]);

  // Polling status pembayaran saat QR dinamis aktif.
  useEffect(() => {
    if (!isPolling) return;
    const id = setInterval(async () => {
      const res = await getPaymentStatusAction(bookingId);
      if (res.success && res.data.paid) {
        setIsPolling(false);
        setPaidBanner(true);
        setTimeout(goToInvoice, 1500);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [isPolling, bookingId, goToInvoice]);

  /**
   * Memulai pembayaran via Midtrans Snap (QRIS semua e-wallet/bank + transfer bank).
   */
  const handleMidtransSnap = async () => {
    setIsSnapLoading(true);
    setPaymentError(null);

    const charge = await createChargeAction({ orderId: bookingId, provider: "midtrans" });
    if (!charge.success) {
      setPaymentError(charge.message || "Gagal memulai transaksi Midtrans.");
      setIsSnapLoading(false);
      return;
    }

    const token = charge.data.providerTransactionId;
    const redirectUrl = charge.data.paymentUrl;

    try {
      await loadSnapScript();
      if (window.snap && token && !token.startsWith("SIM-")) {
        window.snap.pay(token, {
          onSuccess: () => router.push(`/pesanan/${bookingId}/invoice`),
          onPending: () => {
            setPaymentError("Pembayaran tertunda. Selesaikan sesuai instruksi, lalu cek status.");
            setIsSnapLoading(false);
          },
          onError: () => {
            setPaymentError("Pembayaran gagal di gateway. Silakan coba lagi.");
            setIsSnapLoading(false);
          },
          onClose: () => {
            setPaymentError("Jendela pembayaran ditutup sebelum selesai.");
            setIsSnapLoading(false);
          },
        });
        return;
      }
    } catch {
      // snap.js gagal dimuat → lanjut ke fallback redirect / simulasi.
    }

    if (redirectUrl && !redirectUrl.startsWith("/")) {
      window.location.href = redirectUrl;
      return;
    }

    setIsSnapLoading(false);
    await handleSimulatePayment();
  };

  const handleSimulatePayment = async () => {
    setIsSimulatingSuccess(true);
    setPaymentError(null);

    const remote = await simulatePaymentSuccessAction({ orderId: bookingId });

    if (!remote.success) {
      console.warn("[pembayaran] server action gagal:", remote.message);
      setPaymentError(
        remote.message ||
          "Pembayaran tersimpan secara lokal (demo). Order database tidak ditemukan untuk ID ini."
      );
    }

    const newOrder = orderStore.createOrder({
      bookingId,
      customerName: customerName || "Calon Pengantin HariKita",
      customerWhatsApp: customerWhatsApp || "081234567890",
      eventDate: eventDate || "2026-10-24",
      eventLocation: eventLocation || "Gedung Bale Marmer Kebumen",
      district: eventLocation ? "Kebumen" : "Kebumen Kota",
      paymentType: paymentType || "dp_30",
      items: items.length > 0 ? items : [
        {
          id: "item_p_1",
          categoryId: "prewed",
          categoryTitle: "Pre-wedding Alam & Studio",
          vendorId: "v_prewed_01",
          vendorName: "Menganti Cinematic & Studio",
          district: "Ayah",
          packageId: "pkg_prewed_basic",
          packageName: "Paket Pantai Menganti Sunset",
          unitPrice: 3500000,
          quantity: 1,
          callTime: "14:00 WIB",
          notes: "Spot Pantai Menganti & bukit eksotis.",
        },
        {
          id: "item_p_2",
          categoryId: "busana",
          categoryTitle: "Busana Pengantin & Fitting",
          vendorId: "v_busana_01",
          vendorName: "Griya Busana Rarasati",
          district: "Kebumen Kota",
          packageId: "pkg_busana_kebaya_perdana",
          packageName: "Sewa Perdana Kebaya Brokat & Beskap",
          unitPrice: 4200000,
          quantity: 1,
          callTime: "06:00 WIB",
          notes: "Fitting fisik di butik Kebumen Kota.",
        },
        {
          id: "item_p_3",
          categoryId: "mua",
          categoryTitle: "Makeup Artist (MUA)",
          vendorId: "v_mua_01",
          vendorName: "Alula MUA & Hijab",
          district: "Kebumen Kota",
          packageId: "pkg_mua_glam",
          packageName: "Rias Pengantin Soft Glam Akad",
          unitPrice: 2800000,
          quantity: 1,
          callTime: "04:30 WIB",
          notes: "Ronce melati asli & hijab styling.",
        },
        {
          id: "item_p_4",
          categoryId: "katering",
          categoryTitle: "Katering Prasmanan & Stall",
          vendorId: "v_katering_01",
          vendorName: "Dapur Rasa Boga Kebumen",
          district: "Kutowinangun",
          packageId: "pkg_katering_selaras",
          packageName: "Prasmanan Selaras 200 Pax",
          unitPrice: 5350000,
          quantity: 1,
          callTime: "09:00 WIB",
          notes: "Free Sample Box Test Food.",
        }
      ],
      subtotal: subtotal > 0 ? subtotal : 15850000,
    });

    notificationStore.dispatchFromOrder(newOrder);

    setTimeout(() => {
      clearCart();
      router.push(`/pesanan/${bookingId}/invoice`);
    }, 1200);
  };

  const providerLabel =
    provider === "xendit" ? "Xendit" : provider === "midtrans" ? "Midtrans" : "Mode Uji Coba";

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#6B5E62] hover:text-[#4A2E35] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Checkout
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5D7C7]/50 text-[#4A2E35] text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
            Escrow Protected
          </div>
        </div>

        {/* Header Summary */}
        <div className="bg-white rounded-2xl p-6 border border-[#C5A880]/30 shadow-sm text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6B5E62]">
            Kode Booking: <strong className="text-[#4A2E35]">{bookingId}</strong>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#4A2E35]">
            Menunggu Pembayaran Escrow
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E62] max-w-lg mx-auto leading-relaxed">
            Dana Anda aman di rekening penampung resmi HariKita. Mitra vendor di Kebumen baru menerima
            pencairan operasional pada H-3 setelah jadwal disetujui.
          </p>

          {/* Countdown Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-sm font-mono font-medium">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
            Sisa Waktu Pembayaran: <span className="font-bold text-base">{formatTime(timeLeft)}</span>
          </div>

          <div className="pt-2 border-t border-[#FAF8F5]">
            <div className="text-xs text-[#6B5E62]">Total Tagihan ({paymentType === "full_100" ? "Lunas 100%" : "DP 30% Kunci Tanggal"})</div>
            <div className="font-serif text-3xl sm:text-4xl text-[#C5A880] font-bold">
              Rp {payAmount.toLocaleString("id-ID")}
            </div>
            {paymentType !== "full_100" && (
              <div className="text-xs text-[#6B5E62] mt-1">
                Sisa pelunasan 70% (Rp {pelunasanAmount.toLocaleString("id-ID")}) wajib diselesaikan pada H-7 acara.
              </div>
            )}
          </div>
        </div>

        {/* Paid banner (setelah polling mendeteksi lunas) */}
        {paidBanner && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Pembayaran terkonfirmasi. Mengalihkan ke halaman invoice…</span>
          </div>
        )}

        {/* Payment Method Switcher */}
        <div className="bg-white rounded-2xl p-6 border border-[#C5A880]/30 shadow-sm space-y-6">
          <div className="flex gap-2 p-1 bg-[#FAF8F5] rounded-xl border border-[#C5A880]/20">
            <button
              onClick={() => setPaymentMethod("qris")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                paymentMethod === "qris"
                  ? "bg-[#4A2E35] text-white shadow"
                  : "text-[#6B5E62] hover:text-[#4A2E35]"
              }`}
            >
              <QrCode className="w-4 h-4" /> QRIS Instan (ShopeePay, GoPay, OVO, DANA)
            </button>
            <button
              onClick={() => setPaymentMethod("transfer")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                paymentMethod === "transfer"
                  ? "bg-[#4A2E35] text-white"
                  : "text-[#6B5E62] hover:text-[#4A2E35]"
              }`}
            >
              <Building2 className="w-4 h-4" /> Transfer Virtual Account
            </button>
          </div>

          {paymentMethod === "qris" ? (
            /* QRIS Container */
            <div className="text-center space-y-4 py-2">
              {/* QR dinamis Xendit */}
              {provider === "xendit" && (
                <>
                  <div className="inline-block p-4 bg-white rounded-2xl border-2 border-dashed border-[#C5A880] shadow-md">
                    <div className="w-56 h-56 mx-auto bg-white rounded-xl flex items-center justify-center p-2 border border-[#E5D7C7] overflow-hidden">
                      {qrDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrDataUrl}
                          alt="QRIS dinamis Xendit"
                          width={224}
                          height={224}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-[#6B5E62]">
                          <RefreshCw className={`w-6 h-6 ${isQrLoading ? "animate-spin" : ""}`} />
                          <span className="text-xs">{isQrLoading ? "Menyiapkan QRIS…" : "QR belum siap"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-[#6B5E62] space-y-1">
                    <p className="font-medium text-[#4A2E35]">
                      QRIS Dinamis • {providerLabel}
                    </p>
                    <p>
                      Scan dengan aplikasi apa pun berlogo QRIS — termasuk <strong>ShopeePay</strong>,
                      GoPay, OVO, DANA, dan semua m-banking.
                    </p>
                    {isPolling && (
                      <p className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Menunggu pembayaran terverifikasi otomatis…
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Fallback: belum ada provider / simulated / Midtrans bisa bayar via tombol di bawah */}
              {provider !== "xendit" && (
                <>
                  <div className="inline-block p-4 bg-white rounded-2xl border-2 border-dashed border-[#C5A880] shadow-md">
                    <div className="w-56 h-56 mx-auto bg-[#FAF8F5] rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden border border-[#E5D7C7]">
                      <div className="absolute top-2 left-2 w-10 h-10 border-4 border-[#4A2E35] rounded-lg"></div>
                      <div className="absolute top-2 right-2 w-10 h-10 border-4 border-[#4A2E35] rounded-lg"></div>
                      <div className="absolute bottom-2 left-2 w-10 h-10 border-4 border-[#4A2E35] rounded-lg"></div>
                      <div className="grid grid-cols-6 gap-1.5 p-6 opacity-70">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-sm ${
                              (i * 7) % 3 === 0 ? "bg-[#4A2E35]" : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="px-3 py-1 bg-[#C5A880] text-[#4A2E35] font-bold text-xs rounded-md shadow">
                          {provider === "midtrans" ? "Klik Bayar di Bawah" : "QRIS HARI KITA"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#6B5E62] space-y-1">
                    {provider === "midtrans" ? (
                      <p>Klik tombol <strong>Bayar via Midtrans</strong> di bawah untuk menampilkan QRIS &amp; Virtual Account.</p>
                    ) : (
                      <>
                        <p className="font-medium text-[#4A2E35]">NMID: ID1020261198293 — PT HARI KITA BERSAMA KEBUMEN</p>
                        <p>Scan menggunakan BCA Mobile, Livin Mandiri, BRImo, BNI, GoPay, OVO, ShopeePay, atau DANA.</p>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Transfer Virtual Account */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#E5D7C7] bg-[#FAF8F5] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#4A2E35]">Bank Central Asia (BCA)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Verifikasi Otomatis</span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#E5D7C7]">
                  <span className="font-mono text-base font-bold text-[#4A2E35]">8277 0812 9982 001</span>
                  <button
                    onClick={() => handleCopy("827708129982001", "bca")}
                    className="p-1.5 hover:bg-[#FAF8F5] rounded text-xs font-medium text-[#C5A880] flex items-center gap-1"
                  >
                    {copiedKey === "bca" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copiedKey === "bca" ? "Disalin" : "Salin"}
                  </button>
                </div>
                <p className="text-[11px] text-[#6B5E62]">Atas Nama: PT Hari Kita Bersama - Rekening Escrow Penampung</p>
              </div>

              <div className="p-4 rounded-xl border border-[#E5D7C7] bg-[#FAF8F5] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#4A2E35]">Bank Mandiri</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Verifikasi Otomatis</span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#E5D7C7]">
                  <span className="font-mono text-base font-bold text-[#4A2E35]">8902 2109 4432 001</span>
                  <button
                    onClick={() => handleCopy("890221094432001", "mandiri")}
                    className="p-1.5 hover:bg-[#FAF8F5] rounded text-xs font-medium text-[#C5A880] flex items-center gap-1"
                  >
                    {copiedKey === "mandiri" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copiedKey === "mandiri" ? "Disalin" : "Salin"}
                  </button>
                </div>
                <p className="text-[11px] text-[#6B5E62]">Atas Nama: HariKita Event Escrow Kebumen</p>
              </div>
            </div>
          )}

          {/* Escrow Guarantee Banner */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#C5A880]/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
            <div className="text-xs text-[#6B5E62] leading-relaxed">
              <strong className="text-[#4A2E35] block">Garansi Keamanan Rekening Bersama HariKita:</strong>
              Uang Anda tidak langsung ditransfer ke vendor. Dana 30% baru diteruskan ke vendor pada H-3 untuk belanja logistik, dan 70% sisanya baru dicairkan setelah Anda mengonfirmasi acara selesai dengan sukses.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            {paymentError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Xendit: QR ditampilkan otomatis; sediakan tombol muat ulang QR. */}
            {provider === "xendit" && paymentMethod === "qris" && (
              <button
                onClick={() => {
                  chargeRequestedRef.current = false;
                  setQrDataUrl(null);
                  void startXenditQris();
                }}
                disabled={isQrLoading}
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#C5A880]/60 text-[#4A2E35] font-medium text-sm hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isQrLoading ? "animate-spin" : ""}`} />
                {isQrLoading ? "Menyiapkan QRIS…" : "Muat Ulang QRIS Dinamis"}
              </button>
            )}

            {/* Midtrans: tombol Snap (QRIS semua e-wallet + VA). */}
            {provider === "midtrans" && (
              <button
                onClick={handleMidtransSnap}
                disabled={isSnapLoading || isSimulatingSuccess}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#4A2E35] to-[#6B5E62] text-white font-medium text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSnapLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyiapkan pembayaran aman…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                    Bayar via Midtrans (QRIS &amp; Transfer Bank)
                  </>
                )}
              </button>
            )}

            {/* Simulasi sandbox: selalu tersedia sebagai fallback pilot. */}
            <button
              onClick={handleSimulatePayment}
              disabled={isSimulatingSuccess || isSnapLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#C5A880]/60 text-[#4A2E35] font-medium text-xs hover:bg-[#FAF8F5] transition-all flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
            >
              {isSimulatingSuccess ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#4A2E35] border-t-transparent rounded-full animate-spin"></div>
                  Memverifikasi Pembayaran…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
                  Simulasikan Pembayaran Berhasil (Uji Coba Sandbox)
                </>
              )}
            </button>
            <div className="text-center text-[11px] text-[#6B5E62]">
              Sistem akan otomatis menerbitkan Lembar Invoice Resmi ber-watermark setelah pembayaran tervalidasi.
              {provider === "xendit" && " Status diverifikasi otomatis via webhook Xendit."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
