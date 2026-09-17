import React from "react";
import { getAdminCalendarEvents } from "@/server/queries/orders";
import { AdminMasterKalenderPage } from "./AdminKalenderClient";

export const dynamic = "force-dynamic";

/**
 * Master Multi-Vendor Calendar Admin — Server Component.
 * Sumber tunggal: database (admin-only). Tidak ada data demo/baseline.
 */
export default async function Page() {
  const dbEvents = await getAdminCalendarEvents();
  return <AdminMasterKalenderPage dbEvents={dbEvents} />;
}
