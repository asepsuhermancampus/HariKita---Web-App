import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBudgetItems } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientBudget } from "./ClientBudget";

export const dynamic = "force-dynamic";

export default async function AnggaranPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login?callbackUrl=/client/anggaran");

  const items = await getBudgetItems();

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Anggaran & Realisasi"
        description="Susun rencana pengeluaran pernikahan, catat realisasi pembayaran, dan lampirkan bukti. Pos di luar layanan HariKita ditandai (ex-)."
      />
      <ClientBudget items={items} />
    </div>
  );
}
