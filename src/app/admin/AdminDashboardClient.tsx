"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  ShieldAlert,
  Calendar,
  BarChart3,
  CheckCircle2,
  MapPin,
  TrendingUp,
  AlertCircle,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { EmptyState } from "@/components/harikita/ui";
import { AdminTrackingSuite } from "@/components/dashboard";

import type { AdminCalendarEventDTO } from "@/server/queries/orders";

export interface FunnelStepVM {
  step: number;
  name: string;
  count: number;
  pct: string;
  rawEvent: string;
}

export interface AdminDashboardClientProps {
  /** Telemetri funnel (dari AnalyticsTelemetry; fallback kerangka 10 tahap). */
  funnelSteps: FunnelStepVM[];
  /** Event master calendar dari DB. */
  calendarEvents: AdminCalendarEventDTO[];
  /** Ringkasan escrow (nullable bila bukan admin). */
  escrow: {
    orders: Array<{
      id: string;
      orderNumber: string;
      clientName: string;
      status: string;
      totalAmount: number;
      eventDate: string;
      itemCount: number;
    }>;
    journalCount: number;
    totalDebit: number;
    totalCredit: number;
  } | null;
  /** Nilai transaksi agregat (GMV) dari DB. */
  gmv: number;
  /** Apakah sesi admin aktif (untuk pesan bila kosong). */
  isAdmin: boolean;
}

const CALENDAR_STATUS_LABEL: Record<AdminCalendarEventDTO["status"], string> = {
  TERKUNCI_DP: "Terkunci DP",
  LUNAS_ESCROW: "Lunas Escrow",
  SELESAI: "Selesai",
};

export function AdminDashboardClient({
  funnelSteps,
  calendarEvents,
  escrow,
  gmv,
  isAdmin,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "funnel" | "calendar" | "escrow">("overview");

  const tabs = [
    { id: "overview" as const, label: "Master Tracking & Eksekutif", icon: LayoutDashboard },
    { id: "funnel" as const, label: "Master 10-Tahapan Funnel Konversi", icon: BarChart3 },
    { id: "calendar" as const, label: "Master Kalender Multi-Vendor Se-Kebumen", icon: Calendar },
    { id: "escrow" as const, label: "Kliring & Settlement Rekening Bersama", icon: CheckCircle2 },
  ];


  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/25 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Super Admin Dashboard Governance</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold mt-2">
            Master Kontrol HariKita Kebumen
          </h1>
          <p className="text-xs text-plum-light mt-1">
            Monitoring 10-Tahapan Funnel Konversi, Jadwal Multi-Vendor Seluruh Kebumen, dan Kliring Dana Escrow.
          </p>
        </div>

        {/* Global GMV */}
        <div className="flex flex-col items-end gap-2">
          <div className="p-3.5 rounded-2xl bg-white border border-gold/30 shadow-xs text-right">
            <span className="text-[10px] text-plum-light font-bold uppercase">Total Nilai Transaksi (GMV)</span>
            <p className="font-mono text-xl font-bold text-plum">{formatRupiah(gmv)}</p>
          </div>
          {isAdmin && (
            <Link
              href="/admin/pengaturan"
              className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-xs font-bold text-plum transition-colors hover:bg-gold/10"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Pengaturan Platform
            </Link>
          )}
        </div>
      </div>

      {/* Non-admin notice */}
      {!isAdmin && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Anda belum masuk sebagai Super Admin — sebagian data mungkin kosong.{" "}
            <Link href="/auth/login/admin" className="font-semibold underline">
              Masuk sebagai Admin
            </Link>
          </span>
        </div>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Navigasi panel admin"
        className="flex flex-wrap items-center gap-2 border-b border-gold/20 pb-2"
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const selected = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(t.id)}
              className={`focus-ring px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 min-h-[44px] ${
                selected ? "gold-gradient-bg text-plum-dark shadow-sm" : "text-plum-light hover:bg-gold/10"
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: MASTER TRACKING & OVERVIEW SUITE */}
      {activeTab === "overview" && (

        <div className="space-y-6 animate-fadeIn">
          <AdminTrackingSuite
            funnelSteps={funnelSteps}
            calendarEvents={calendarEvents}
            escrow={escrow}
            gmv={gmv}
          />
        </div>
      )}

      {/* TAB 1: FUNNEL */}
      {activeTab === "funnel" && (

        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-sm space-y-2">
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Telemetri 10 Tahapan Konversi Platform
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Memantau alur perjalanan pengguna mulai dari kunjungan awal, interaksi dengan simulator, lazy registration WhatsApp, hingga rilis escrow pasca-acara di Kebumen.
            </p>
          </div>

          <div className="space-y-2">
            {funnelSteps.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-2xl bg-white border border-gold/25 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-gold/15 text-plum-dark text-xs font-bold flex items-center justify-center font-mono">
                    {item.step}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-plum block">{item.name}</span>
                    <span className="text-[10px] text-plum-light font-mono">{item.count} Pengguna</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden hidden sm:block" aria-hidden="true">
                    <div className="gold-gradient-bg h-full rounded-full" style={{ width: item.pct }} />
                  </div>
                  <span className="font-mono text-xs font-bold text-gold-dark w-12 text-right">
                    {item.pct}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER CALENDAR */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-sm space-y-2">
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Peta Jadwal Seluruh Vendor Kabupaten Kebumen
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Memastikan tidak ada bentrok jadwal antar vendor lokal pada tanggal yang sama. Seluruh booking diverifikasi secara real-time.
            </p>
          </div>

          {calendarEvents.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Belum ada jadwal acara"
              description="Event master calendar akan tampil di sini setelah ada pesanan yang tersimpan di database."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {calendarEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-6 rounded-3xl bg-white border border-gold/30 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-gold-dark bg-gold/15 px-3 py-1 rounded-full">
                      {evt.date.split("T")[0]}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                      {CALENDAR_STATUS_LABEL[evt.status] ?? evt.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif-luxury text-xl font-bold text-plum">{evt.client}</h4>
                    <p className="text-xs text-plum-light flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-dark" aria-hidden="true" />
                      <span>{evt.venue}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gold/15 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-plum-light">
                      {evt.vendorsCount} Vendor Terlibat:
                    </span>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {evt.vendors.length === 0 ? (
                        <span className="text-plum-light italic">Belum ada vendor terkait.</span>
                      ) : (
                        evt.vendors.slice(0, 6).map((v, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-gold/20 text-plum"
                          >
                            {v.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ESCROW */}
      {activeTab === "escrow" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gold/30 shadow-sm space-y-2">
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Pusat Penyelesaian &amp; Kliring Rekening Bersama
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Daftar transaksi dalam masa tahan escrow. Rilis 30% hak vendor operasional H-3 dan rilis 70% pelunasan pasca-acara H+2 di Kebumen.
            </p>
          </div>

          {/* Ringkasan ledger */}
          {escrow && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-gold/25 shadow-xs">
                <span className="text-[10px] text-plum-light font-bold uppercase">Jurnal Tercatat</span>
                <p className="font-mono text-lg font-bold text-plum">{escrow.journalCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gold/25 shadow-xs">
                <span className="text-[10px] text-plum-light font-bold uppercase">Total Debit</span>
                <p className="font-mono text-lg font-bold text-plum">{formatRupiah(escrow.totalDebit)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gold/25 shadow-xs">
                <span className="text-[10px] text-plum-light font-bold uppercase">Total Kredit</span>
                <p className="font-mono text-lg font-bold text-plum">{formatRupiah(escrow.totalCredit)}</p>
              </div>
            </div>
          )}

          {!escrow || escrow.orders.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Belum ada transaksi escrow"
              description="Order yang masuk masa penahanan escrow akan tampil di sini beserta status pembayarannya."
            />
          ) : (
            <div className="space-y-3">
              {escrow.orders.map((o) => {
                const dp = Math.round(o.totalAmount * 0.3);
                const pelunasan = o.totalAmount - dp;
                return (
                  <div
                    key={o.id}
                    className="p-6 rounded-3xl bg-white border border-gold/25 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-gold/20 pb-3">
                      <span className="font-bold text-plum">
                        Pesanan: {o.orderNumber} ({o.clientName})
                      </span>
                      <span className="font-mono font-bold text-emerald-700">{o.status}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-plum">
                      <div>
                        <span className="text-plum-light block">Total Nilai Paket:</span>
                        <span className="font-mono font-bold">{formatRupiah(o.totalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-plum-light block">DP 30%:</span>
                        <span className="font-mono font-bold text-emerald-800">{formatRupiah(dp)}</span>
                      </div>
                      <div>
                        <span className="text-plum-light block">Pelunasan 70% (Escrow):</span>
                        <span className="font-mono font-bold text-amber-700">{formatRupiah(pelunasan)}</span>
                      </div>
                      <div>
                        <span className="text-plum-light block">Jumlah Vendor:</span>
                        <span className="font-bold">{o.itemCount} Vendor</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href="/admin/escrow"
              className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-hk-taupe px-6 py-3 font-manrope text-xs font-bold text-white transition-colors hover:bg-[#78644e]"
            >
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              Buka Otorisasi &amp; Detail Escrow
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
