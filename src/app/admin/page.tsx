import type { Metadata } from "next";
import { getFunnelTelemetry } from "@/server/queries/admin";
import { getAdminCalendarEvents, getAdminEscrowOverview } from "@/server/queries/orders";
import { getSession } from "@/lib/session";
import {
  AdminDashboardClient,
  type FunnelStepVM,
} from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Master Kontrol Super Admin",
  description:
    "Dashboard Super Admin HariKita: funnel konversi, master kalender multi-vendor Kebumen, dan kliring dana escrow.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Kerangka 10 tahapan funnel kanonik. `eventType` memetakan ke nilai
 * AnalyticsTelemetry; bila belum ada data, count = 0 (bukan angka fiktif).
 */
const FUNNEL_DEFINITION: Array<{ step: number; name: string; eventType: string }> = [
  { step: 1, name: "Trafik Landing Page Kebumen", eventType: "PAGE_VIEW" },
  { step: 2, name: "Lihat Detail Vendor & Portofolio", eventType: "VENDOR_VIEW" },
  { step: 3, name: "Buka Simulator Mix-and-Match", eventType: "BUILDER_OPEN" },
  { step: 4, name: "Simulasi Ganti Pax / Baki / Tema", eventType: "PRICELIST_CLICK" },
  { step: 5, name: "Klik 'Ajukan Pesanan & Booking'", eventType: "CART_ADD" },
  { step: 6, name: "Input WhatsApp (Lazy Registration)", eventType: "CHECKOUT_INIT" },
  { step: 7, name: "Terbit Invoice DP 30% Escrow", eventType: "INVOICE_ISSUED" },
  { step: 8, name: "DP 30% Terbayar (Kunci Tanggal)", eventType: "DP_PAID" },
  { step: 9, name: "Pelunasan 70% Terbayar H-7", eventType: "SETTLEMENT_PAID" },
  { step: 10, name: "Penyelesaian Sukses Pasca-Acara H+2", eventType: "DEAL_CLOSED" },
];

function buildFunnelSteps(
  telemetry: Array<{ eventType: string; count: number }>
): FunnelStepVM[] {
  const countMap = new Map(telemetry.map((t) => [t.eventType, t.count]));
  const topCount = FUNNEL_DEFINITION.reduce(
    (max, def) => Math.max(max, countMap.get(def.eventType) ?? 0),
    0
  );

  return FUNNEL_DEFINITION.map((def) => {
    const count = countMap.get(def.eventType) ?? 0;
    const pct = topCount > 0 ? `${((count / topCount) * 100).toFixed(1)}%` : "0.0%";
    return {
      step: def.step,
      name: def.name,
      count,
      pct,
      rawEvent: def.eventType,
    };
  });
}

export default async function SuperAdminPage() {
  const session = await getSession();
  const isAdmin = Boolean(session && session.role === "ADMIN");

  const [telemetry, calendarEvents, escrow] = await Promise.all([
    getFunnelTelemetry(),
    getAdminCalendarEvents(),
    getAdminEscrowOverview(),
  ]);

  const funnelSteps = buildFunnelSteps(telemetry);

  // GMV = total nilai order yang tidak dibatalkan. Dihitung dari escrow overview
  // (query admin-only yang sudah menyediakan daftar order ter-scope).
  const gmv =
    escrow?.orders
      .filter((o) => !["CANCELLED", "EXPIRED"].includes(o.status))
      .reduce((acc, o) => acc + o.totalAmount, 0) ?? 0;

  return (
    <AdminDashboardClient
      funnelSteps={funnelSteps}
      calendarEvents={calendarEvents}
      escrow={
        escrow
          ? {
              orders: escrow.orders.map((o) => ({
                id: o.id,
                orderNumber: o.orderNumber,
                clientName: o.clientName,
                status: o.status,
                totalAmount: o.totalAmount,
                eventDate: o.eventDate,
                itemCount: o.itemCount,
              })),
              journalCount: escrow.journalCount,
              totalDebit: escrow.totalDebit,
              totalCredit: escrow.totalCredit,
            }
          : null
      }
      gmv={gmv}
      isAdmin={isAdmin}
    />
  );
}
