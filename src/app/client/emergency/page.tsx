import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureWeddingPlannerSeeded } from "@/server/services/wedding-planner-seed";
import { getEmergencyItems } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientEmergency } from "./ClientEmergency";

export const dynamic = "force-dynamic";

export default async function EmergencyPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") redirect("/auth/login?callbackUrl=/client/emergency");

  await ensureWeddingPlannerSeeded(session.userId);
  const items = await getEmergencyItems();

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Emergency Kit & Tim Hari-H"
        description="Checklist tas darurat mempelai dan pembagian 3 peran rahasia keluarga inti."
      />
      <ClientEmergency items={items} />
    </div>
  );
}
