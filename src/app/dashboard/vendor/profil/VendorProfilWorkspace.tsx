"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Star,
  Sparkles,
  ShieldCheck,
  Eye,
  Users,
  SlidersHorizontal,
  Bookmark,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Calendar,
  Compass,
  Building2,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  WaxSealBadge,
  VintageStampBadge,
  DecorativeDivider,
  BadgePremium,
  ButtonPrimary,
  ButtonSecondary,
  ButtonGhost,
} from "@/components/harikita/ui";
import { VendorAnalyticsLineChart } from "@/components/vendor/VendorAnalyticsLineChart";
import { VendorTrackingSuite } from "@/components/dashboard";
import { VendorRouteMap } from "@/components/vendor/VendorRouteMap";

import { VendorWeatherWidget } from "@/components/vendor/VendorWeatherWidget";
import { VendorRevenueSplitCard } from "@/components/vendor/VendorRevenueSplitCard";
import { VendorProfileForm } from "./VendorProfileForm";
import { VendorProfileData } from "@/server/actions/vendor-profile";
import { formatRupiah } from "@/lib/utils";

interface VendorProfilWorkspaceProps {
  data: VendorProfileData;
}

export function VendorProfilWorkspace({ data }: VendorProfilWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "logistics" | "escrow" | "settings">("analytics");

  const totalViews = data.viewsGuest + data.viewsAuth;
  const totalOrders = data.ordersSolo + data.ordersCombo;
  const estimatedGrossRevenue = totalOrders * 850000 + data.walletBalance;

  // Conversion rates
  const trialRate = totalViews > 0 ? ((data.builderTrials / totalViews) * 100).toFixed(1) : "0";
  const orderRate = data.builderTrials > 0 ? ((totalOrders / data.builderTrials) * 100).toFixed(1) : "0";

  return (
    <div className="py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
      {/* =================================================================
          1. HERO ATELIER: Luxury Organic Studio Header (Brand Hub Living)
         ================================================================= */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-linear-to-br from-white via-hk-ivory to-hk-soft-beige/40 border border-hk-champagne/50 p-5 sm:p-8 lg:p-10 shadow-sm">
        {/* Soft Decorative Ambient Gradients */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-hk-champagne/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 translate-y-16 w-80 h-80 bg-hk-taupe/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Studio Profile & Badges */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
            {/* Top Row on Mobile: Avatar + Badges beside it. On Desktop: Just the Avatar */}
            <div className="flex sm:contents items-center gap-4 w-full sm:w-auto">
              {/* Visual Atelier Crest with WaxSeal Badge */}
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl sm:rounded-3xl bg-hk-charcoal text-hk-champagne flex items-center justify-center shadow-md ring-3 sm:ring-4 ring-hk-champagne/30">
                  <Store className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12" />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <WaxSealBadge size="sm" title="Mitra Terkurasi HariKita Kebumen" />
                </div>
              </div>

              {/* Mobile-only Badges positioned next to Avatar (fills the empty right space!) */}
              <div className="flex sm:hidden flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <BadgePremium
                    label={data.category.toUpperCase()}
                    variant="pill"
                    className="bg-white/90 border-hk-champagne text-hk-taupe text-[10px] px-2.5 py-0.5"
                  />
                  {data.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Mitra Terverifikasi</span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50/90 px-2.5 py-0.5 rounded-full border border-amber-200 font-manrope shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <strong className="font-semibold">{data.rating.toFixed(1)}</strong>
                    <span className="text-muted-foreground">({data.reviewCount} ulasan)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Studio Identity Information */}
            <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
              {/* Desktop-only Badges (clean single row above title) */}
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                <BadgePremium
                  label={data.category.toUpperCase()}
                  variant="pill"
                  className="bg-white/90 border-hk-champagne text-hk-taupe text-xs"
                />

                {data.isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mitra Terverifikasi</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-50/90 px-3 py-1 rounded-full border border-amber-200 font-manrope">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <strong className="font-semibold">{data.rating.toFixed(1)}</strong>
                  <span className="text-muted-foreground">({data.reviewCount} ulasan)</span>
                </span>
              </div>

              <div>
                <h1 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-normal text-hk-charcoal tracking-tight leading-tight">
                  {data.businessName}
                </h1>
                <p className="mt-1 font-editorial text-base sm:text-lg lg:text-xl italic text-hk-taupe">
                  "Menyelaraskan Restu &amp; Impian di Tanah Kebumen"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-y-1 gap-x-5 text-xs sm:text-sm text-hk-charcoal/80 font-manrope pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-hk-taupe shrink-0" />
                  Kecamatan {data.district}, Kabupaten {data.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-hk-taupe shrink-0" />
                  Penanggung Jawab: <strong className="font-semibold text-hk-charcoal">{data.picName}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Saldo Escrow Panel & Action Buttons */}
          <div className="flex flex-col items-stretch sm:items-end gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            {/* Vintage Stamp Badge - Desktop only */}
            <div className="hidden lg:flex items-center gap-4 self-end">
              <VintageStampBadge
                size="sm"
                date="EST. 2026"
                location="KEBUMEN"
                rotation={-3}
              />
            </div>

            {/* Saldo Escrow Card */}
            <div className="w-full sm:w-[320px] lg:w-[340px] bg-white/95 backdrop-blur-xs border border-hk-champagne/60 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground font-manrope">
                <span className="inline-flex items-center gap-1.5 font-semibold text-hk-charcoal">
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  Saldo Siap Tarik
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Escrow H+2
                </span>
              </div>
              <div className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-normal text-hk-charcoal tabular-nums">
                {formatRupiah(data.walletBalance)}
              </div>
              <p className="text-[11px] text-hk-charcoal/70 flex items-center gap-1.5 font-manrope pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Pencairan otomatis via rekening {data.bankName.split(" ")[0]} (Maks. 1x24 jam kerja)
              </p>
            </div>

            {/* Quick Link Navigation Buttons (Matched Height, Perfectly Balanced) */}
            <div className="grid grid-cols-2 gap-2.5 w-full sm:w-[320px] lg:w-[340px]">
              <Link
                href="/dashboard/vendor/kalender"
                className="h-11 px-3 rounded-xl bg-hk-charcoal hover:bg-[#382228] text-white border border-hk-charcoal shadow-2xs font-manrope text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] select-none"
              >
                <Calendar className="w-3.5 h-3.5 text-hk-champagne shrink-0" />
                <span className="truncate">Kalender Booking</span>
              </Link>

              <Link
                href="/catalog"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-3 rounded-xl bg-white hover:bg-hk-ivory text-hk-charcoal border border-hk-champagne/70 shadow-2xs font-manrope text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] select-none"
              >
                <Store className="w-3.5 h-3.5 text-hk-taupe shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Lihat </span>Etalase Publik
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Divider Accent */}
        <div className="mt-8 pt-4 border-t border-hk-champagne/30">
          <DecorativeDivider variant="diamond" color="taupe" className="py-1" />
        </div>
      </section>

      {/* =================================================================
          2. ATELIER WORKSPACE NAVIGATION (Fluid Segmented Studio Tabs)
         ================================================================= */}
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 p-1.5 bg-white rounded-2xl border border-hk-champagne/40 shadow-2xs font-manrope">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "analytics"
              ? "bg-hk-charcoal text-white shadow-xs"
              : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-ivory"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-hk-champagne" />
          Tren &amp; Analitik Pasar
        </button>

        <button
          onClick={() => setActiveTab("logistics")}
          className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "logistics"
              ? "bg-hk-charcoal text-white shadow-xs"
              : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-ivory"
          }`}
        >
          <Compass className="w-4 h-4 text-hk-champagne" />
          Navigasi &amp; Cuaca Lapangan
        </button>

        <button
          onClick={() => setActiveTab("escrow")}
          className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "escrow"
              ? "bg-hk-charcoal text-white shadow-xs"
              : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-ivory"
          }`}
        >
          <Wallet className="w-4 h-4 text-hk-champagne" />
          Finansial 90:10 &amp; Escrow
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "settings"
              ? "bg-hk-charcoal text-white shadow-xs"
              : "text-hk-charcoal/70 hover:text-hk-charcoal hover:bg-hk-ivory"
          }`}
        >
          <Store className="w-4 h-4 text-hk-champagne" />
          Data Studio &amp; Payout
        </button>
      </div>

      {/* =================================================================
          3. TAB CONTENT VIEWS
         ================================================================= */}

      {/* TAB 1: ANALYTICS & INTERACTIVE DASHBOARD TRACKING SUITE */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Master 5-Component Tracking Suite (Spline Area, Semi-Donut Gauge, Sparkline Cards, Schedule Timeline, Tracking Table) */}
          <VendorTrackingSuite data={data} />


          {/* C. Decorative Divider */}
          <DecorativeDivider variant="botanical" color="champagne" className="py-2" />

          {/* D. Conversion Funnel Tracker */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-hk-champagne/40 shadow-xs space-y-6 font-manrope">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-hk-taupe">
                  Corong Konversi Pelanggan
                </span>
                <h4 className="font-editorial text-2xl font-normal text-hk-charcoal mt-1">
                  Alur Keputusan Calon Pengantin Kebumen
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dari tahap eksplorasi awal hingga penguncian tanggal acara di rekening bersama.
                </p>
              </div>
              <div className="text-xs font-semibold text-hk-charcoal bg-hk-soft-beige/50 px-4 py-2 rounded-xl border border-hk-champagne/40 self-start sm:self-auto">
                Konversi Builder ke Order: <span className="text-emerald-700 font-bold">{orderRate}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
              {/* Step 1 */}
              <div className="bg-hk-ivory/70 rounded-2xl p-5 border border-hk-champagne/30 space-y-2">
                <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  1. Impresi Publik
                </div>
                <div className="font-editorial text-3xl font-normal text-hk-charcoal tabular-nums">
                  {totalViews} <span className="text-xs font-manrope text-muted-foreground">views</span>
                </div>
                <div className="w-full bg-hk-champagne/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-hk-charcoal h-full w-full rounded-full" />
                </div>
                <span className="text-[10px] text-muted-foreground block pt-1">100% Calon Pengantin</span>
              </div>

              {/* Step 2 */}
              <div className="bg-hk-ivory/70 rounded-2xl p-5 border border-hk-champagne/30 space-y-2">
                <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  2. Coba di Builder
                </div>
                <div className="font-editorial text-3xl font-normal text-hk-charcoal tabular-nums">
                  {data.builderTrials} <span className="text-xs font-manrope text-muted-foreground">racikan</span>
                </div>
                <div className="w-full bg-hk-champagne/30 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (data.builderTrials / totalViews) * 100 * 2.5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-amber-700 font-medium block pt-1">
                  {trialRate}% berlanjut ke simulasi
                </span>
              </div>

              {/* Step 3 */}
              <div className="bg-hk-ivory/70 rounded-2xl p-5 border border-hk-champagne/30 space-y-2">
                <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  3. Simpan Wishlist
                </div>
                <div className="font-editorial text-3xl font-normal text-hk-charcoal tabular-nums">
                  {data.bookmarksCount} <span className="text-xs font-manrope text-muted-foreground">pasangan</span>
                </div>
                <div className="w-full bg-hk-champagne/30 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (data.bookmarksCount / totalViews) * 100 * 3.5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-rose-700 font-medium block pt-1">
                  {((data.bookmarksCount / totalViews) * 100).toFixed(1)}% disimpan ke favorit
                </span>
              </div>

              {/* Step 4 */}
              <div className="bg-hk-ivory/70 rounded-2xl p-5 border border-hk-champagne/30 space-y-2">
                <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  4. Booking &amp; Escrow
                </div>
                <div className="font-editorial text-3xl font-normal text-emerald-800 tabular-nums">
                  {totalOrders} <span className="text-xs font-manrope text-muted-foreground">order</span>
                </div>
                <div className="w-full bg-hk-champagne/30 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, (totalOrders / data.builderTrials) * 100 * 1.5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block pt-1">
                  {orderRate}% transaksi berhasil
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERASIONAL & LAPANGAN (Route Map & Weather) */}
      {activeTab === "logistics" && (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-hk-taupe">
              Operasional Lapangan Kebumen
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-hk-charcoal mt-1">
              Navigasi Venue &amp; Prakiraan Cuaca Hari H
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Simulasi rute tempuh kendaraan dari studio Anda ke seluruh kecamatan Kebumen serta rekomendasi cuaca spesifik layanan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <VendorRouteMap
                vendorStudioDistrict={data.district}
                vendorStudioAddress={data.address}
              />
            </div>
            <div className="lg:col-span-5">
              <VendorWeatherWidget
                category={data.category}
                district={data.district}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANSIAL & ESCROW 90:10 */}
      {activeTab === "escrow" && (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-hk-taupe">
              Transparansi Finansial &amp; SLA
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-hk-charcoal mt-1">
              Bagi Hasil 90:10 &amp; Termin Rekening Bersama
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              90% penerimaan bersih adalah hak mitra vendor. Termin DP 30% pada H-3 dan Pelunasan 70% pada H+2 pasca-acara.
            </p>
          </div>

          <VendorRevenueSplitCard
            grossRevenue={estimatedGrossRevenue}
            walletBalance={data.walletBalance}
            ordersCount={totalOrders}
          />
        </div>
      )}

      {/* TAB 4: DATA STUDIO & REKENING PAYOUT */}
      {activeTab === "settings" && (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-hk-taupe">
              Identitas &amp; Rekening Bank
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-hk-charcoal mt-1">
              Pengaturan Profil Studio &amp; Payout Escrow
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Perbarui penanggung jawab studio (PIC), nomor WhatsApp terverifikasi, alamat studio, dan rekening bank penarikan saldo.
            </p>
          </div>

          <VendorProfileForm initialData={data} />
        </div>
      )}
    </div>
  );
}
