import React from "react";
import { getAdminOrderViewModels, getEscrowBalance } from "@/server/queries/orders";
import { AdminEscrowClient } from "./AdminEscrowClient";

export const dynamic = "force-dynamic";

/**
 * Otorisasi Escrow Admin — Server Component.
 * Sumber: database (admin-only). Bila kosong, klien jatuh ke mock store.
 */
export default async function AdminEscrowPage() {
  const [dbOrders, escrowBalance] = await Promise.all([
    getAdminOrderViewModels(),
    getEscrowBalance(),
  ]);

  return <AdminEscrowClient dbOrders={dbOrders} escrowBalance={escrowBalance} />;
}
