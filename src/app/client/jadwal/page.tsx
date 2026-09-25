import React from "react";
import {
  getClientOrderViewModels,
  getClientPhysicalSessions,
  getClientRundown,
} from "@/server/queries/orders";
import { ClientJadwalClient } from "./ClientJadwalClient";

export const dynamic = "force-dynamic";

/**
 * Pelacak Sesi Fisik & Rundown — Server Component.
 * Sumber: database (PhysicalSession + EventRundown, owner-scoped).
 * Fallback mock tetap ada di klien bila belum ada data.
 */
export default async function Page() {
  const orders = await getClientOrderViewModels();
  const activeOrder = orders[0] ?? null;
  const [dbSessions, dbRundown] = activeOrder
    ? await Promise.all([
        getClientPhysicalSessions(activeOrder.id),
        getClientRundown(activeOrder.id),
      ])
    : [[], []];

  return <ClientJadwalClient activeOrder={activeOrder} dbSessions={dbSessions} dbRundown={dbRundown} />;
}
