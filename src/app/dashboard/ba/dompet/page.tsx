import React from "react";
import { getAmbassadorSummary, getAmbassadorWithdrawals } from "@/server/queries/ambassador";
import { EmptyState } from "@/components/harikita/ui";
import { BaWalletClient } from "./BaWalletClient";

export const dynamic = "force-dynamic";

/**
 * Dompet komisi BA — Server Component memuat saldo & riwayat, form di client.
 */
export default async function BaWalletPage() {
  const [summary, withdrawals] = await Promise.all([
    getAmbassadorSummary(),
    getAmbassadorWithdrawals(),
  ]);

  if (!summary) {
    return (
      <div className="px-4 py-12">
        <EmptyState
          title="Profil BA tidak ditemukan"
          description="Akun Anda belum memiliki profil Brand Ambassador. Hubungi admin HariKita."
          icon="search"
        />
      </div>
    );
  }

  return <BaWalletClient summary={summary} withdrawals={withdrawals} />;
}
