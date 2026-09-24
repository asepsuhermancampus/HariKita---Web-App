import React from "react";
import { getAmbassadorSummary } from "@/server/queries/ambassador";
import { getSession } from "@/lib/session";
import { DashboardShell, BA_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Brand Ambassador | HariKita",
  description:
    "Portal Brand Ambassador HariKita: pantau vendor rekrutan, komisi, dan saldo dompet Anda.",
};

export default async function BaLayout({ children }: { children: React.ReactNode }) {
  const [summary, session] = await Promise.all([getAmbassadorSummary(), getSession()]);
  const userName = summary?.displayName || session?.name || undefined;
  return (
    <DashboardShell
      nav={BA_NAV}
      roleLabel="Brand Ambassador"
      homeHref="/dashboard/ba"
      userName={userName}
    >
      {children}
    </DashboardShell>
  );
}
