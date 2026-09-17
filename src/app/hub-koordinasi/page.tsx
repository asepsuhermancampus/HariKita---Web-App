import React, { Suspense } from "react";
import { getClientOrderViewModels } from "@/server/queries/orders";
import { HubKoordinasiClient } from "./HubKoordinasiClient";
import type { OrderSummaryDTO } from "@/server/queries/orders";

export const dynamic = "force-dynamic";

/**
 * Hub Koordinasi — Server Component.
 * Sumber acara: database (order klien, owner-scoped). Fallback mock bila kosong.
 */
export default async function Page() {
  const vms = await getClientOrderViewModels();
  const dbOrders: OrderSummaryDTO[] = vms.map((o) => ({
    id: o.id,
    orderNumber: o.bookingId,
    status: o.status,
    clientName: o.customerName,
    eventDate: o.eventDate,
    totalAmount: o.financials.totalAmount,
    itemCount: o.items.length,
    createdAt: o.createdAt,
  }));

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] text-hk-charcoal p-12 text-center text-xs font-manrope">
          Memuat Hub Koordinasi 9Router HariKita...
        </div>
      }
    >
      <HubKoordinasiClient dbOrders={dbOrders} />
    </Suspense>
  );
}
