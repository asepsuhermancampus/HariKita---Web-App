import React from "react";
import { getAdminCalendarEvents } from "@/server/queries/orders";
import { AdminMasterKalenderPage } from "./AdminKalenderClient";

export const dynamic = "force-dynamic";

/**
 * Master Multi-Vendor Calendar Admin — Server Component.
 * Sumber: database (admin-only). Basline/mock tetap dipertahankan di klien.
 */
export default async function Page() {
  const dbEvents = await getAdminCalendarEvents();
  return <AdminMasterKalenderPage dbEvents={dbEvents} />;
}
