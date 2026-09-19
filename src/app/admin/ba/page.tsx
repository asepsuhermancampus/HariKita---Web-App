import React from "react";
import type { Metadata } from "next";
import { listAmbassadors, listAmbassadorWithdrawals } from "@/server/queries/ambassador";
import { AdminBaClient } from "./AdminBaClient";

export const metadata: Metadata = {
  title: "Panel Brand Ambassador | HariKita",
  description: "Kelola Brand Ambassador, komisi, dan penarikan dompet di panel Super Admin HariKita.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Panel Admin Brand Ambassador — Server Component (admin-only).
 */
export default async function AdminBaPage() {
  const [ambassadors, pendingWithdrawals, allWithdrawals] = await Promise.all([
    listAmbassadors(),
    listAmbassadorWithdrawals("PENDING"),
    listAmbassadorWithdrawals("ALL"),
  ]);

  return (
    <AdminBaClient
      ambassadors={ambassadors}
      pendingWithdrawals={pendingWithdrawals}
      allWithdrawals={allWithdrawals}
    />
  );
}
