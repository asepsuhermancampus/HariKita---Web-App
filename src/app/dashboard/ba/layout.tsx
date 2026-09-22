import React from "react";
import { getAmbassadorSummary } from "@/server/queries/ambassador";
import { DashboardShell, BA_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Brand Ambassador | HariKita",
  description:
    "Portal Brand Ambassador HariKita: pantau vendor rekrutan, komisi, dan saldo dompet Anda.",
};

export default async function BaLayout({ children }: { children: React.ReactNode }) {
  await getAmbassadorSummary();
  return (
    <DashboardShell nav={BA_NAV} roleLabel="Brand Ambassador" homeHref="/dashboard/ba">
      {children}
    </DashboardShell>
  );
}
