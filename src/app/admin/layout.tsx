import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard";
import { getAdminNav } from "@/components/dashboard/nav-config";
import { loadAdminActor } from "@/server/auth/admin-guard";

export const metadata: Metadata = {
  title: "Super Admin — HariKita",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const actor = session ? await loadAdminActor(session.userId) : null;
  return (
    <DashboardShell
      nav={getAdminNav(actor?.subRole ?? null)}
      roleLabel="Super Admin"
      homeHref="/admin"
      userName={session?.name}
    >
      {children}
    </DashboardShell>
  );
}
