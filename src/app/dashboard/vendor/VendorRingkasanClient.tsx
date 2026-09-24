"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Wallet,
  Lock,
  Unlock,
  ExternalLink,
  Eye,
  Sparkles,
  Heart,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { DatePicker } from "@/components/harikita/ui";
import { DashPageHeader } from "@/components/dashboard";
import { ROUTES } from "@/lib/routes";
import { addBlackoutAction, removeBlackoutAction } from "@/server/actions/vendor";
import type { VendorRingkasanDTO, VendorBlackoutDTO } from "@/server/queries/vendor";

/** Tanggal hari ini format "YYYY-MM-DD" (lokal). */
function todayYmd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Halaman Ringkasan portal vendor (client component).
 *
 * Seluruh data berasal dari database milik vendor yang login. Bila vendor belum
 * ter-resolve (`vendor` null), UI menampilkan keadaan kosong yang jujur — tanpa
 * data mock.
 */
export function VendorRingkasanClient({
  vendor,
  dbBlackouts,
}: {
  vendor: VendorRingkasanDTO;
  dbBlackouts: VendorBlackoutDTO[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"calendar" | "wallet">("calendar");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [newDateInput, setNewDateInput] = useState("");

  const blackouts = useMemo(
    () => [...dbBlackouts].sort((a, b) => a.date.localeCompare(b.date)),
    [dbBlackouts]
  );
  const today = useMemo(() => todayYmd(), []);

  const totalOrders = vendor.ordersSolo + vendor.ordersCombo;
  const isApproved = vendor.verificationStatus === "APPROVED";

  const handleAddBlackout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateInput) return;
    if (newDateInput < today) {
      setMessage("Tanggal yang sudah terlewat tidak dapat dikunci.");
      return;
    }
    startTransition(async () => {
      const res = await addBlackoutAction({ date: newDateInput, reason: "Sudah Dipesan Offline" });
      if (res.success) {
        setMessage(null);
        setNewDateInput("");
        router.refresh();
      } else {
        setMessage(res.message || "Gagal mengunci tanggal.");
      }
    });
  };

  const handleRemoveBlackout = (date: string) => {
    startTransition(async () => {
      const res = await removeBlackoutAction({ date });
      if (res.success) {
        setMessage(null);
        router.refresh();
      } else {
        setMessage(res.message || "Gagal membuka kunci tanggal.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title={vendor.businessName}
        description={`Kategori ${vendor.category} • ${vendor.city} • ${totalOrders} acara sukses`}
        action={
          <div className="flex items-center gap-3">
            {vendor.slug && (
              <Link
                href={ROUTES.VENDOR_PROFILE(vendor.slug)}
                target="_blank"
                className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-hk-champagne bg-white px-3.5 text-xs font-semibold text-hk-charcoal hover:bg-hk-ivory"
              >
                <ExternalLink className="w-3.5 h-3.5 text-hk-champagne" />
                Lihat Profil Publik
              </Link>
            )}
            <div className="flex items-center gap-4 rounded-2xl border border-hk-champagne/30 bg-white p-4 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-hk-champagne to-hk-taupe text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-hk-taupe">
                  Saldo Dompet Payout
                </span>
                <p className="font-mono text-xl font-bold text-hk-charcoal">
                  {formatRupiah(vendor.walletBalance)}
                </p>
              </div>
            </div>
          </div>
        }
      />

      {/* Kartu status verifikasi */}
      {!isApproved && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <div className="text-xs leading-relaxed text-amber-900">
            <strong className="font-bold">Profil Anda belum tayang penuh.</strong> Status saat ini:{" "}
            {vendor.verificationStatus}. Lengkapi data usaha &amp; ajukan verifikasi di{" "}
            <Link href={ROUTES.VENDOR.PROFIL} className="font-semibold underline">
              Data Diri &amp; Profil
            </Link>{" "}
            agar tampil di direktori publik.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hk-soft-beige pb-2">
        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "calendar" ? "bg-hk-taupe text-white shadow-sm" : "text-hk-taupe hover:bg-hk-ivory"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Kalender Blackout Dates</span>
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "wallet" ? "bg-hk-taupe text-white shadow-sm" : "text-hk-taupe hover:bg-hk-ivory"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Dompet &amp; Metrik Profil</span>
        </button>
      </div>

      {message && (
        <div className="flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <span>{message}</span>
        </div>
      )}

      {/* TAB 1: BLACKOUT DATES */}
      {activeTab === "calendar" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-4 rounded-3xl border border-hk-champagne/30 bg-white p-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-editorial text-xl font-medium text-hk-charcoal">
                Kunci Tanggal Sibuk / Booking Offline
              </h3>
              <p className="text-xs leading-relaxed text-hk-taupe">
                Tanggal yang Anda kunci di sini otomatis{" "}
                <strong>TIDAK BISA DIBOOKING</strong> oleh calon pengantin di platform HariKita
                Kebumen. Ini mencegah terjadinya double-booking jadwal.
              </p>
            </div>

            <form
              onSubmit={handleAddBlackout}
              className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center"
            >
              <div className="w-full sm:w-64">
                <DatePicker
                  value={newDateInput}
                  onChange={(d) => setNewDateInput(d)}
                  placeholder="Pilih tanggal offline..."
                  size="sm"
                  blackoutDates={blackouts.map((b) => b.date)}
                  displayFormat="EEEE, dd MMMM yyyy"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !newDateInput}
                className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-hk-taupe px-4 text-sm font-bold text-white hover:bg-hk-charcoal disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                {isPending ? "Menyimpan..." : "Kunci Tanggal Ini"}
              </button>
            </form>
          </div>

          {blackouts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hk-champagne/50 bg-hk-ivory/50 p-8 text-center text-xs text-hk-charcoal/60">
              Belum ada tanggal terkunci. Semua tanggal Anda saat ini terbuka untuk booking.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {blackouts.map((b) => (
                <div
                  key={b.date}
                  className="flex items-center justify-between border border-[#f3c9c6] bg-[#fdeceb] p-4 shadow-sm rounded-2xl"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-[#fadad7] p-2 text-[#a2352f]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-mono text-xs font-bold text-[#7a2620]">
                        {b.date}
                      </span>
                      <span className="text-[10px] font-semibold text-[#a2352f]">{b.reason}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBlackout(b.date)}
                    disabled={isPending}
                    className="focus-ring inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-[10px] font-bold text-[#a2352f] hover:bg-[#f3c9c6]/60 disabled:opacity-50"
                  >
                    <Unlock className="w-3 h-3" />
                    Buka Kunci
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WALLET & METRICS */}
      {activeTab === "wallet" && (
        <div className="grid grid-cols-1 gap-6 animate-fadeIn md:grid-cols-3">
          {/* Saldo Siap Tarik */}
          <div className="space-y-4 rounded-3xl border border-hk-champagne/30 bg-white p-6 shadow-sm">
            <span className="text-xs font-bold uppercase text-hk-taupe">Saldo Siap Tarik</span>
            <p className="font-mono text-3xl font-bold text-hk-charcoal">
              {formatRupiah(vendor.walletBalance)}
            </p>
            <p className="text-[11px] leading-relaxed text-hk-taupe">
              Hak dana 30% dari pesanan yang telah memasuki H-3 acara, dan 70% pelunasan dari acara
              yang telah sukses diselesaikan di Kebumen.
            </p>
            <Link
              href={ROUTES.VENDOR.DOMPET}
              className="focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-full bg-hk-taupe px-4 text-sm font-bold text-white hover:bg-hk-charcoal"
            >
              Kelola &amp; Tarik Saldo
            </Link>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="space-y-4 rounded-3xl border border-hk-champagne/30 bg-white p-6 shadow-sm">
            <span className="text-xs font-bold uppercase text-[#8a6410]">Ringkasan Pesanan</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-hk-charcoal">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-hk-taupe" /> Jasa Tunggal
                </span>
                <span className="font-bold">{vendor.ordersSolo} pesanan</span>
              </div>
              <div className="flex items-center justify-between text-hk-charcoal">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-hk-taupe" /> Kombinasi Vendor Lain
                </span>
                <span className="font-bold">{vendor.ordersCombo} pesanan</span>
              </div>
            </div>
            <div className="rounded-xl border border-[#f0dcae] bg-[#fbf0d8] p-2.5 text-[11px] text-[#7a5608]">
              Total {totalOrders} acara sukses tercatat di platform.
            </div>
          </div>

          {/* Metrik Trafik Profil */}
          <div className="space-y-4 rounded-3xl border border-hk-champagne/30 bg-white p-6 shadow-sm">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#157a4d]">
              <TrendingUp className="w-3.5 h-3.5" /> Metrik Trafik Profil
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-hk-charcoal">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-hk-taupe" /> Views Tamu
                </span>
                <span className="font-bold">{vendor.viewsGuest.toLocaleString("id-ID")} kali</span>
              </div>
              <div className="flex justify-between text-hk-charcoal">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-hk-taupe" /> Views Klien (akun)
                </span>
                <span className="font-bold">{vendor.viewsAuth.toLocaleString("id-ID")} kali</span>
              </div>
              <div className="flex justify-between text-hk-charcoal">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-hk-taupe" /> Disimpan Klien
                </span>
                <span className="font-bold">{vendor.bookmarksCount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-hk-charcoal">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-hk-taupe" /> Masuk Racikan Builder
                </span>
                <span className="font-bold">{vendor.builderTrials.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3 rounded-3xl border border-hk-champagne/30 bg-white p-6 shadow-sm md:col-span-3">
            <span className="text-xs font-bold uppercase text-hk-charcoal/70">Reputasi Mitra</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-editorial text-3xl font-bold text-hk-charcoal">
                {vendor.rating.toFixed(1)}
              </span>
              <span className="text-xs text-hk-charcoal/70">
                dari {vendor.reviewCount} ulasan pengantin
              </span>
              {vendor.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mitra Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  <Clock className="h-3.5 w-3.5" /> Menunggu Verifikasi
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
