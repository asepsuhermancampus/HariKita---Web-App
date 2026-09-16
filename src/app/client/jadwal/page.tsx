import React from "react";
import {
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
  const [dbSessions, dbRundown] = await Promise.all([
    getClientPhysicalSessions(),
    getClientRundown(),
  ]);

  return <ClientJadwalClient dbSessions={dbSessions} dbRundown={dbRundown} />;
}
