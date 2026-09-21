"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { AdminPageHeader, AdminStatCard, AdminCard } from "@/components/admin";
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

export function AdminDashboardClient({
  funnelSteps,
  calendarEvents,
  escrow,
  gmv,
  isAdmin,
}: AdminDashboardClientProps) {
  const totalOrders = escrow?.orders.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Master Kontrol HariKita"
        description="Funnel konversi, jadwal multi-vendor, dan kliring escrow Kebumen."
      />

      {!isAdmin && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-[#f0dcae] bg-[#fbf0d8] p-4 text-xs text-[#7a5608]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Anda belum masuk sebagai Super Admin — sebagian data mungkin kosong.{" "}
            <Link href="/auth/login/admin" className="font-semibold underline">
              Masuk sebagai Admin
            </Link>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total GMV" value={formatRupiah(gmv)} />
        <AdminStatCard label="Order dalam Escrow" value={String(totalOrders)} />
        <AdminStatCard
          label="Vendor Terlibat"
          value={String(calendarEvents.reduce((a, e) => a + e.vendorsCount, 0))}
          delta="perlu dipantau"
          deltaTone="warn"
        />
        <AdminStatCard label="Jurnal Ledger" value={String(escrow?.journalCount ?? 0)} />
      </div>

      <AdminCard
        title="Master Tracking &amp; Eksekutif"
        description="Ringkasan operasional, funnel konversi, kalender, dan escrow."
      >
        <AdminTrackingSuite
          funnelSteps={funnelSteps}
          calendarEvents={calendarEvents}
          escrow={escrow}
          gmv={gmv}
        />
      </AdminCard>
    </div>
  );
}
