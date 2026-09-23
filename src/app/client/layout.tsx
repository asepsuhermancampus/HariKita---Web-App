import React from "react";
import { getSession } from "@/lib/session";
import { DashboardShell, CLIENT_NAV } from "@/components/dashboard";

export const metadata = {
  title: "Portal Klien HariKita — Ekosistem Acara Kebumen",
  description:
    "Pusat pengelolaan profil pengantin, riwayat pesanan vendor, pelacak jadwal fitting & test food, dan undangan digital HariKita Kebumen.",
};

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <DashboardShell
      nav={CLIENT_NAV}
      roleLabel="Klien"
      homeHref="/client"
      userName={session?.name}
    >
      {children}
    </DashboardShell>
  );
}
