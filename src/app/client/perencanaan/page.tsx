import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ensureWeddingPlannerSeeded } from "@/server/services/wedding-planner-seed";
import { getWeddingTasks, getWeddingReadiness } from "@/server/queries/wedding-planner";
import { DashPageHeader } from "@/components/dashboard";
import { ClientTimeline } from "./ClientTimeline";

export const dynamic = "force-dynamic";

export default async function PerencanaanPage() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") redirect("/auth/login?callbackUrl=/client/perencanaan");

  await ensureWeddingPlannerSeeded(session.userId);
  const [tasks, readiness] = await Promise.all([getWeddingTasks(), getWeddingReadiness()]);

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Timeline 7 Tahap Persiapan"
        description="Roadmap terstruktur dari 1 tahun sebelum hingga Hari H. Centang tiap tugas; progres tersimpan otomatis."
      />
      <ClientTimeline tasks={tasks} timelinePct={readiness.timeline.pct} />
    </div>
  );
}
